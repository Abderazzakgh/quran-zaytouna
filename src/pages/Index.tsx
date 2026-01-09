import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import HeroSection from "@/components/HeroSection";
import DailyVerse from "@/components/DailyVerse";
import PrayerTimes from "@/components/PrayerTimes";
import QuranReader from "@/components/QuranReader";
import AIAssistant from "@/components/AIAssistant";
import MemorizationSection from "@/components/MemorizationSection";
import ReadingTracker from "@/components/ReadingTracker";
import TajweedRules from "@/components/TajweedRules";
import QuranQuiz from "@/components/QuranQuiz";
import BookmarksManager from "@/components/BookmarksManager";
import RecitationCorrection from "@/components/RecitationCorrection";
import AdvancedSearch from "@/components/AdvancedSearch";
import AdvancedAudioPlayer from "@/components/AdvancedAudioPlayer";
import DetailedStats from "@/components/DetailedStats";
import NotificationCenter from "@/components/NotificationCenter";
import ReciterList from "@/components/ReciterList";
import SmartKhatma from "@/components/SmartKhatma";
import TadabburMode from "@/components/TadabburMode";
import ZaytunaScholars from "@/components/ZaytunaScholars";
import ScrollToTop from "@/components/ScrollToTop";
import FloatingAI from "@/components/FloatingAI";
import { useState } from "react";
import { Music } from "lucide-react";
// الشعار من مجلد public
const zaytounaEmblem = "/zaytouna-emblem.svg";

const Index = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Header onMenuClick={() => setSidebarOpen(true)} />

      {/* Mobile Sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="right" className="p-0 w-80">
          <Sidebar />
        </SheetContent>
      </Sheet>

      <div className="flex">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block sticky top-24 h-[calc(100vh-6rem)]">
          <Sidebar />
        </div>

        <main className="flex-1 animate-fade-in">
          <HeroSection />
          <DailyVerse />
          <PrayerTimes />
          <QuranReader />
          <AdvancedAudioPlayer />

          <section id="reciters" className="py-20 bg-muted/20 relative overflow-hidden">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto text-center mb-12">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary mb-4">
                  <Music className="h-4 w-4" />
                  <span className="text-sm font-bold">مكتبة القراء</span>
                </div>
                <h2 className="text-4xl font-bold mb-4">قائمة مشايخ تونس</h2>
                <p className="text-muted-foreground">استمع إلى أروع التلاوات برواية قالون عن نافع بأصوات تونسية أصيلة</p>
              </div>
              <ReciterList />
            </div>
          </section>
          <SmartKhatma />
          <TadabburMode />
          <ZaytunaScholars />
          <AIAssistant />
          <TajweedRules />
          <RecitationCorrection />
          <MemorizationSection />
          <ReadingTracker />
          <QuranQuiz />
          <BookmarksManager />
          <AdvancedSearch />
          <DetailedStats />
          <NotificationCenter />

          {/* Footer */}
          <footer className="py-16 bg-gradient-to-b from-muted/30 to-muted/50 border-t border-primary/10 elegant-border elegant-gradient">
            <div className="container mx-auto px-4">
              <div className="max-w-6xl mx-auto">
                <div className="grid md:grid-cols-3 gap-8 mb-12">
                  {/* Brand Section */}
                  <div className="text-center md:text-right">
                    <div className="flex items-center justify-center md:justify-end gap-3 mb-4">
                      <img
                        src={zaytounaEmblem}
                        alt="معهد التعليم الزيتوني"
                        className="w-20 h-20 object-contain opacity-90 hover:opacity-100 transition-opacity hover:scale-105 duration-300"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = "/zaytouna-emblem.svg";
                          target.className = "w-20 h-20 object-contain opacity-70";
                        }}
                      />
                      <div>
                        <h3 className="text-2xl font-bold bg-gradient-islamic bg-clip-text text-transparent">
                          مصحف الزيتونة
                        </h3>
                        <p className="text-xs text-muted-foreground mt-1">الرقمية للقرآن الكريم</p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      رفيقك الذكي في رحلة القرآن الكريم
                      <br />
                      مستوحى من شجرة الزيتونة المباركة
                    </p>
                  </div>

                  {/* Quick Links */}
                  <div className="text-center">
                    <h4 className="font-semibold mb-4 text-primary">روابط سريعة</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li><a href="#reading" className="hover:text-primary transition-colors">القراءة</a></li>
                      <li><a href="#memorization" className="hover:text-primary transition-colors">الحفظ</a></li>
                      <li><a href="#quiz" className="hover:text-primary transition-colors">الاختبارات</a></li>
                      <li><a href="#tadabbur" className="hover:text-primary transition-colors">التدبر</a></li>
                    </ul>
                  </div>

                  {/* Info Section */}
                  <div className="text-center md:text-left">
                    <h4 className="font-semibold mb-4 text-primary">معلومات</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>رواية قالون عن نافع</li>
                      <li>الرقمية للقرآن الكريم</li>
                      <li>تونس - 734هـ / 1445هـ</li>
                    </ul>
                  </div>
                </div>

                <div className="pt-8 border-t border-border/50">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
                    <div className="flex flex-wrap items-center justify-center gap-4">
                      <span>© 2024 مصحف الزيتونة</span>
                      <span className="hidden md:inline">•</span>
                      <span>وقف لله تعالى</span>
                      <span className="hidden md:inline">•</span>
                      <span>صنع بـ ❤️ للمسلمين</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs">برواية قالون عن نافع المدني</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </footer>
        </main>
      </div>
      <FloatingAI />
      <ScrollToTop />
    </div>
  );
};

export default Index;
