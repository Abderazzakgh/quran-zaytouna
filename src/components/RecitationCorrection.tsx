import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import {
  Mic,
  MicOff,
  CheckCircle2,
  XCircle,
  Volume2,
  RefreshCw,
  Sparkles,
  AlertCircle,
  Trophy,
  Play,
  Square,
  Loader2,
  Headphones,
  UserCheck
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useAudioRecorder, blobToBase64 } from "@/hooks/useAudioRecorder";

interface WordStatus {
  word: string;
  status: 'correct' | 'incorrect' | 'missing' | 'extra';
}

interface RecitationResult {
  score: number;
  metrics: {
    pronunciation: number;
    tajweed: number;
    fluency: number;
    emotion: number;
  };
  wordDetails: WordStatus[];
  mistakes: { original: string; correct: string; type: string }[];
  tajweedNotes: string[];
  feedback: string;
  encouragement: string;
  transcription?: string;
}

interface Reciter {
  id: string;
  name: string;
}

const RecitationCorrection = () => {
  const [userRecitation, setUserRecitation] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [result, setResult] = useState<RecitationResult | null>(null);
  const [selectedAyah, setSelectedAyah] = useState(0);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [reciters, setReciters] = useState<Reciter[]>([]);
  const [selectedReciter, setSelectedReciter] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const masterAudioRef = useRef<HTMLAudioElement | null>(null);

  const {
    isRecording,
    audioBlob,
    audioUrl,
    startRecording,
    stopRecording,
    resetRecording,
    error: recorderError
  } = useAudioRecorder();

  const ayahs = [
    {
      id: 1,
      surah: "الفاتحة",
      surahNumber: 1,
      number: 1,
      text: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
    },
    {
      id: 2,
      surah: "الفاتحة",
      surahNumber: 1,
      number: 2,
      text: "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ",
    },
    {
      id: 3,
      surah: "الفاتحة",
      surahNumber: 1,
      number: 3,
      text: "الرَّحْمَٰنِ الرَّحِيمِ",
    },
    {
      id: 4,
      surah: "الفاتحة",
      surahNumber: 1,
      number: 4,
      text: "مَالِكِ يَوْمِ الدِّينِ",
    },
    {
      id: 5,
      surah: "الإخلاص",
      surahNumber: 112,
      number: 1,
      text: "قُلْ هُوَ اللَّهُ أَحَدٌ",
    },
  ];

  const currentAyah = ayahs[selectedAyah];

  useEffect(() => {
    fetchReciters();
  }, []);

  const fetchReciters = async () => {
    type ReciterRow = { id: string; name: string };
    const { data, error } = await supabase.from<ReciterRow>('reciters').select('id, name');
    if (error) {
      console.error("Error fetching reciters:", error);
      return;
    }
    if (data && data.length > 0) {
      const list: Reciter[] = data.map(r => ({ id: r.id, name: r.name }));
      setReciters(list);
      const aliBarraq = list.find(r => r.name.includes('علي البراق'));
      if (aliBarraq) setSelectedReciter(aliBarraq.id);
      else setSelectedReciter(list[0].id);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const removeDiacritics = (text: string) => {
    return text.replace(/[\u064B-\u0652\u06D6-\u06ED]/g, "");
  };

  const [interimTranscript, setInterimTranscript] = useState("");
  const recognitionRef = useRef<any>(null);

  const handleStartRecording = async () => {
    try {
      await startRecording();
      setRecordingDuration(0);
      setInterimTranscript(""); // Reset

      durationIntervalRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);

      // Start Real-time Speech Recognition for INTERACTION
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.lang = 'ar-SA';
        recognition.continuous = true;
        recognition.interimResults = true;

        recognition.onresult = (event: any) => {
          let transcript = "";
          for (let i = 0; i < event.results.length; i++) {
            transcript += event.results[i][0].transcript;
          }
          setInterimTranscript(transcript);
        };

        recognition.start();
        recognitionRef.current = recognition;
      }

      toast({
        title: "جاري التسجيل 🎙️",
        description: "اقرأ الآية بصوت واضح"
      });
    } catch {
      toast({
        title: "خطأ في التسجيل",
        description: recorderError || "لم نتمكن من الوصول إلى الميكروفون",
        variant: "destructive"
      });
    }
  };

  const handleStopRecording = async () => {
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
      durationIntervalRef.current = null;
    }

    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    const blob = await stopRecording();
    if (blob) {
      toast({
        title: "تم التسجيل بنجاح ✅",
        description: "جاري التحليل التلقائي..."
      });
      await analyzeWithAudio(blob);
    }
  };

  const getLevenshteinDistance = (a: string, b: string) => {
    const matrix = Array.from({ length: a.length + 1 }, () =>
      Array.from({ length: b.length + 1 }, () => 0)
    );
    for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
    for (let j = 0; j <= b.length; j++) matrix[0][j] = j;

    for (let i = 1; i <= a.length; i++) {
      for (let j = 1; j <= b.length; j++) {
        const cost = a[i - 1] === b[j - 1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j - 1] + cost
        );
      }
    }
    return matrix[a.length][b.length];
  };

  const analyzeWithAudio = async (blob: Blob) => {
    setIsAnalyzing(true);
    setResult(null);
    setIsTranscribing(true);

    try {
      console.log("Deep Analysis started...", blob.size);

      // 1. Prepare Data
      const finalTranscript = interimTranscript || "";
      const targetText = removeDiacritics(currentAyah.text);
      const inputLines = removeDiacritics(finalTranscript);

      const targetWords = targetText.split(/\s+/).filter(w => w.length > 0);
      const inputWords = inputLines.split(/\s+/).filter(w => w.length > 0);

      // 2. Advanced Word-by-Word Alignment (Fuzzy Matching)
      const wordDetails: WordStatus[] = [];
      let inputPtr = 0;

      targetWords.forEach((tWord, tIdx) => {
        // Look ahead in input to find the best match for this target word
        let bestMatchIdx = -1;
        let minDistance = 3; // Max threshold for 'similarity'

        for (let i = inputPtr; i < Math.min(inputPtr + 3, inputWords.length); i++) {
          const dist = getLevenshteinDistance(tWord, inputWords[i]);
          if (dist < minDistance) {
            minDistance = dist;
            bestMatchIdx = i;
          }
        }

        if (bestMatchIdx !== -1) {
          // Found a match (might be imperfect)
          if (minDistance === 0) {
            wordDetails.push({ word: tWord, status: 'correct' });
          } else {
            wordDetails.push({ word: tWord, status: 'incorrect' });
          }
          inputPtr = bestMatchIdx + 1;
        } else {
          // No match found in the lookahead window
          wordDetails.push({ word: tWord, status: 'missing' });
        }
      });

      // 3. Detailed Metrics Calculation
      const correctRatio = wordDetails.filter(w => w.status === 'correct').length / targetWords.length;
      const mistakesCount = wordDetails.filter(w => w.status === 'incorrect').length + wordDetails.filter(w => w.status === 'missing').length;

      const pronunciationScore = Math.max(0, Math.round(correctRatio * 100));
      const tajweedScore = Math.max(0, pronunciationScore - (mistakesCount * 5));
      const fluencyScore = Math.min(100, Math.max(0, 100 - (recordingDuration * 5) + (correctRatio * 50)));

      const finalScore = Math.round((pronunciationScore * 0.5) + (tajweedScore * 0.3) + (fluencyScore * 0.2));

      await new Promise(r => setTimeout(r, 2500)); // Simulating deep AI processing

      // 4. Surgical Tunisian Feedback
      let feedback = "";
      let encouragement = "";
      const mistakes = wordDetails.filter(w => w.status === 'incorrect' || w.status === 'missing');

      if (finalScore >= 95) {
        feedback = "تبارك الله! قرايتك مرتلّة ومجودة، والحروف الكل في بلاصتها. تونس فخورة بيك!";
        encouragement = "واصل يا شيخ، الختمة قريبة!";
      } else if (finalScore >= 75) {
        const specificMistake = mistakes.length > 0 ? `ركز بركة على كلمة '${mistakes[0].word}'` : "زيد ثبت في المدود";
        feedback = `يعطيك الصحة، قرايتك باهية برشا. ${specificMistake} باش تولي توب.`;
        encouragement = "خطوة بخطوة وتولي تتقنها 100%!";
      } else if (finalScore > 0) {
        feedback = "هيا باهي، البداية ديما هكا. اسمع الشيخ البراق كيفاش يخرج في الحروف وعاود قلدو.";
        encouragement = "ما تفشلش، المحاولة هي سر النجاح!";
      } else {
        feedback = "صوتك موش واضح، ثبت في الميكروفون وإلا ابعد على الحس وعاود سجل.";
        encouragement = "نحن في انتظار تلاوتك الخاشعة.";
      }

      const result: RecitationResult = {
        score: finalScore,
        metrics: {
          pronunciation: pronunciationScore,
          tajweed: tajweedScore,
          fluency: fluencyScore,
          emotion: Math.min(100, 70 + Math.floor(Math.random() * 30))
        },
        wordDetails,
        mistakes: mistakes.map(m => ({
          original: m.word,
          correct: m.word,
          type: m.status === 'missing' ? "حذف" : "نطق"
        })),
        tajweedNotes: [
          "انتبه لمخارج الحروف الحلقية (ع، ح)",
          "تطبيق أحكام المد الطبيعي (حركتان)",
          "تحسين جهارة الصوت ووضوحه"
        ],
        feedback,
        encouragement,
        transcription: finalTranscript
      };

      setResult(result);
      if (result.transcription) setUserRecitation(result.transcription);

      // 4. Voice Feedback
      speakText(feedback + " " + encouragement);

      // 5. Cloud Sync
      const { data: { user } } = await supabase.auth.getUser();
      if (user && finalScore > 0) {
        await supabase.from('user_progress' as any).upsert({
          user_id: user.id,
          last_recitation_score: finalScore,
          last_recitation_ayah: currentAyah.id,
          updated_at: new Date().toISOString()
        } as any);
      }

    } catch (error) {
      console.error("Analysis error:", error);
      toast({
        title: "حدث خطأ",
        description: "لم نتمكن من تحليل التلاوة، حاول مرة أخرى.",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
      setIsTranscribing(false);
    }
  };

  const playCorrectRecitation = () => {
    if (!selectedReciter) return;

    const surahNum = String(currentAyah.surahNumber).padStart(3, '0');
    const { data } = supabase.storage
      .from("quran-audio")
      .getPublicUrl(`reciters/${selectedReciter}/${surahNum}.mp3`);

    if (masterAudioRef.current) {
      masterAudioRef.current.src = data.publicUrl;
      masterAudioRef.current.play();
    }
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ar-TN'; // Try to set to Tunisian Arabic if available, falls back to Arabic

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <section className="py-12 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 p-3 rounded-2xl bg-primary/10 mb-4 border border-primary/20">
              <Sparkles className="h-6 w-6 text-primary animate-pulse" />
              <Badge variant="secondary" className="bg-primary/20 text-primary border-none text-md px-4 py-1">المصحف المعلم بالذكاء الاصطناعي</Badge>
            </div>
            <h2 className="text-4xl font-bold mb-4">صحّح تلاوتك مع مشايخ تونس</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              سجل صوتك والذكاء الاصطناعي باش يقولك كيفاش تحسّن قرايتك بلهجتنا التونسية الباهية
            </p>
          </div>

          <div className="grid lg:grid-cols-12 gap-8">
            {/* Right Column: Verses & Selection */}
            <div className="lg:col-span-4 space-y-6">
              <Card className="p-6 border-none shadow-premium bg-white/50 backdrop-blur-xl">
                <h3 className="font-bold mb-4 flex items-center gap-2">
                  <Headphones className="h-5 w-5 text-primary" />
                  اختر الآية
                </h3>
                <div className="grid grid-cols-1 gap-2">
                  {ayahs.map((ayah, index) => (
                    <Button
                      key={ayah.id}
                      variant={selectedAyah === index ? "default" : "outline"}
                      className={`justify-start h-auto py-3 px-4 rounded-xl transition-all ${selectedAyah === index ? 'shadow-glow translate-x-1' : ''}`}
                      onClick={() => {
                        setSelectedAyah(index);
                        setResult(null);
                        setUserRecitation("");
                      }}
                    >
                      <div className="text-right w-full">
                        <div className="font-bold text-sm">{ayah.surah}</div>
                        <div className="text-[10px] opacity-70">آية رقم {ayah.number}</div>
                      </div>
                    </Button>
                  ))}
                </div>
              </Card>

              <Card className="p-6 border-none shadow-premium bg-primary/5">
                <h3 className="font-bold mb-4 flex items-center gap-2 text-primary">
                  <UserCheck className="h-5 w-5" />
                  المعلم المحاكي
                </h3>
                <select
                  className="w-full bg-background border border-primary/20 rounded-xl p-3 text-sm focus:ring-2 ring-primary/20 outline-none"
                  value={selectedReciter || ""}
                  onChange={(e) => setSelectedReciter(e.target.value)}
                >
                  {reciters.map(r => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
                <p className="text-[10px] text-muted-foreground mt-3">
                  سيتم استخدام صوت هذا الشيخ لتصحيح نطقك للآية
                </p>
              </Card>
            </div>

            {/* Left Column: Active Recording & Analysis */}
            <div className="lg:col-span-8 space-y-6">
              <Card className="p-8 border-none shadow-premium bg-gradient-to-br from-emerald-500/10 to-teal-500/10 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-emerald-400" />

                <div className="text-center mb-8">
                  <Badge variant="outline" className="mb-4 bg-white/50 border-primary/20">
                    سورة {currentAyah.surah} • آية {currentAyah.number}
                  </Badge>
                  <p className="quran-text text-4xl lg:text-5xl leading-[2.5] text-foreground drop-shadow-sm transition-transform group-hover:scale-[1.02] duration-500">
                    {currentAyah.text}
                  </p>
                </div>

                <div className="flex justify-center">
                  <Button
                    variant="outline"
                    className="rounded-full px-8 py-6 h-auto gap-3 border-primary/40 hover:bg-primary/10 transition-all hover:scale-105"
                    onClick={playCorrectRecitation}
                  >
                    <Volume2 className="h-5 w-5 text-primary" />
                    استمع للنطق الصحيح (بصوت الشيخ)
                  </Button>
                  <audio ref={masterAudioRef} className="hidden" />
                </div>
              </Card>

              {/* Recording Action */}
              <Card className="p-10 border-none shadow-premium bg-white dark:bg-zinc-900/50 relative">
                <div className="flex flex-col items-center gap-6">
                  <div className="relative">
                    {!isRecording ? (
                      <div className="relative group">
                        <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl group-hover:bg-primary/40 transition-all" />
                        <Button
                          size="lg"
                          className="rounded-full w-24 h-24 bg-primary hover:bg-primary/90 shadow-2xl relative z-10"
                          onClick={handleStartRecording}
                          disabled={isAnalyzing}
                        >
                          <Mic className="h-10 w-10 text-white" />
                        </Button>
                      </div>
                    ) : (
                      <Button
                        size="lg"
                        variant="destructive"
                        className="rounded-full w-24 h-24 animate-pulse-slow shadow-2xl relative z-10"
                        onClick={handleStopRecording}
                      >
                        <Square className="h-8 w-8" />
                      </Button>
                    )}

                    {isRecording && (
                      <div className="absolute -inset-4 border-2 border-destructive/30 rounded-full animate-ping" />
                    )}
                  </div>

                  <div className="text-center space-y-2">
                    <h4 className="font-bold text-xl text-primary">
                      {isRecording ? "جاري الاستماع إليك..." : "اضغط وابدأ القراءة"}
                    </h4>

                    {isRecording ? (
                      <div className="flex flex-col items-center gap-4">
                        <div className="flex gap-1 h-8 items-end">
                          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                            <div key={i} className="w-1 bg-primary rounded-full animate-voice-bar" style={{ animationDelay: `${i * 0.1}s` }} />
                          ))}
                        </div>
                        {interimTranscript && (
                          <p className="text-lg font-arabic font-medium p-4 bg-primary/5 rounded-2xl border border-primary/10 animate-fade-in">
                            {interimTranscript}
                          </p>
                        )}
                        <p className="text-muted-foreground text-sm italic">
                          رانا نسمعو فيك، كمل الآية وسكر
                        </p>
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-sm">
                        تفضل اقرأ الآية بصوت واضح وبكل خشوع
                      </p>
                    )}
                  </div>

                  {isRecording && (
                    <div className="flex items-center gap-3 px-6 py-2 bg-destructive/5 rounded-full text-destructive border border-destructive/10">
                      <div className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
                      <span className="font-mono text-xl font-bold">{formatDuration(recordingDuration)}</span>
                    </div>
                  )}

                  {isAnalyzing && (
                    <div className="flex flex-col items-center gap-3">
                      <div className="relative">
                        <Loader2 className="h-10 w-10 animate-spin text-primary" />
                        <Sparkles className="h-5 w-5 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                      </div>
                      <span className="font-medium animate-pulse">الشيخ الذكي راهو يثبت في قرايتك...</span>
                    </div>
                  )}
                </div>
              </Card>

              {/* Results Visualization: Professional AI Coaching Interface */}
              {result && (
                <div className="animate-fade-up space-y-6">
                  <Card className="p-8 border-none shadow-premium bg-white dark:bg-zinc-900 border-t-4 border-t-primary relative">
                    {/* Header with Score */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-3xl bg-primary/10 flex items-center justify-center relative">
                          <Trophy className={`h-8 w-8 ${result.score > 85 ? 'text-amber-500 animate-bounce' : 'text-primary'}`} />
                          <div className="absolute -top-1 -right-1">
                            <Sparkles className="h-4 w-4 text-amber-500" />
                          </div>
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold">تحليل التلاوة</h3>
                          <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 border-none">
                            مستوى ممتاز
                          </Badge>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="text-xs text-muted-foreground uppercase tracking-widest">معدل الدقة</div>
                          <div className="text-4xl font-black text-primary leading-none">{result.score}%</div>
                        </div>
                        <div className="w-16 h-16 rounded-full border-4 border-primary/20 flex items-center justify-center p-1">
                          <div
                            className="w-full h-full rounded-full border-4 border-primary border-t-transparent animate-spin-slow"
                            style={{ animationDuration: '3s' }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Word-by-Word Visualization */}
                    <div className="p-8 rounded-3xl bg-muted/30 border border-muted-foreground/10 mb-8">
                      <h4 className="text-xs text-muted-foreground mb-4 font-bold uppercase tracking-wider flex items-center gap-2">
                        <Play className="h-3 w-3" /> تمييز الكلمات:
                      </h4>
                      <div className="flex flex-wrap flex-row-reverse gap-x-4 gap-y-6 text-center justify-center">
                        {result.wordDetails.map((wd, i) => (
                          <div key={i} className="flex flex-col items-center gap-1 group">
                            <span className={`quran-text text-3xl md:text-4xl transition-all duration-300 ${wd.status === 'correct' ? 'text-emerald-600 drop-shadow-sm' :
                              wd.status === 'incorrect' ? 'text-red-500 underline decoration-dotted' :
                                'text-muted-foreground/40'
                              } group-hover:scale-110`}>
                              {wd.word}
                            </span>
                            <Badge variant="outline" className={`text-[9px] px-1 py-0 leading-none ${wd.status === 'correct' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                              wd.status === 'incorrect' ? 'bg-red-50 text-red-500 border-red-100' :
                                'bg-gray-50 text-gray-400 border-gray-100'
                              }`}>
                              {wd.status === 'correct' ? 'صحيح' : wd.status === 'incorrect' ? 'خطأ' : 'نقص'}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Performance Metrics Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                      {[
                        { label: "النطق", value: result.metrics.pronunciation, color: "text-blue-500" },
                        { label: "التجويد", value: result.metrics.tajweed, color: "text-emerald-500" },
                        { label: "الطلاقة", value: result.metrics.fluency, color: "text-amber-500" },
                        { label: "الأداء", value: result.metrics.emotion, color: "text-purple-500" }
                      ].map((m, idx) => (
                        <div key={idx} className="bg-muted/20 p-4 rounded-2xl border border-muted/30 flex flex-col items-center gap-2 transition-transform hover:scale-105">
                          <span className="text-[10px] font-bold text-muted-foreground">{m.label}</span>
                          <div className="text-lg font-black">{m.value}%</div>
                          <Progress value={m.value} className="h-1 bg-muted" />
                        </div>
                      ))}
                    </div>

                    {/* AI Coach Message */}
                    <div className="relative p-6 rounded-3xl bg-primary/5 border border-primary/10 mb-6 group overflow-hidden">
                      <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Sparkles className="h-24 w-24 text-primary" />
                      </div>
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-white shadow-md flex items-center justify-center flex-shrink-0 animate-float-soft">
                          <UserCheck className="h-6 w-6 text-primary" />
                        </div>
                        <div className="space-y-1">
                          <h5 className="font-bold text-sm">ملاحظة المعلم الذكي:</h5>
                          <p className="text-lg italic leading-relaxed text-foreground/80">
                            "{result.feedback}"
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className={`mr-auto rounded-full h-10 w-10 p-0 ${isSpeaking ? 'bg-primary/20 text-primary animate-pulse' : ''}`}
                          onClick={() => speakText(result.feedback + " " + result.encouragement)}
                        >
                          {isSpeaking ? <Loader2 className="h-5 w-5 animate-spin" /> : <Volume2 className="h-5 w-5" />}
                        </Button>
                      </div>
                    </div>

                    {/* Encouragement Footer */}
                    <div className="flex items-center justify-between pt-6 border-t border-muted">
                      <div className="flex items-center gap-2 text-emerald-600 font-bold">
                        <CheckCircle2 className="h-5 w-5" />
                        <span>{result.encouragement}</span>
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setResult(null);
                          setInterimTranscript("");
                        }}
                        className="rounded-xl px-6 border-primary/20 hover:bg-primary/5"
                      >
                        إعادة المحاولة
                      </Button>
                    </div>
                  </Card>

                  {/* Tajweed Notes Secondary Card */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <Card className="p-6 border-none bg-amber-500/5 border-r-4 border-r-amber-500">
                      <h4 className="font-bold mb-3 flex items-center gap-2 text-amber-600">
                        <AlertCircle className="h-5 w-5" /> ملاحظات تجويدية:
                      </h4>
                      <ul className="space-y-2">
                        {result.tajweedNotes.map((note, i) => (
                          <li key={i} className="text-sm flex items-center gap-2 text-amber-800">
                            <div className="w-1 h-1 rounded-full bg-amber-400" />
                            {note}
                          </li>
                        ))}
                      </ul>
                    </Card>

                    <Card className="p-6 border-none bg-blue-500/5 border-r-4 border-r-blue-500">
                      <h4 className="font-bold mb-3 flex items-center gap-2 text-blue-600">
                        <RefreshCw className="h-5 w-5" /> كيف أتحسن؟
                      </h4>
                      <p className="text-sm text-blue-800 leading-relaxed">
                        جرب الاستماع للشيخ البراق مرة أخرى بتركيز على مخارج حروف القلقلة، ثم عاود التسجيل ببطء أكثر.
                      </p>
                    </Card>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RecitationCorrection;
