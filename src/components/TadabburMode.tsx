import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { 
  Heart,
  BookOpen,
  Lightbulb,
  MessageSquare,
  Save,
  Share2,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  PenLine,
  BookMarked,
  Quote
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface TadabburVerse {
  id: number;
  surah: string;
  surahNumber: number;
  verseNumber: number;
  arabic: string;
  translation: string;
  tafsir: string;
  theme: string;
  reflectionPrompts: string[];
}

const tadabburVerses: TadabburVerse[] = [
  {
    id: 1,
    surah: "البقرة",
    surahNumber: 2,
    verseNumber: 286,
    arabic: "لَا يُكَلِّفُ اللَّهُ نَفْسًا إِلَّا وُسْعَهَا ۚ لَهَا مَا كَسَبَتْ وَعَلَيْهَا مَا اكْتَسَبَتْ",
    translation: "لا يكلف الله نفساً إلا ما تستطيعه، لها ثواب ما عملت من خير وعليها وزر ما اكتسبت من شر",
    tafsir: "قال الإمام ابن عاشور في التحرير والتنوير: هذا ابتداء كلام مستأنف استئنافاً بيانياً، لأن ما تقدم من التكاليف العظيمة يثير سؤال سائل: هل نطيق القيام بذلك؟ فكان الجواب: لا يكلف الله نفساً إلا وسعها. والوسع: الطاقة والقدرة.",
    theme: "الرحمة والتيسير",
    reflectionPrompts: [
      "كيف أشعر عندما أعلم أن الله لا يكلفني فوق طاقتي؟",
      "ما هي المسؤوليات التي أحملها وكيف أواجهها بهذا الفهم؟",
      "كيف يمكنني تطبيق هذا المعنى في حياتي اليومية؟"
    ]
  },
  {
    id: 2,
    surah: "آل عمران",
    surahNumber: 3,
    verseNumber: 139,
    arabic: "وَلَا تَهِنُوا وَلَا تَحْزَنُوا وَأَنتُمُ الْأَعْلَوْنَ إِن كُنتُم مُّؤْمِنِينَ",
    translation: "ولا تضعفوا ولا تحزنوا وأنتم الأعلون إن كنتم مؤمنين حقاً",
    tafsir: "قال الإمام ابن عاشور في التحرير والتنوير: الوهن: الضعف، أي لا تضعفوا عن الجهاد ومواصلة الدفاع عن دينكم. والأعلون: أي الغالبون في العاقبة، فإن الإيمان يقتضي النصر، لأنه الحق، والحق يعلو ولا يُعلى عليه.",
    theme: "القوة والأمل",
    reflectionPrompts: [
      "ما الذي يمنحني القوة في لحظات الضعف؟",
      "كيف يؤثر إيماني على نظرتي للتحديات؟",
      "ما معنى أن أكون من 'الأعلون'؟"
    ]
  },
  {
    id: 3,
    surah: "الشرح",
    surahNumber: 94,
    verseNumber: 5,
    arabic: "فَإِنَّ مَعَ الْعُسْرِ يُسْرًا • إِنَّ مَعَ الْعُسْرِ يُسْرًا",
    translation: "فإن مع الشدة فرجاً، إن مع الشدة فرجاً",
    tafsir: "قال الإمام ابن عاشور في التحرير والتنوير: التعريف في العسر للجنس، وتنكير اليسر للتعظيم والتكثير، فالمعنى أن مع جنس العسر يسراً عظيماً. وتكرير الجملة لتأكيد هذا الوعد وتقريره في النفوس.",
    theme: "الفرج بعد الشدة",
    reflectionPrompts: [
      "متى شهدت في حياتي يسراً بعد عسر؟",
      "كيف يساعدني هذا الوعد على الصبر؟",
      "ما الذي يمكنني فعله أثناء انتظار الفرج؟"
    ]
  },
  {
    id: 4,
    surah: "الحجرات",
    surahNumber: 49,
    verseNumber: 10,
    arabic: "إِنَّمَا الْمُؤْمِنُونَ إِخْوَةٌ فَأَصْلِحُوا بَيْنَ أَخَوَيْكُمْ",
    translation: "إنما المؤمنون إخوة في الدين فأصلحوا بين إخوتكم",
    tafsir: "قال الإمام ابن عاشور في التحرير والتنوير: الحصر المستفاد من إنما للمبالغة في إثبات الأخوة بين المؤمنين، أي ليس بينهم إلا الأخوة، فلا عداوة ولا بغضاء. والأخوة الإيمانية أقوى من أخوة النسب لأنها مبنية على أعظم رابطة وهي رابطة الإيمان بالله.",
    theme: "الأخوة الإيمانية",
    reflectionPrompts: [
      "كيف أعزز روابط الأخوة في مجتمعي؟",
      "هل هناك خلاف يمكنني المساعدة في إصلاحه؟",
      "ما واجبي تجاه إخوتي في الإيمان؟"
    ]
  }
];

const TadabburMode = () => {
  const [currentVerseIndex, setCurrentVerseIndex] = useState(0);
  const [personalNotes, setPersonalNotes] = useState<Record<number, string>>({});
  const [selectedPrompt, setSelectedPrompt] = useState<number | null>(null);
  const [savedReflections, setSavedReflections] = useState<Array<{verseId: number; note: string; date: Date}>>([]);
  const [showTafsir, setShowTafsir] = useState(false);

  const currentVerse = tadabburVerses[currentVerseIndex];

  const goToNext = () => {
    if (currentVerseIndex < tadabburVerses.length - 1) {
      setCurrentVerseIndex(currentVerseIndex + 1);
      setSelectedPrompt(null);
      setShowTafsir(false);
    }
  };

  const goToPrev = () => {
    if (currentVerseIndex > 0) {
      setCurrentVerseIndex(currentVerseIndex - 1);
      setSelectedPrompt(null);
      setShowTafsir(false);
    }
  };

  const saveReflection = () => {
    const note = personalNotes[currentVerse.id];
    if (note && note.trim()) {
      setSavedReflections(prev => [...prev, {
        verseId: currentVerse.id,
        note: note.trim(),
        date: new Date()
      }]);
      toast.success("تم حفظ تأملك بنجاح");
    } else {
      toast.error("اكتب تأملك أولاً");
    }
  };

  const shareReflection = () => {
    const note = personalNotes[currentVerse.id] || "";
    const text = `تأمل في قوله تعالى:\n"${currentVerse.arabic}"\n\n${note}\n\n- من مصحف الزيتونة 🫒`;
    
    if (navigator.share) {
      navigator.share({ text });
    } else {
      navigator.clipboard.writeText(text);
      toast.success("تم نسخ التأمل إلى الحافظة");
    }
  };

  return (
    <section className="py-12 bg-gradient-to-br from-accent/5 via-background to-primary/5">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 p-2 rounded-full bg-accent/20 mb-4">
              <Heart className="h-5 w-5 text-primary" />
              <Badge variant="secondary">وضع التدبر</Badge>
            </div>
            <h2 className="text-3xl font-bold mb-3">تدبر القرآن الكريم</h2>
            <p className="text-muted-foreground">تأمل وتفكر في آيات الله مع أسئلة تفاعلية وملاحظات شخصية</p>
          </div>

          {/* Main Verse Card */}
          <Card className="p-8 bg-gradient-card border-primary/10 shadow-lg mb-6">
            {/* Theme Badge */}
            <div className="flex items-center justify-between mb-6">
              <Badge variant="outline" className="gap-1 text-sm">
                <BookMarked className="h-3 w-3" />
                {currentVerse.theme}
              </Badge>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>سورة {currentVerse.surah}</span>
                <span>•</span>
                <span>آية {currentVerse.verseNumber}</span>
              </div>
            </div>

            {/* Arabic Text */}
            <div className="text-center mb-8">
              <div className="relative inline-block">
                <Quote className="absolute -top-4 -right-4 h-8 w-8 text-primary/20 rotate-180" />
                <p className="text-3xl md:text-4xl font-amiri leading-loose text-foreground px-8">
                  {currentVerse.arabic}
                </p>
                <Quote className="absolute -bottom-4 -left-4 h-8 w-8 text-primary/20" />
              </div>
            </div>

            {/* Translation */}
            <div className="bg-muted/30 rounded-xl p-4 mb-6">
              <p className="text-lg text-muted-foreground leading-relaxed text-center">
                {currentVerse.translation}
              </p>
            </div>

            {/* Tafsir Toggle */}
            <Button
              variant="outline"
              className="w-full mb-6 gap-2"
              onClick={() => setShowTafsir(!showTafsir)}
            >
              <Lightbulb className="h-4 w-4" />
              {showTafsir ? "إخفاء التفسير" : "عرض التفسير"}
            </Button>

            {showTafsir && (
              <Card className="p-4 bg-primary/5 border-primary/20 mb-6 animate-fade-in">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                    <BookOpen className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold">تفسير التحرير والتنوير</h4>
                      <Badge variant="secondary" className="text-xs">جامع الزيتونة</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">الإمام محمد الطاهر ابن عاشور رحمه الله</p>
                    <p className="text-muted-foreground leading-relaxed">{currentVerse.tafsir}</p>
                  </div>
                </div>
              </Card>
            )}

            {/* Reflection Prompts */}
            <div className="mb-6">
              <h4 className="font-semibold mb-4 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                أسئلة للتدبر
              </h4>
              <div className="space-y-2">
                {currentVerse.reflectionPrompts.map((prompt, index) => (
                  <button
                    key={index}
                    className={`w-full text-right p-4 rounded-lg transition-all ${
                      selectedPrompt === index 
                        ? "bg-primary/10 border border-primary/30" 
                        : "bg-muted/50 hover:bg-muted"
                    }`}
                    onClick={() => setSelectedPrompt(selectedPrompt === index ? null : index)}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm ${
                        selectedPrompt === index ? "bg-primary text-primary-foreground" : "bg-muted-foreground/20"
                      }`}>
                        {index + 1}
                      </div>
                      <span className={selectedPrompt === index ? "text-primary font-medium" : ""}>
                        {prompt}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Personal Notes */}
            <div className="space-y-3">
              <label className="font-semibold flex items-center gap-2">
                <PenLine className="h-4 w-4 text-primary" />
                ملاحظاتي الشخصية
              </label>
              <Textarea
                placeholder="اكتب تأملاتك وخواطرك حول هذه الآية..."
                value={personalNotes[currentVerse.id] || ""}
                onChange={(e) => setPersonalNotes(prev => ({
                  ...prev,
                  [currentVerse.id]: e.target.value
                }))}
                className="min-h-[120px] text-right resize-none"
              />
              <div className="flex gap-3">
                <Button onClick={saveReflection} className="flex-1 gap-2">
                  <Save className="h-4 w-4" />
                  حفظ التأمل
                </Button>
                <Button onClick={shareReflection} variant="outline" className="gap-2">
                  <Share2 className="h-4 w-4" />
                  مشاركة
                </Button>
              </div>
            </div>
          </Card>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={goToPrev}
              disabled={currentVerseIndex === 0}
              className="gap-2"
            >
              <ChevronRight className="h-4 w-4" />
              السابقة
            </Button>
            
            <div className="flex items-center gap-2">
              {tadabburVerses.map((_, index) => (
                <button
                  key={index}
                  className={`w-3 h-3 rounded-full transition-all ${
                    index === currentVerseIndex 
                      ? "bg-primary scale-125" 
                      : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                  }`}
                  onClick={() => {
                    setCurrentVerseIndex(index);
                    setSelectedPrompt(null);
                    setShowTafsir(false);
                  }}
                />
              ))}
            </div>

            <Button
              variant="outline"
              onClick={goToNext}
              disabled={currentVerseIndex === tadabburVerses.length - 1}
              className="gap-2"
            >
              التالية
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </div>

          {/* Saved Reflections Summary */}
          {savedReflections.length > 0 && (
            <Card className="mt-8 p-6">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                تأملاتي المحفوظة ({savedReflections.length})
              </h3>
              <div className="space-y-3 max-h-48 overflow-y-auto">
                {savedReflections.slice(-3).map((reflection, index) => {
                  const verse = tadabburVerses.find(v => v.id === reflection.verseId);
                  return (
                    <div key={index} className="p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline" className="text-xs">
                          {verse?.surah} - آية {verse?.verseNumber}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {reflection.date.toLocaleDateString('ar-SA')}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">{reflection.note}</p>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}
        </div>
      </div>
    </section>
  );
};

export default TadabburMode;
