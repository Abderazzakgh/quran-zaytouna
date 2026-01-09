import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  HelpCircle, 
  CheckCircle2, 
  XCircle,
  Trophy,
  Zap,
  RotateCcw,
  ArrowLeft
} from "lucide-react";
import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const QuranQuiz = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [answeredQuestions, setAnsweredQuestions] = useState<Array<{
    question: string;
    selected: string;
    correct: string;
    isCorrect: boolean;
    explanation: string;
  }>>([]);
  const queryClient = useQueryClient();

  useEffect(() => {
    const getUserId = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id || null);
    };
    getUserId();
  }, []);

  // Save quiz result mutation
  const saveQuizResultMutation = useMutation({
    mutationFn: async (result: {
      totalQuestions: number;
      correctAnswers: number;
      score: number;
      timeTaken: number;
      questions: typeof answeredQuestions;
    }) => {
      if (!userId) throw new Error("Not authenticated");
      
      const { data: quizResult, error: quizError } = await supabase
        .from("quiz_results")
        .insert({
          user_id: userId,
          quiz_type: "general",
          total_questions: result.totalQuestions,
          correct_answers: result.correctAnswers,
          score: result.score,
          time_taken_seconds: result.timeTaken,
        })
        .select()
        .single();
      
      if (quizError) throw quizError;

      // Save individual questions
      if (result.questions.length > 0) {
        const questionInserts = result.questions.map(q => ({
          quiz_result_id: quizResult.id,
          question_text: q.question,
          selected_answer: q.selected,
          correct_answer: q.correct,
          is_correct: q.isCorrect,
          explanation: q.explanation,
        }));

        const { error: questionsError } = await supabase
          .from("quiz_questions_answered")
          .insert(questionInserts);
        
        if (questionsError) throw questionsError;
      }

      return quizResult;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quiz_results", userId] });
    },
    onError: (error: Error) => {
      console.error("Error saving quiz result:", error);
    },
  });

  const questions = [
    {
      question: "ما هي أطول سورة في القرآن الكريم؟",
      options: ["آل عمران", "البقرة", "النساء", "المائدة"],
      correct: 1,
      explanation: "سورة البقرة هي أطول سورة في القرآن الكريم وتحتوي على 286 آية"
    },
    {
      question: "كم عدد أجزاء القرآن الكريم؟",
      options: ["20 جزء", "25 جزء", "30 جزء", "35 جزء"],
      correct: 2,
      explanation: "القرآن الكريم مقسم إلى 30 جزءاً"
    },
    {
      question: "ما هي السورة التي تسمى قلب القرآن؟",
      options: ["الفاتحة", "يس", "الإخلاص", "الملك"],
      correct: 1,
      explanation: "سورة يس تسمى قلب القرآن لعظيم فضلها ومعانيها"
    },
    {
      question: "أين نزلت سورة الفاتحة؟",
      options: ["المدينة", "مكة", "الطائف", "بيت المقدس"],
      correct: 1,
      explanation: "سورة الفاتحة مكية نزلت في مكة المكرمة"
    },
    {
      question: "ما اسم السورة التي تعدل ثلث القرآن؟",
      options: ["الفاتحة", "البقرة", "الإخلاص", "الناس"],
      correct: 2,
      explanation: "سورة الإخلاص تعدل ثلث القرآن كما ورد في الحديث الشريف"
    }
  ];

  const handleAnswer = (answerIndex: number) => {
    if (selectedAnswer !== null) return;
    
    setSelectedAnswer(answerIndex);
    const isCorrect = answerIndex === questions[currentQuestion].correct;
    if (isCorrect) {
      setScore(score + 1);
    }

    // Save answered question
    setAnsweredQuestions(prev => [...prev, {
      question: questions[currentQuestion].question,
      selected: questions[currentQuestion].options[answerIndex],
      correct: questions[currentQuestion].options[questions[currentQuestion].correct],
      isCorrect,
      explanation: questions[currentQuestion].explanation,
    }]);
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
    } else {
      setShowResult(true);
      // Save quiz result
      if (startTime && userId) {
        const timeTaken = Math.floor((new Date().getTime() - startTime.getTime()) / 1000);
        const finalScore = Math.round((score / questions.length) * 100);
        
        saveQuizResultMutation.mutate({
          totalQuestions: questions.length,
          correctAnswers: score,
          score: finalScore,
          timeTaken,
          questions: answeredQuestions,
        });
      }
    }
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setScore(0);
    setShowResult(false);
    setQuizStarted(false);
    setStartTime(null);
    setAnsweredQuestions([]);
  };

  const getScoreMessage = () => {
    const percentage = (score / questions.length) * 100;
    if (percentage === 100) return "ممتاز! أنت حافظ متقن 🎉";
    if (percentage >= 80) return "أحسنت! نتيجة رائعة 👏";
    if (percentage >= 60) return "جيد! استمر في التعلم 📚";
    return "لا بأس، حاول مرة أخرى 💪";
  };

  if (!quizStarted) {
    return (
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <Card className="p-8 text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-islamic flex items-center justify-center">
                <HelpCircle className="h-10 w-10 text-primary-foreground" />
              </div>
              <h2 className="text-3xl font-bold mb-4">اختبار معلوماتك القرآنية</h2>
              <p className="text-muted-foreground mb-8">
                اختبر معلوماتك عن القرآن الكريم من خلال {questions.length} أسئلة متنوعة
              </p>
              
              <div className="grid grid-cols-3 gap-4 mb-8">
                <Card className="p-4 bg-primary/5">
                  <HelpCircle className="h-6 w-6 mx-auto mb-2 text-primary" />
                  <p className="text-2xl font-bold">{questions.length}</p>
                  <p className="text-xs text-muted-foreground">أسئلة</p>
                </Card>
                <Card className="p-4 bg-accent/20">
                  <Zap className="h-6 w-6 mx-auto mb-2 text-accent-foreground" />
                  <p className="text-2xl font-bold">متوسط</p>
                  <p className="text-xs text-muted-foreground">المستوى</p>
                </Card>
                <Card className="p-4 bg-green-500/10">
                  <Trophy className="h-6 w-6 mx-auto mb-2 text-green-600" />
                  <p className="text-2xl font-bold">+50</p>
                  <p className="text-xs text-muted-foreground">نقطة</p>
                </Card>
              </div>

              <Button 
                size="lg" 
                onClick={() => {
                  setQuizStarted(true);
                  setStartTime(new Date());
                }} 
                className="px-8"
              >
                ابدأ الاختبار
                <ArrowLeft className="h-4 w-4 mr-2" />
              </Button>
            </Card>
          </div>
        </div>
      </section>
    );
  }

  if (showResult) {
    return (
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <Card className="p-8 text-center">
              <div className={`w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center ${
                score >= questions.length * 0.8 ? 'bg-green-500' : score >= questions.length * 0.5 ? 'bg-amber-500' : 'bg-red-500'
              }`}>
                <Trophy className="h-12 w-12 text-white" />
              </div>
              
              <h2 className="text-3xl font-bold mb-2">انتهى الاختبار!</h2>
              <p className="text-xl text-muted-foreground mb-6">{getScoreMessage()}</p>
              
              <div className="text-5xl font-bold mb-2 bg-gradient-islamic bg-clip-text text-transparent">
                {score}/{questions.length}
              </div>
              <p className="text-muted-foreground mb-8">إجابات صحيحة</p>

              <Progress value={(score / questions.length) * 100} className="h-3 mb-8" />

              <div className="flex gap-4 justify-center">
                <Button onClick={resetQuiz} variant="outline">
                  <RotateCcw className="h-4 w-4 ml-2" />
                  إعادة الاختبار
                </Button>
                <Button onClick={resetQuiz}>
                  اختبار جديد
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </section>
    );
  }

  const currentQ = questions[currentQuestion];

  return (
    <section className="py-12 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <Card className="p-6">
            {/* Progress */}
            <div className="flex items-center justify-between mb-6">
              <Badge variant="outline">
                السؤال {currentQuestion + 1} من {questions.length}
              </Badge>
              <div className="flex items-center gap-2">
                <Trophy className="h-4 w-4 text-primary" />
                <span className="font-bold">{score}</span>
              </div>
            </div>
            
            <Progress value={((currentQuestion + 1) / questions.length) * 100} className="mb-8" />

            {/* Question */}
            <div className="mb-8">
              <h3 className="text-xl font-bold mb-6 text-center">{currentQ.question}</h3>
              
              <div className="space-y-3">
                {currentQ.options.map((option, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className={`w-full justify-start h-auto p-4 text-right transition-all ${
                      selectedAnswer !== null
                        ? index === currentQ.correct
                          ? 'bg-green-500/10 border-green-500 text-green-700'
                          : index === selectedAnswer
                            ? 'bg-red-500/10 border-red-500 text-red-700'
                            : ''
                        : 'hover:bg-primary/5'
                    }`}
                    onClick={() => handleAnswer(index)}
                    disabled={selectedAnswer !== null}
                  >
                    <span className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-bold">
                        {String.fromCharCode(1571 + index)}
                      </span>
                      {option}
                      {selectedAnswer !== null && index === currentQ.correct && (
                        <CheckCircle2 className="h-5 w-5 text-green-500 mr-auto" />
                      )}
                      {selectedAnswer === index && index !== currentQ.correct && (
                        <XCircle className="h-5 w-5 text-red-500 mr-auto" />
                      )}
                    </span>
                  </Button>
                ))}
              </div>
            </div>

            {/* Explanation */}
            {selectedAnswer !== null && (
              <Card className="p-4 bg-muted/50 mb-6">
                <p className="text-sm text-muted-foreground">
                  <strong>التوضيح:</strong> {currentQ.explanation}
                </p>
              </Card>
            )}

            {/* Next Button */}
            {selectedAnswer !== null && (
              <Button onClick={nextQuestion} className="w-full">
                {currentQuestion < questions.length - 1 ? 'السؤال التالي' : 'عرض النتيجة'}
                <ArrowLeft className="h-4 w-4 mr-2" />
              </Button>
            )}
          </Card>
        </div>
      </div>
    </section>
  );
};

export default QuranQuiz;
