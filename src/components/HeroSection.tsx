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
    <section className="relative min-h-[600px] lg:min-h-[900px] flex items-center overflow-hidden bg-background">
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
      <div className="absolute top-20 left-10 w-96 h-96 bg-primary/20 rounded-full blur-[120px] animate-fade-in opacity-50" />
      <div className="absolute bottom-20 right-10 w-[500px] h-[500px] bg-accent/10 rounded-full blur-[150px] animate-fade-in opacity-40" />

      {/* Subtle Islamic pattern overlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-islamic-pattern" />

      <div className="relative z-10 container mx-auto px-4 py-20 lg:py-32">
        <div className="max-w-5xl mx-auto text-center animate-fade-up">
          <div className="mb-10 relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-56 h-56 bg-primary/20 rounded-full blur-3xl animate-pulse" />
            </div>
            <div className="relative">
              <div className="relative z-10">
                <img
                  src={zaytounaEmblem}
                  alt="مصحف الزيتونة"
                  className="w-44 h-44 lg:w-52 lg:h-52 mx-auto object-contain animate-float-soft drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)] filter brightness-110"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-3 mb-8">
            <Badge className="bg-gradient-islamic text-white shadow-xl px-5 py-2 backdrop-blur-md border border-white/20 text-sm font-medium">
              <Sparkles className="h-4 w-4 ml-2 animate-pulse" />
              رواية قالون عن نافع
            </Badge>
            <Badge variant="outline" className="border-white/30 bg-white/5 backdrop-blur-md text-white px-5 py-2 text-sm">
              تلاوة • تجويد • حفظ
            </Badge>
          </div>

          <h1 className="text-5xl lg:text-8xl font-bold mb-8 leading-tight tracking-tighter">
            <span className="block text-white/90 text-2xl lg:text-3xl font-light mb-4 tracking-[0.2em] uppercase opacity-80">مرحباً بك في</span>
            <span className="text-white drop-shadow-2xl">
              مصحف <span className="text-gradient-primary filter brightness-125">الزيتونة</span>
            </span>
          </h1>

          <p className="text-xl lg:text-3xl text-white/80 mb-12 max-w-3xl mx-auto leading-relaxed font-light text-balance">
            المصحف الذكي الأول المخصص لرواية <span className="text-accent font-semibold">قالون عن نافع</span> المدني
            <br className="hidden lg:block" />
            <span className="inline-block mt-4 text-lg bg-white/10 backdrop-blur-md px-6 py-2 rounded-full border border-white/10">تمتع بتجربة إيمانية فريدة مع تقنيات الذكاء الاصطناعي</span>
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-24">
            <Button
              size="lg"
              className="button-premium text-xl h-16 px-12 shadow-[0_20px_50px_rgba(0,0,0,0.3)]"
            >
              <BookOpen className="ml-3 h-6 w-6" />
              ابدأ القراءة
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="glass-card text-xl h-16 px-12 text-white hover:bg-white/10 border-white/20 transition-all duration-300"
            >
              <Play className="ml-3 h-6 w-6" />
              استمع للتلاوات
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card
              className="premium-card glass-card p-8 group border-white/10 cursor-pointer"
              onClick={() => document.getElementById('reading')?.scrollIntoView({ behavior: 'smooth' })}
            >
              <div className="text-center relative z-10">
                <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-islamic flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-xl border border-white/20">
                  <BookOpen className="h-8 w-8 text-primary-foreground" />
                </div>
                <h3 className="font-bold mb-3 text-xl text-white group-hover:text-primary transition-colors">تابع القراءة</h3>
                <p className="text-sm text-white/60 group-hover:text-white/80 transition-colors uppercase tracking-widest">برواية قالون</p>
              </div>
            </Card>

            <Card
              className="premium-card glass-card p-8 group border-white/10 cursor-pointer"
              onClick={() => document.getElementById('reciters')?.scrollIntoView({ behavior: 'smooth' })}
            >
              <div className="text-center relative z-10">
                <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-islamic flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-xl border border-white/20">
                  <Play className="h-8 w-8 text-primary-foreground" />
                </div>
                <h3 className="font-bold mb-3 text-xl text-white group-hover:text-primary transition-colors">استمع للتلاوة</h3>
                <p className="text-sm text-white/60 group-hover:text-white/80 transition-colors uppercase tracking-widest">قراء تونس</p>
              </div>
            </Card>

            <Card
              className="premium-card glass-card p-8 group border-white/10 cursor-pointer"
              onClick={() => document.getElementById('tajweed')?.scrollIntoView({ behavior: 'smooth' })}
            >
              <div className="text-center relative z-10">
                <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-islamic flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-xl border border-white/20">
                  <Brain className="h-8 w-8 text-primary-foreground" />
                </div>
                <h3 className="font-bold mb-3 text-xl text-white group-hover:text-primary transition-colors">تعلم التجويد</h3>
                <p className="text-sm text-white/60 group-hover:text-white/80 transition-colors uppercase tracking-widest">أحكام قالون</p>
              </div>
            </Card>

            <Card
              className="premium-card glass-card p-8 group border-white/10 cursor-pointer"
              onClick={() => document.getElementById('ai-assistant')?.scrollIntoView({ behavior: 'smooth' })}
            >
              <div className="text-center relative z-10">
                <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-islamic flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-xl border border-white/20">
                  <Sparkles className="h-8 w-8 text-primary-foreground" />
                </div>
                <h3 className="font-bold mb-3 text-xl text-white group-hover:text-primary transition-colors">المساعد الذكي</h3>
                <p className="text-sm text-white/60 group-hover:text-white/80 transition-colors uppercase tracking-widest">اسأل المساعد</p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;