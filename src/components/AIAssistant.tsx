import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  MessageCircle,
  Sparkles,
  BookOpen,
  Heart,
  Send,
  Mic,
  Loader2,
  Trash2,
  Volume2
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Message {
  type: "user" | "ai";
  message: string;
  time: string;
}

const AIAssistant = () => {
  const [message, setMessage] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [conversations, setConversations] = useState<Message[]>([
    {
      type: "ai",
      message: "عسّلامة! أنا مساعد الزيتونة الذكي. كيف يمكنني مساعدتك في رحلتك مع القرآن الكريم اليوم؟",
      time: new Date().toLocaleTimeString('ar-TN', { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ar-SA';
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [conversations]);

  const knowledgeBase = [
    {
      keywords: ["قالون", "نافع", "رواية"],
      response: "رواية قالون عن نافع هي الرواية الأكثر انتشاراً في تونس والمغرب العربي. تتميز بتسهيل الهمزة المفردة في بعض المواضع، وبضم ميم الجمع إذا كان بعدها حرف متحرك (صلة ميم الجمع). هي رواية عذبة وسهلة اللفظ."
    },
    {
      keywords: ["الزيتونة", "جامع"],
      response: "جامع الزيتونة المعمور هو منارة العلم في تونس وشمال إفريقيا منذ أكثر من 1300 عام. اشتهر بتدريس علوم القرآن والقراءات، وكان له الفضل في الحفاظ على الهوية الإسلامية والمنهج الوسطي."
    },
    {
      keywords: ["تجويد", "تعلم", "مخارج"],
      response: "لإتقان التجويد، أنصحك بالبدء بمخارج الحروف الأساسية (الحلق، اللسان، الشفتان). يمكنك استخدام قسم 'تصحيح التلاوة' في تطبيقنا للتدرب على النطق الصحيح."
    }
  ];

  const suggestions = [
    "اشرح لي فضل سورة الملك",
    "كيف أتقن مخرج الضاد؟",
    "أريد آيات عن الطمأنينة",
    "ما هي مميزات رواية قالون؟"
  ];

  const simulateTyping = (fullText: string) => {
    setIsTyping(true);
    let currentText = "";
    const words = fullText.split(" ");
    let i = 0;

    const aiMessage: Message = {
      type: "ai",
      message: "",
      time: new Date().toLocaleTimeString('ar-TN', { hour: '2-digit', minute: '2-digit' })
    };

    setConversations(prev => [...prev, aiMessage]);

    const interval = setInterval(() => {
      if (i < words.length) {
        currentText += (i === 0 ? "" : " ") + words[i];
        setConversations(prev => {
          const updated = [...prev];
          updated[updated.length - 1] = { ...aiMessage, message: currentText };
          return updated;
        });
        i++;
      } else {
        clearInterval(interval);
        setIsTyping(false);
        setIsLoading(false);
      }
    }, 50);
  };

  const handleSendMessage = async (text: string = message) => {
    if (!text.trim() || isLoading) return;

    const userMessage: Message = {
      type: "user",
      message: text,
      time: new Date().toLocaleTimeString('ar-TN', { hour: '2-digit', minute: '2-digit' })
    };

    setConversations(prev => [...prev, userMessage]);
    setMessage("");
    setIsLoading(true);

    // AI Logic by Default
    try {
      const { data, error } = await supabase.functions.invoke('ai-chat', {
        body: {
          message: text,
          history: conversations.slice(-6)
        }
      });

      if (error) throw error;

      if (data && data.response) {
        simulateTyping(data.response);
      } else {
        throw new Error("No response from AI");
      }
    } catch (err) {
      console.error("Error calling AI, trying local fallback:", err);

      // Smart Fallback to Local Knowledge Base
      const lowerText = text.toLowerCase();
      const localMatch = knowledgeBase.find(kb =>
        kb.keywords.some(k => lowerText.includes(k))
      );

      if (localMatch) {
        simulateTyping(localMatch.response + " (إجابة من قاعدة البيانات المحلية نظراً لتعذر الاتصال بالخادم)");
      } else {
        simulateTyping("أعتذر منك يا سيدي، كاينو فمّا مشكلة صغيرة في التواصل مع المركز حالياً. أما راني موجود باش نعاونك في كل ما يخص القرآن وجامع الزيتونة.");
      }
    }
  };

  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error("متصفحك لا يدعم التعرف على الصوت.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'ar-SA';
    recognition.continuous = false;

    recognition.onstart = () => {
      setIsListening(true);
      toast.info("جاري الاستماع... تفضل اتكلم");
    };

    recognition.onend = () => setIsListening(false);

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setMessage(transcript);
      handleSendMessage(transcript);
    };

    recognition.onerror = () => {
      setIsListening(false);
      toast.error("حدث خطأ في التقاط الصوت.");
    };

    recognition.start();
  };

  const clearChat = () => {
    setConversations([
      {
        type: "ai",
        message: "تم مسح المحادثة. كيف يمكنني مساعدتك الآن؟",
        time: new Date().toLocaleTimeString('ar-TN', { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  return (
    <section className="py-12 bg-muted/30" id="ai-assistant">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 p-2 rounded-full bg-primary/10 mb-4 animate-pulse">
              <Sparkles className="h-5 w-5 text-primary" />
              <Badge variant="secondary">مدعوم بالذكاء الاصطناعي</Badge>
            </div>
            <h2 className="text-4xl font-bold mb-4">مساعد الزيتونة الذكي</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              تواصل مع خبير افتراضي في علوم القرآن والتجويد، متوفر دائماً للإجابة على تساؤلاتك وتوجيهك
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Chat Interface */}
            <Card className="lg:col-span-2 flex flex-col h-[600px] shadow-xl border-primary/10 overflow-hidden bg-background">
              <div className="p-4 border-b bg-muted/20 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-islamic flex items-center justify-center">
                    <MessageCircle className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold">محادثة حية</h3>
                    <div className="flex items-center gap-1">
                      <span className="w-2 h-2 bg-green-500 rounded-full animate-ping" />
                      <span className="text-[10px] text-muted-foreground">متصل الآن</span>
                    </div>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={clearChat} title="مسح المحادثة">
                  <Trash2 className="h-4 w-4 text-muted-foreground" />
                </Button>
              </div>

              <div
                ref={scrollRef}
                className="flex-1 p-6 overflow-y-auto space-y-4 custom-scrollbar bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')]"
              >
                {conversations.map((conv, index) => (
                  <div
                    key={index}
                    className={`flex ${conv.type === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2`}
                  >
                    <div
                      className={`max-w-[85%] relative group transition-all duration-300`}
                    >
                      <div className={`p-4 rounded-2xl shadow-sm ${conv.type === 'user'
                        ? 'bg-islamic text-white rounded-tr-none'
                        : 'bg-white dark:bg-zinc-800 rounded-tl-none border border-primary/10'
                        }`}>
                        <p className="text-sm md:text-base leading-relaxed whitespace-pre-wrap">{conv.message}</p>

                        <div className="flex items-center justify-between mt-2">
                          <p className={`text-[10px] opacity-50 ${conv.type === 'user' ? 'text-white' : 'text-muted-foreground'}`}>
                            {conv.time}
                          </p>

                          {conv.type === 'ai' && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 rounded-full hover:bg-primary/10 text-primary opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => speakText(conv.message)}
                            >
                              <Volume2 className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {(isLoading && !isTyping) && (
                  <div className="flex justify-start animate-pulse">
                    <div className="bg-white dark:bg-zinc-800 p-4 rounded-2xl rounded-tl-none border border-primary/10 flex items-center gap-3">
                      <div className="flex gap-1">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]" />
                        <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]" />
                        <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" />
                      </div>
                      <span className="text-xs font-medium text-primary">المساعد يفكّر...</span>
                    </div>
                  </div>
                )}

                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-primary/5 p-2 rounded-lg flex items-center gap-2">
                      <Loader2 className="h-3 w-3 animate-spin text-primary" />
                      <span className="text-[10px] text-primary italic">جاري الكتابة...</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-4 border-t bg-muted/10">
                <form
                  onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
                  className="flex gap-2"
                >
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="اكتب سؤالك هنا (مثلاً: ما هي أحكام النون الساكنة؟)"
                    className="flex-1 h-12 px-4 bg-background border-2 border-muted rounded-xl focus:ring-2 focus:ring-islamic focus:border-transparent outline-none transition-all"
                    disabled={isLoading}
                  />
                  <Button
                    type="button"
                    variant={isListening ? "default" : "outline"}
                    className={`h-12 w-12 rounded-xl transition-all ${isListening ? 'bg-red-500 hover:bg-red-600 animate-pulse' : ''}`}
                    onClick={startListening}
                    disabled={isLoading}
                  >
                    <Mic className={`h-5 w-5 ${isListening ? 'text-white' : ''}`} />
                  </Button>
                  <Button
                    type="submit"
                    className="h-12 w-12 rounded-xl bg-islamic hover:bg-islamic/90 shadow-lg"
                    disabled={isLoading}
                  >
                    <Send className="h-5 w-5" />
                  </Button>
                </form>
              </div>
            </Card>

            {/* Sidebar Tools */}
            <div className="space-y-6">
              <Card className="p-6 border-primary/10 shadow-lg hover:shadow-xl transition-all">
                <h3 className="font-bold mb-4 flex items-center gap-2 text-primary">
                  <Sparkles className="h-5 w-5" />
                  اقتراحات ذكية
                </h3>
                <div className="grid grid-cols-1 gap-3">
                  {suggestions.map((suggestion, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="justify-start h-auto p-4 text-right hover:bg-primary/5 hover:border-primary/30 transition-all rounded-xl border-dashed"
                      onClick={() => handleSendMessage(suggestion)}
                      disabled={isLoading}
                    >
                      <MessageCircle className="h-4 w-4 ml-2 text-primary/50" />
                      <span className="text-sm">{suggestion}</span>
                    </Button>
                  ))}
                </div>
              </Card>

              <Card className="p-6 border-primary/10 shadow-lg bg-gradient-islamic text-white">
                <h3 className="font-bold mb-4 flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  ماذا يمكنني أن أفعل؟
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3 bg-white/10 p-3 rounded-xl backdrop-blur-sm">
                    <div className="bg-white/20 p-2 rounded-lg">
                      <Sparkles className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm">تفسير سريع</h4>
                      <p className="text-xs text-white/80">اطلب تفسير أي آية في ثوانٍ</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 bg-white/10 p-3 rounded-xl backdrop-blur-sm">
                    <div className="bg-white/20 p-2 rounded-lg">
                      <Heart className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm">نصائح تربوية</h4>
                      <p className="text-xs text-white/80">دروس مستفادة من القصص القرآنية</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 bg-white/10 p-3 rounded-xl backdrop-blur-sm">
                    <div className="bg-white/20 p-2 rounded-lg">
                      <BookOpen className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm">أحكام التجويد</h4>
                      <p className="text-xs text-white/80">شرح مفصل لمخارج الحروف والمدود</p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AIAssistant;