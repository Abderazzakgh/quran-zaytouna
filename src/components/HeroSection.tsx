import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Play, BookOpen, Brain, MessageCircle, Sparkles } from "lucide-react";
// الصور من مجلد public
const zaytounaMosque = "/zaytouna-mosque.png"; // صورة الخلفية الاحترافية الجديدة
const zaytounaEmblem = "/zaytouna-emblem.svg"; // الشعار

const HeroSection = () => {
  const quickActions = [
    { icon: BookOpen, label: "تابع القراءة", subtitle: "برواية قالون" },
    { icon: Play, label: "استمع للتلاوة", subtitle: "قراء تونس" },
    { icon: Brain, label: "تعلم التجويد", subtitle: "أحكام قالون" },
    { icon: MessageCircle, label: "تدبر آية", subtitle: "آية اليوم" },
  ];

  return (
    <section className="relative min-h-[500px] sm:min-h-[600px] lg:min-h-[800px] flex items-center overflow-hidden bg-background">
      {/* Background Image - جامع الزيتونة */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-[2000ms] hover:scale-110"
        style={{ backgroundImage: `url(${zaytounaMosque})` }}
      />

      {/* Premium Multi-layer Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-background" />
      <div className="absolute inset-0 bg-gradient-to-r from-background/60 via-transparent to-background/60" />

      {/* Islamic spiritual glow */}
      <div className="absolute inset-0 bg-primary/5 mix-blend-overlay" />

      {/* Decorative elements */}
      <div className="absolute top-10 left-4 w-48 h-48 sm:w-64 sm:h-64 bg-primary/20 rounded-full blur-[80px] animate-fade-in opacity-50" />
      <div className="absolute bottom-10 right-4 w-64 h-64 sm:w-80 sm:h-80 bg-accent/10 rounded-full blur-[100px] animate-fade-in opacity-40" />

      {/* Subtle Islamic pattern overlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-islamic-pattern" />

      <div className="relative z-10 container mx-auto px-4 py-12 sm:py-20 lg:py-24">
        <div className="max-w-5xl mx-auto text-center animate-fade-up">
          <div className="mb-6 sm:mb-10 relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-32 h-32 sm:w-40 sm:h-40 lg:w-56 lg:h-56 bg-primary/20 rounded-full blur-3xl animate-pulse" />
            </div>
            <div className="relative">
              <div className="relative z-10">
                <img
                  src={zaytounaEmblem}
                  alt="مصحف الزيتونة"
                  className="w-28 h-28 sm:w-36 sm:h-36 lg:w-44 lg:h-44 mx-auto object-contain animate-float-soft drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)] filter brightness-110"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-6 sm:mb-8">
            <Badge className="bg-gradient-islamic text-white shadow-xl px-3 sm:px-5 py-1 sm:py-2 backdrop-blur-md border border-white/20 text-xs sm:text-sm font-medium">
              <Sparkles className="h-3 sm:h-4 w-3 sm:w-4 ml-1 sm:ml-2 animate-pulse" />
              رواية قالون عن نافع
            </Badge>
            <Badge variant="outline" className="border-white/30 bg-white/5 backdrop-blur-md text-white px-3 sm:px-5 py-1 sm:py-2 text-xs sm:text-sm">
              تلاوة • تجويد • حفظ
            </Badge>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold mb-6 sm:mb-8 leading-tight tracking-tight">
            <span className="block text-white/90 text-lg sm:text-xl lg:text-2xl font-light mb-2 sm:mb-4 tracking-[0.1em] uppercase opacity-80">مرحباً بك في</span>
            <span className="text-white drop-shadow-2xl">
              مصحف <span className="text-gradient-primary filter brightness-125">الزيتونة</span>
            </span>
          </h1>

          <p className="text-lg sm:text-xl lg:text-2xl text-white/80 mb-8 sm:mb-12 max-w-2xl sm:max-w-3xl mx-auto leading-relaxed font-light text-balance">
            المصحف الذكي الأول المخصص لرواية <span className="text-accent font-semibold">قالون عن نافع</span> المدني
            <br className="hidden sm:block" />
            <span className="inline-block mt-2 sm:mt-4 text-sm sm:text-lg bg-white/10 backdrop-blur-md px-4 sm:px-6 py-1 sm:py-2 rounded-full border border-white/10">تمتع بتجربة إيمانية فريدة مع تقنيات الذكاء الاصطناعي</span>
          </p>

          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center mb-16 sm:mb-24">
            <Button
              size="lg"
              className="button-premium text-lg sm:text-xl h-14 sm:h-16 px-8 sm:px-12 shadow-[0_20px_50px_rgba(0,0,0,0.3)]"
            >
              <BookOpen className="ml-2 sm:ml-3 h-5 sm:h-6 w-5 sm:w-6" />
              ابدأ القراءة
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="glass-card text-lg sm:text-xl h-14 sm:h-16 px-8 sm:px-12 text-white hover:bg-white/10 border-white/20 transition-all duration-300"
            >
              <Play className="ml-2 sm:ml-3 h-5 sm:h-6 w-5 sm:w-6" />
              استمع للتلاوات
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <Card
              className="premium-card glass-card p-6 sm:p-8 group border-white/10 cursor-pointer"
              onClick={() => document.getElementById('reading')?.scrollIntoView({ behavior: 'smooth' })}
            >
              <div className="text-center relative z-10">
                <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 sm:mb-6 rounded-2xl bg-gradient-islamic flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-xl border border-white/20">
                  <BookOpen className="h-6 sm:h-8 w-6 sm:w-8 text-primary-foreground" />
                </div>
                <h3 className="font-bold mb-2 sm:mb-3 text-lg sm:text-xl text-white group-hover:text-primary transition-colors">تابع القراءة</h3>
                <p className="text-xs sm:text-sm text-white/60 group-hover:text-white/80 transition-colors uppercase tracking-widest">برواية قالون</p>
              </div>
            </Card>

            <Card
              className="premium-card glass-card p-6 sm:p-8 group border-white/10 cursor-pointer"
              onClick={() => document.getElementById('reciters')?.scrollIntoView({ behavior: 'smooth' })}
            >
              <div className="text-center relative z-10">
                <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 sm:mb-6 rounded-2xl bg-gradient-islamic flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-xl border border-white/20">
                  <Play className="h-6 sm:h-8 w-6 sm:w-8 text-primary-foreground" />
                </div>
                <h3 className="font-bold mb-2 sm:mb-3 text-lg sm:text-xl text-white group-hover:text-primary transition-colors">استمع للتلاوة</h3>
                <p className="text-xs sm:text-sm text-white/60 group-hover:text-white/80 transition-colors uppercase tracking-widest">قراء تونس</p>
              </div>
            </Card>

            <Card
              className="premium-card glass-card p-6 sm:p-8 group border-white/10 cursor-pointer"
              onClick={() => document.getElementById('tajweed')?.scrollIntoView({ behavior: 'smooth' })}
            >
              <div className="text-center relative z-10">
                <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 sm:mb-6 rounded-2xl bg-gradient-islamic flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-xl border border-white/20">
                  <Brain className="h-6 sm:h-8 w-6 sm:w-8 text-primary-foreground" />
                </div>
                <h3 className="font-bold mb-2 sm:mb-3 text-lg sm:text-xl text-white group-hover:text-primary transition-colors">تعلم التجويد</h3>
                <p className="text-xs sm:text-sm text-white/60 group-hover:text-white/80 transition-colors uppercase tracking-widest">أحكام قالون</p>
              </div>
            </Card>

            <Card
              className="premium-card glass-card p-6 sm:p-8 group border-white/10 cursor-pointer"
              onClick={() => document.getElementById('ai-assistant')?.scrollIntoView({ behavior: 'smooth' })}
            >
              <div className="text-center relative z-10">
                <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 sm:mb-6 rounded-2xl bg-gradient-islamic flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-xl border border-white/20">
                  <Sparkles className="h-6 sm:h-8 w-6 sm:w-8 text-primary-foreground" />
                </div>
                <h3 className="font-bold mb-2 sm:mb-3 text-lg sm:text-xl text-white group-hover:text-primary transition-colors">المساعد الذكي</h3>
                <p className="text-xs sm:text-sm text-white/60 group-hover:text-white/80 transition-colors uppercase tracking-widest">اسأل المساعد</p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;