import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Process base64 in chunks to prevent memory issues
function processBase64Chunks(base64String: string, chunkSize = 32768): Uint8Array {
  const chunks: Uint8Array[] = [];
  let position = 0;

  while (position < base64String.length) {
    const chunk = base64String.slice(position, position + chunkSize);
    const binaryChunk = atob(chunk);
    const bytes = new Uint8Array(binaryChunk.length);

    for (let i = 0; i < binaryChunk.length; i++) {
      bytes[i] = binaryChunk.charCodeAt(i);
    }

    chunks.push(bytes);
    position += chunkSize;
  }

  const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;

  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }

  return result;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { userRecitation, correctText, ayahInfo, audio, transcribeOnly } = body;

    console.log("Received recitation check request:", {
      hasUserRecitation: !!userRecitation,
      hasAudio: !!audio,
      transcribeOnly,
      correctText,
      ayahInfo
    });

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // If audio is provided, transcribe it first using Gemini's audio capabilities
    let transcription = userRecitation;

    if (audio) {
      console.log("Processing audio for transcription...");

      try {
        // Use Gemini for Arabic audio transcription
        const transcribeResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash",
            messages: [
              {
                role: "system",
                content: `أنت متخصص في تحويل الصوت العربي إلى نص. مهمتك تحويل تلاوة القرآن المسموعة إلى نص عربي دقيق.
- أعد النص العربي فقط بدون أي شرح
- استخدم التشكيل الكامل إن أمكن
- إذا لم تتمكن من فهم الصوت، أعد النص: "لم أتمكن من فهم التسجيل"`
              },
              {
                role: "user",
                content: [
                  {
                    type: "text",
                    text: "استمع لهذا التسجيل الصوتي لتلاوة قرآنية وحوّله إلى نص عربي مكتوب:"
                  },
                  {
                    type: "input_audio",
                    input_audio: {
                      data: audio,
                      format: "webm"
                    }
                  }
                ]
              }
            ],
            temperature: 0.1,
          }),
        });

        if (transcribeResponse.ok) {
          const transcribeData = await transcribeResponse.json();
          transcription = transcribeData.choices[0].message.content.trim();
          console.log("Transcription result:", transcription);
        } else {
          console.error("Transcription failed:", await transcribeResponse.text());
          // Fall back to user input or empty
          transcription = userRecitation || "";
        }
      } catch (transcribeError) {
        console.error("Transcription error:", transcribeError);
        transcription = userRecitation || "";
      }
    }

    // If only transcription was requested, return it
    if (transcribeOnly) {
      return new Response(JSON.stringify({ transcription }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // If no transcription and no user input, return error
    if (!transcription || transcription === "لم أتمكن من فهم التسجيل") {
      return new Response(JSON.stringify({
        error: "لم نتمكن من فهم التسجيل، يرجى المحاولة مرة أخرى أو كتابة النص يدوياً"
      }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const systemPrompt = `أنت معلم قرآن خبير من جامع الزيتونة المعمور متخصص في تصحيح التلاوة برواية قالون عن نافع. مهمتك:
1. مقارنة تلاوة المستخدم بالنص الصحيح.
2. تحديد الأخطاء بدقة (في الحروف، التشكيل، المد، الغنة).
3. تقديم ملاحظات بناءة ومشجعة بالدارجة التونسية (اللّهجة التونسية) بأسلوب حبّي وقريب للقلب كما يفعل مشايخ الزيتونة.
4. تقييم مستوى التلاوة من 0 إلى 100.

يجب أن تكون ردودك (التقييم والتشجيع) بالدارجة التونسية.
مثلاً: "يعطيك الصحة قرايتك باهية"، "ثبّت شوية في المد"، "ولدي العزيز واصل هكا".`;

    const userPrompt = `النص الصحيح للآية:
"${correctText}"

معلومات الآية: ${ayahInfo}

تلاوة المستخدم:
"${transcription}"

قم بتحليل التلاوة وتقديم:
1. نسبة الدقة (من 0 إلى 100)
2. قائمة بالأخطاء إن وجدت مع التصحيح
3. ملاحظات على التجويد
4. نصيحة للتحسين

أعط الرد بصيغة JSON كالتالي:
{
  "score": number,
  "mistakes": [{"original": "الخطأ", "correct": "الصواب", "type": "نوع الخطأ"}],
  "tajweedNotes": ["ملاحظة 1", "ملاحظة 2"],
  "feedback": "التقييم العام",
  "encouragement": "رسالة تشجيعية"
}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);

      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "تم تجاوز حد الطلبات، يرجى المحاولة لاحقاً" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "يرجى إضافة رصيد للحساب" }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    console.log("AI response received:", data);

    const aiResponse = data.choices[0].message.content;

    // Try to parse JSON from response
    let result;
    try {
      // Extract JSON from the response
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0]);
      } else {
        result = {
          score: 70,
          mistakes: [],
          tajweedNotes: [],
          feedback: aiResponse,
          encouragement: "استمر في التدريب!"
        };
      }
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      result = {
        score: 70,
        mistakes: [],
        tajweedNotes: [],
        feedback: aiResponse,
        encouragement: "استمر في التدريب!"
      };
    }

    // Add transcription to result if audio was processed
    if (audio) {
      result.transcription = transcription;
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error in recitation-check function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
