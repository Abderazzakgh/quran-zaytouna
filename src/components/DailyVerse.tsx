import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sun,
  Share2,
  Copy,
  Heart,
  RefreshCw,
  Sparkles,
  BookOpen
} from "lucide-react";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const DailyVerse = () => {
  const [liked, setLiked] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const dailyVerse = {
    arabic: "وَإِذَا سَأَلَكَ عِبَادِي عَنِّي فَإِنِّي قَرِيبٌ ۖ أُجِيبُ دَعْوَةَ الدَّاعِ إِذَا دَعَانِ",
    translation: "وإذا سألك عبادي عني فإني قريب أجيب دعوة الداعي إذا دعان",
    tafsirIbnAshur: "قال الإمام محمد الطاهر ابن عاشور رحمه الله في التحرير والتنوير: جاء هذا بأسلوب الحكاية لما يقوله الرسول صلى الله عليه وسلم لمن سأله، وهو أسلوب بديع في الإيجاز والتلطف، والمقصود أن الله تعالى لا يحتاج إلى واسطة بينه وبين عباده في الدعاء، بل هو قريب يجيب دعوة الداعي.",
    surah: "البقرة",
    ayah: 186,
    theme: "الدعاء والقرب من الله",
    scholar: "الإمام محمد الطاهر ابن عاشور"
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(dailyVerse.arabic);
    toast({
      title: "تم النسخ",
      description: "تم نسخ الآية بنجاح"
    });
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: "آية اليوم",
        text: `${dailyVerse.arabic}\n\nسورة ${dailyVerse.surah} - آية ${dailyVerse.ayah}`,
      });
    } else {
      handleCopy();
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  return (
    <section className="py-20 relative overflow-hidden bg-background">
      <div className="absolute inset-0 bg-grid-islamic opacity-20" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto animate-fade-up">
          <Card className="glass-card premium-card overflow-hidden border-border/50 shadow-2xl">
            {/* Header with gradient */}
            <div className="bg-gradient-islamic px-8 py-10 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-full bg-islamic-pattern opacity-10" />
              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner group-hover:rotate-6 transition-transform">
                    <Sun className="h-8 w-8 text-white animate-pulse" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-white tracking-tight">آية اليوم</h2>
                    <p className="text-white/80 text-sm mt-1 font-light tracking-wide">غذاء الروح وتدبر الآيات</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Badge variant="secondary" className="bg-white/10 hover:bg-white/20 text-white border-white/20 px-4 py-1.5 backdrop-blur-md transition-all">
                    {new Date().toLocaleDateString('ar-SA', { weekday: 'long' })}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/20 rounded-xl"
                    onClick={handleRefresh}
                  >
                    <RefreshCw className={`h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`} />
                  </Button>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-10 lg:p-14 text-center">
              {/* Theme Badge */}
              <div className="flex justify-center mb-10">
                <Badge variant="outline" className="px-6 py-2 text-sm border-primary/20 bg-primary/5 text-primary rounded-full font-medium">
                  <Sparkles className="h-4 w-4 ml-2 animate-bounce" />
                  {dailyVerse.theme}
                </Badge>
              </div>

              {/* Arabic Text */}
              <div className="mb-12">
                <p className="quran-text text-4xl lg:text-5xl leading-relaxed text-gradient-primary mb-6 drop-shadow-sm font-bold">
                  {dailyVerse.arabic}
                </p>
                <div className="flex items-center justify-center gap-4 text-muted-foreground font-medium">
                  <span className="w-12 h-[1px] bg-border" />
                  <span>سورة {dailyVerse.surah} • آية {dailyVerse.ayah}</span>
                  <span className="w-12 h-[1px] bg-border" />
                </div>
              </div>

              {/* Tafsir Ibn Ashur */}
              <Card className="p-8 bg-muted/20 mb-10 border-border/50 relative group hover:bg-muted/40 transition-colors rounded-2xl">
                <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                  <BookOpen className="h-12 w-12 text-primary" />
                </div>
                <div className="flex items-center gap-4 mb-5 relative z-10">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <BookOpen className="h-5 w-5 text-primary" />
                  </div>
                  <div className="text-right">
                    <h4 className="font-bold text-lg text-primary">تفسير التحرير والتنوير</h4>
                    <p className="text-xs text-muted-foreground/80 mt-1">{dailyVerse.scholar} - جامع الزيتونة المعمور</p>
                  </div>
                </div>
                <p className="text-foreground/80 text-lg leading-relaxed text-right relative z-10 italic">
                  "{dailyVerse.tafsirIbnAshur}"
                </p>
              </Card>

              {/* Actions */}
              <div className="flex flex-wrap items-center justify-center gap-4">
                <Button
                  variant="outline"
                  className="rounded-xl px-8 h-12 border-primary/30 hover:bg-primary/5 text-primary shadow-sm"
                  onClick={async () => {
                    setIsRefreshing(true);
                    try {
                      const { data, error } = await supabase.functions.invoke('ai-chat', {
                        body: { message: `قدم لي تأملاً عميقاً وتدبراً لآية: ${dailyVerse.arabic}. اجعل الرد بأسلوب مشايخ الزيتونة.` }
                      });
                      if (error) throw error;
                      toast({
                        title: "إشراقة زيتونية ✨",
                        description: data.response,
                      });
                    } catch (err) {
                      toast({
                        title: "عذراً",
                        description: "المساعد الذكي غير متاح الآن.",
                        variant: "destructive"
                      });
                    } finally {
                      setIsRefreshing(false);
                    }
                  }}
                  disabled={isRefreshing}
                >
                  <Sparkles className="h-4 w-4 ml-2" />
                  إشراقة الذكاء الاصطناعي
                </Button>

                <Button variant="outline" className="rounded-xl px-8 h-12 border-border/50 hover:bg-primary/5 hover:text-primary transition-all shadow-sm" onClick={handleCopy}>
                  <Copy className="h-4 w-4 ml-2" />
                  نسخ الآية
                </Button>
                <Button variant="outline" className="rounded-xl px-8 h-12 border-border/50 hover:bg-primary/5 hover:text-primary transition-all shadow-sm" onClick={handleShare}>
                  <Share2 className="h-4 w-4 ml-2" />
                  مشاركة
                </Button>
                <Button
                  variant={liked ? "default" : "outline"}
                  className={`rounded-xl px-8 h-12 shadow-sm transition-all ${liked ? 'button-premium border-0' : 'border-border/50 hover:bg-primary/5 hover:text-primary'}`}
                  onClick={() => setLiked(!liked)}
                >
                  <Heart className={`h-4 w-4 ml-2 ${liked ? 'fill-current animate-pulse' : ''}`} />
                  {liked ? 'أضيفت للمفضلة' : 'إعجاب'}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div >
    </section >
  );
};

export default DailyVerse;
