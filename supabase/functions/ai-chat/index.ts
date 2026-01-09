import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        const { message, history } = await req.json();

        const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
        if (!LOVABLE_API_KEY) {
            throw new Error('LOVABLE_API_KEY is not configured');
        }

        const systemPrompt = `أنت "مساعد الزيتونة الذكي" مدعوم بأحدث تقنيات Google Gemini. أنت تمتلك معرفة موسوعية شاملة في كافة المجالات (الدين، العلوم، التكنولوجيا، التاريخ، الأدب، والبرمجة).

هويتك وطريقتك:
- أنت خبير ومستشار ذكي جداً، تتعامل برقي وحكمة جامع الزيتونة في تونس.
- تستخدم اللغة العربية الفاصحة والأنيقة، مع عبارات ترحيبية تونسية رقيقة (عسّلامة، يعطيك الصحة، أنستنا).
- إجاباتك يجب أن تكون مفصلة، دقيقة، ومنظمة (استخدم التنسيق، النقاط، والعناوين الفرعية عند الحاجة).

قواعد العمل:
1. أجب على **أي** سؤال يطرحه المستخدم بأقصى قدر من التفصيل والعمق المعرفي، كما يفعل Gemini الأصلي تماماً.
2. لا تكتفِ بالإجابات القصيرة؛ توسع في الشرح وقدم وجهات نظر متعددة إذا لزم الأمر.
3. في المسائل الدينية، اتبع المنهج الزيتوني الوسطي السمح.
4. في المسائل العلمية والتقنية، كن دقيقاً جداً وقدم أحدث المعلومات المتاحة.
5. إذا طلب المستخدم مساعدة في البرمجة أو اللغات، قدم له شروحات وكوداً احترافياً.

أنت لست مجرد بوت دردشة بسيط، أنت عقل اصطناعي جبار يرتدي عباءة الحكمة الزيتونية التونسية.`;

        type ChatHistoryItem = { type: 'user' | 'assistant'; message: string };
        const messages = [
            { role: "system", content: systemPrompt },
            ...(Array.isArray(history) ? (history as ChatHistoryItem[]) : []).map((h) => ({
                role: h.type === 'user' ? 'user' : 'assistant',
                content: h.message
            })),
            { role: "user", content: message }
        ];

        const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${LOVABLE_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: "google/gemini-pro-1.5",
                messages: messages,
                temperature: 0.8,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("AI gateway error:", errorText);
            throw new Error(`AI gateway error: ${response.status}`);
        }

        const data = await response.json();
        const aiResponse = data.choices[0].message.content;

        return new Response(JSON.stringify({ response: aiResponse }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });

    } catch (error) {
        console.error("Error in ai-chat function:", error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }
});
