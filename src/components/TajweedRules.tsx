import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  BookOpen,
  Volume2,
  CheckCircle2,
  Play,
  Lightbulb,
  Award,
  Star,
  Brain,
  HelpCircle,
  RotateCcw,
  Sparkles,
  GraduationCap,
  Trophy,
  Target,
  Mic,
  Music,
  Scroll,
  Info
} from "lucide-react";

import { useState, useCallback, useRef } from "react";
import { toast } from "sonner";
import {
  tajweedCategories,
  matnsData,
  type MatnContent
} from "@/data/tajweedContent";

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  ruleName: string;
}

const TajweedRules = () => {
  const [selectedRule, setSelectedRule] = useState<string | null>(null);
  const [completedRules, setCompletedRules] = useState<string[]>([]);
  const [quizMode, setQuizMode] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [practiceStreak, setPracticeStreak] = useState(0);
  const [selectedMatn, setSelectedMatn] = useState<MatnContent | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const markAsLearned = (ruleName: string) => {
    if (!completedRules.includes(ruleName)) {
      setCompletedRules([...completedRules, ruleName]);
      setPracticeStreak(prev => prev + 1);
      toast.success(`أحسنت! أتقنت حكم "${ruleName}"`, {
        description: `سلسلة التعلم: ${practiceStreak + 1} أحكام متتالية 🔥`
      });
    }
  };

  const toggleMatnAudio = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const quizQuestions: QuizQuestion[] = [
    {
      question: "ما هو مخرج حروف المد الثلاثة (الألف والواو والياء الساكنة)؟",
      options: ["اللسان", "الحلق", "الجوف", "الخيشوم"],
      correctAnswer: 2,
      explanation: "حروف المد تخرج من الجوف، وهو خلاء الفم والحلق",
      ruleName: "الجوف"
    },
    {
      question: "من أي منطقة في الحلق تخرج الهمزة والهاء؟",
      options: ["أقصى الحلق", "وسط الحلق", "أدنى الحلق", "حافة اللسان"],
      correctAnswer: 0,
      explanation: "الهمزة والهاء يخرجان من أقصى الحلق، وهو الأبعد عن الفم",
      ruleName: "الحلق"
    },
    {
      question: "ما هي حروف القلقلة؟",
      options: ["سكت حثه", "قطب جد", "يرملون", "ء هـ ع ح"],
      correctAnswer: 1,
      explanation: "حروف القلقلة خمسة، يجمعها قولك (قطب جد)",
      ruleName: "القلقلة"
    },
    {
      question: "ما هو مخرج الغنة؟",
      options: ["الجوف", "الحلق", "الخيشوم", "الشفتان"],
      correctAnswer: 2,
      explanation: "مخرج الغنة هو الخيشوم، وهو خرق الأنف المنجذب للداخل",
      ruleName: "الخيشوم"
    }
  ];

  const generateSmartHint = useCallback((ruleName: string) => {
    const hints: Record<string, string[]> = {
      "الجوف": ["مد النفس بسلاسة دون ضغط", "تذكر أن الهواء ينتهي وحده"],
      "الحلق": ["ابحث عن مخرج الحرف في عمق رقبتك", "لا تبالغ في الضغط على حروف الحلق"],
      "القلقلة": ["اجعل الصوت يضطرب بقوة عند السكون", "تجنب إضافة حركة للقلقلة"]
    };
    return hints[ruleName] || ["تدرب على هذا الحكم بالتكرار والاستماع"];
  }, []);

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
    setShowExplanation(true);
    if (answerIndex === quizQuestions[currentQuestionIndex].correctAnswer) {
      setScore(prev => prev + 1);
      toast.success("إجابة صحيحة! 🎉");
    } else {
      toast.error("إجابة خاطئة، راجع الشرح");
    }
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < quizQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } else {
      setQuizCompleted(true);
    }
  };

  const resetQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setScore(0);
    setQuizCompleted(false);
  };

  const totalRules = tajweedCategories.reduce((acc, cat) => acc + cat.rules.length, 0);
  const progressPercentage = (completedRules.length / totalRules) * 100;

  return (
    <section className="py-12" id="tajweed">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 p-2 rounded-full bg-primary/10 mb-4">
              <BookOpen className="h-5 w-5 text-primary" />
              <Badge variant="secondary">مدرسة التجويد الإلكترونية</Badge>
            </div>
            <h2 className="text-4xl font-bold mb-4">أحكام التجويد والعلوم الشرعية</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-6">
              منهج شامل لتعلم مخارج الحروف وصفاتها برواية قالون عن نافع، مع المتون العلمية الأصيلة
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto mb-8 text-right font-bold">
              <Card className="p-4 bg-emerald-500/5 border-emerald-500/20">
                <GraduationCap className="h-6 w-6 text-emerald-500 mx-auto mb-2" />
                <p className="text-2xl">{completedRules.length}</p>
                <p className="text-xs text-muted-foreground uppercase">أحكام تامة</p>
              </Card>
              <Card className="p-4 bg-blue-500/5 border-blue-500/20">
                <Target className="h-6 w-6 text-blue-500 mx-auto mb-2" />
                <p className="text-2xl">{totalRules - completedRules.length}</p>
                <p className="text-xs text-muted-foreground uppercase">متبقية</p>
              </Card>
              <Card className="p-4 bg-amber-500/5 border-amber-500/20">
                <Sparkles className="h-6 w-6 text-amber-500 mx-auto mb-2" />
                <p className="text-2xl">{practiceStreak}</p>
                <p className="text-xs text-muted-foreground uppercase">سلسلة التعلم</p>
              </Card>
              <Card className="p-4 bg-purple-500/5 border-purple-500/20">
                <Trophy className="h-6 w-6 text-purple-500 mx-auto mb-2" />
                <p className="text-2xl">{Math.round(progressPercentage)}%</p>
                <p className="text-xs text-muted-foreground uppercase">الإنجاز</p>
              </Card>
            </div>

            <div className="flex justify-center gap-4 mt-6">
              <Button
                variant={!quizMode && !selectedMatn ? "default" : "outline"}
                onClick={() => { setQuizMode(false); setSelectedMatn(null); }}
                className="gap-2"
              >
                <BookOpen className="h-4 w-4" />
                وضع التعلم
              </Button>
              <Button
                variant={selectedMatn ? "default" : "outline"}
                onClick={() => { setQuizMode(false); setSelectedMatn(matnsData[0]); }}
                className="gap-2"
              >
                <Scroll className="h-4 w-4" />
                المتون العلمية
              </Button>
              <Button
                variant={quizMode ? "default" : "outline"}
                onClick={() => { setQuizMode(true); setSelectedMatn(null); resetQuiz(); }}
                className="gap-2"
              >
                <Brain className="h-4 w-4" />
                اختبار ذكي
              </Button>
            </div>
          </div>

          {/* Matn Viewer Section */}
          {selectedMatn && !quizMode && (
            <div className="max-w-4xl mx-auto mb-12 animate-fade-in text-right">
              <div className="flex flex-wrap gap-2 mb-6 justify-center">
                {matnsData.map((m) => (
                  <Button
                    key={m.id}
                    variant={selectedMatn.id === m.id ? "default" : "secondary"}
                    onClick={() => { setSelectedMatn(m); setIsPlaying(false); }}
                    className="gap-2"
                  >
                    <Music className="h-4 w-4" />
                    {m.title}
                  </Button>
                ))}
              </div>

              <Card className="p-8 bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16" />

                <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8 relative z-10">
                  <div className="text-center md:text-right">
                    <h3 className="text-3xl font-bold text-primary mb-2 flex items-center gap-3 justify-center md:justify-end">
                      {selectedMatn.title}
                      <Scroll className="h-6 w-6 opacity-50" />
                    </h3>
                    <p className="text-lg font-medium text-muted-foreground">نظم: {selectedMatn.author}</p>
                    <p className="text-sm opacity-80 mt-2 max-w-lg">{selectedMatn.description}</p>
                  </div>

                  <div className="flex flex-col items-center gap-3">
                    <audio
                      ref={audioRef}
                      src={selectedMatn.audioUrl}
                      onEnded={() => setIsPlaying(false)}
                      onError={() => {
                        setIsPlaying(false);
                        toast.error("تعذّر تحميل الصوت (تحقق من المصدر)");
                      }}
                      crossOrigin="anonymous"
                    />
                    <Button
                      size="lg"
                      variant="default"
                      className="h-20 w-20 rounded-full shadow-2xl hover:scale-105 transition-all bg-islamic hover:bg-islamic/90 group"
                      onClick={toggleMatnAudio}
                    >
                      {isPlaying ? (
                        <div className="flex gap-1 items-center">
                          <span className="w-1.5 h-6 bg-white animate-bounce" />
                          <span className="w-1.5 h-8 bg-white animate-bounce delay-75" />
                          <span className="w-1.5 h-6 bg-white animate-bounce delay-150" />
                        </div>
                      ) : (
                        <Play className="h-10 w-10 ml-2 text-white" />
                      )}
                    </Button>
                    <div className="text-center">
                      <span className="text-xs font-bold text-primary block">استمع للمتن</span>
                      <span className="text-[10px] text-muted-foreground">بصوت عذب ومتقن</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 max-h-[600px] overflow-y-auto p-6 bg-background/40 backdrop-blur-sm rounded-2xl border custom-scrollbar">
                  {selectedMatn.verses.map((v) => (
                    <div
                      key={v.id}
                      className="p-5 rounded-xl bg-white/50 dark:bg-black/20 hover:bg-primary/5 transition-all border border-transparent hover:border-primary/20 group relative"
                    >
                      <div className="flex items-center gap-6">
                        <Badge variant="outline" className="h-9 w-9 rounded-full border-primary/30 text-primary shrink-0 flex items-center justify-center font-bold text-base shadow-sm">
                          {v.id}
                        </Badge>
                        <p className="text-2xl md:text-3xl font-quran text-right leading-[1.8] w-full text-islamic selection:bg-islamic/20">
                          {v.text}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {/* Learning Mode */}
          {!quizMode && !selectedMatn && (
            <Tabs defaultValue="makharij" className="w-full">
              <TabsList className="grid w-full grid-cols-3 lg:grid-cols-3 mb-8 h-auto gap-4 p-1 bg-muted/50 rounded-xl">
                {tajweedCategories.map((cat) => (
                  <TabsTrigger key={cat.id} value={cat.id} className="py-3 px-6 text-base font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg transition-all">
                    {cat.title}
                  </TabsTrigger>
                ))}
              </TabsList>

              {tajweedCategories.map((cat) => (
                <TabsContent key={cat.id} value={cat.id} className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="grid md:grid-cols-2 gap-6">
                    {cat.rules.map((rule, idx) => (
                      <Card
                        key={idx}
                        className={`p-6 transition-all hover:shadow-xl border-2 ${selectedRule === rule.name ? 'border-primary ring-1 ring-primary/20' : 'border-transparent'
                          } ${completedRules.includes(rule.name) ? 'bg-emerald-50/50 dark:bg-emerald-950/10 border-emerald-500/20' : 'bg-card'}`}
                        onClick={() => setSelectedRule(selectedRule === rule.name ? null : rule.name)}
                      >
                        <div className="flex items-start gap-4">
                          <div className={`w-14 h-14 rounded-2xl ${rule.color} flex items-center justify-center text-white shadow-lg relative shrink-0`}>
                            <Info className="h-6 w-6" />
                            {completedRules.includes(rule.name) && (
                              <div className="absolute -top-2 -right-2 bg-emerald-500 rounded-full p-1 shadow-md border-2 border-white dark:border-slate-900">
                                <CheckCircle2 className="h-4 w-4 text-white" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 text-right">
                            <h3 className="text-xl font-bold mb-2">{rule.name}</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed mb-4">{rule.description}</p>

                            <div className="flex flex-wrap gap-2 mb-4 justify-end">
                              {rule.letters && <Badge variant="outline" className="text-xs bg-muted/30">{rule.letters}</Badge>}
                              <Badge variant="secondary" className="text-xs">مثال: {rule.example}</Badge>
                            </div>

                            <div className="bg-primary/5 p-3 rounded-lg mb-4 flex items-start gap-2 justify-end">
                              <p className="text-xs text-primary font-medium">{rule.qalunNote}</p>
                              <Star className="h-4 w-4 text-primary shrink-0" />
                            </div>

                            {selectedRule === rule.name && (
                              <div className="pt-4 border-t space-y-4 animate-in fade-in slide-in-from-top-2">
                                <div className="bg-blue-500/5 p-3 rounded-lg flex items-center gap-3 justify-end text-blue-600">
                                  <p className="text-sm font-bold">{rule.audioExample}</p>
                                  <Volume2 className="h-4 w-4" />
                                </div>

                                <div className="flex flex-wrap gap-2 justify-end">
                                  <Button size="sm" variant="outline" className="gap-2" onClick={(e) => { e.stopPropagation(); toast.info("استمع للمثال..."); }}>
                                    <Play className="h-3 w-3" /> استماع
                                  </Button>
                                  <Button size="sm" variant="outline" className="gap-2" onClick={(e) => {
                                    e.stopPropagation();
                                    const recCtor =
                                      (window as unknown as {
                                        SpeechRecognition?: new () => SpeechRecognition;
                                        webkitSpeechRecognition?: new () => SpeechRecognition;
                                      }).SpeechRecognition ||
                                      (window as unknown as {
                                        SpeechRecognition?: new () => SpeechRecognition;
                                        webkitSpeechRecognition?: new () => SpeechRecognition;
                                      }).webkitSpeechRecognition;
                                    if (recCtor) {
                                      const recognition = new recCtor();
                                      recognition.lang = 'ar-SA';
                                      recognition.onstart = () => toast.info("استمع إليك...");
                                      recognition.onresult = (e: SpeechRecognitionEvent) => {
                                        const transcript = e.results?.[0]?.[0]?.transcript ?? "";
                                        toast.success(`نطق رائع: ${transcript}`);
                                        markAsLearned(rule.name);
                                      };
                                      recognition.start();
                                    } else toast.error("متصفحك لا يدعم التعرف على الصوت");
                                  }}>
                                    <Mic className="h-3 w-3" /> تدرب
                                  </Button>
                                  <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700" onClick={(e) => { e.stopPropagation(); markAsLearned(rule.name); }}>
                                    أتقنت الحكم
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          )}

          {/* Quiz Mode */}
          {quizMode && (
            <div className="max-w-2xl mx-auto animate-fade-in">
              {!quizCompleted ? (
                <Card className="p-8 shadow-2xl border-primary/20">
                  <div className="flex items-center justify-between mb-8">
                    <Badge variant="outline" className="px-4 py-1 text-sm">السؤال {currentQuestionIndex + 1} / {quizQuestions.length}</Badge>
                    <Badge className="bg-primary/10 text-primary px-4 py-1 text-sm font-bold">النقاط: {score}</Badge>
                  </div>
                  <h3 className="text-2xl font-bold mb-8 text-center leading-relaxed font-quran">{quizQuestions[currentQuestionIndex].question}</h3>
                  <div className="grid gap-4">
                    {quizQuestions[currentQuestionIndex].options.map((opt, i) => (
                      <Button
                        key={i}
                        variant="outline"
                        className={`h-auto py-5 px-6 text-lg text-right justify-start gap-4 transition-all border-2 ${selectedAnswer !== null
                            ? i === quizQuestions[currentQuestionIndex].correctAnswer
                              ? 'border-emerald-500 bg-emerald-500/10'
                              : selectedAnswer === i ? 'border-red-500 bg-red-500/10' : ''
                            : 'hover:border-primary hover:bg-primary/5'
                          }`}
                        onClick={() => selectedAnswer === null && handleAnswerSelect(i)}
                        disabled={selectedAnswer !== null}
                      >
                        <span className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-bold">{i + 1}</span>
                        {opt}
                      </Button>
                    ))}
                  </div>
                  {showExplanation && (
                    <div className="mt-8 p-6 bg-muted/40 rounded-2xl border animate-in zoom-in duration-300">
                      <div className="flex items-start gap-3 justify-end text-right">
                        <div>
                          <p className="font-bold text-primary mb-2">الشرح التعليمي:</p>
                          <p className="text-muted-foreground">{quizQuestions[currentQuestionIndex].explanation}</p>
                        </div>
                        <Lightbulb className="h-6 w-6 text-amber-500 shrink-0 mt-1" />
                      </div>
                      <Button onClick={nextQuestion} className="w-full mt-6 h-12 text-lg font-bold">
                        {currentQuestionIndex < quizQuestions.length - 1 ? 'السؤال التالي' : 'عرض النتيجة النهائية'}
                      </Button>
                    </div>
                  )}
                </Card>
              ) : (
                <Card className="p-10 text-center shadow-2xl bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
                  <div className="relative inline-block mb-8">
                    <Trophy className="h-28 w-28 text-amber-500 animate-bounce" />
                    <Sparkles className="h-10 w-10 text-amber-400 absolute -top-4 -right-4 animate-pulse" />
                  </div>
                  <h3 className="text-3xl font-bold mb-4">تبارك الله! انتهى الاختبار</h3>
                  <div className="text-6xl font-black text-primary mb-6">{score} / {quizQuestions.length}</div>
                  <Progress value={(score / quizQuestions.length) * 100} className="h-3 mb-8" />
                  <p className="text-xl text-muted-foreground mb-8">
                    {score === quizQuestions.length ? 'إنجاز عظيم! لقد أتقنت جميع مبادئ التجويد' : 'أداء ممتاز، استمر في المراجعة والتدرب'}
                  </p>
                  <div className="flex gap-4 justify-center">
                    <Button variant="outline" size="lg" onClick={resetQuiz} className="gap-2 h-14 px-8">
                      <RotateCcw className="h-5 w-5" /> إعادة
                    </Button>
                    <Button size="lg" onClick={() => setQuizMode(false)} className="gap-2 h-14 px-8">
                      <BookOpen className="h-5 w-5" /> العودة للتعلم
                    </Button>
                  </div>
                </Card>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default TajweedRules;
