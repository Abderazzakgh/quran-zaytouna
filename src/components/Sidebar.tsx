import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  BookOpen,
  Bookmark,
  Volume2,
  Heart,
  Brain,
  MessageCircle,
  Calendar,
  Trophy,
  Star,
  Search,
  Bell,
  Settings,
  User,
  TrendingUp,
  Clock,
  Flame,
  Sparkles
} from "lucide-react";
import { useState } from "react";
import { KhatmaTracker } from "./KhatmaTracker";

const Sidebar = () => {
  const [activeFeature, setActiveFeature] = useState("quran");

  const features = [
    { id: "quran", icon: BookOpen, label: "المصحف", badge: null, isActive: true },
    { id: "audio", icon: Volume2, label: "التلاوات", badge: "جديد", isActive: false },
    { id: "ai-assistant", icon: Sparkles, label: "المساعد الذكي", badge: "AI", isActive: false },
    { id: "memorization", icon: Brain, label: "الحفظ", badge: "5", isActive: false },
    { id: "bookmarks", icon: Bookmark, label: "المفضلة", badge: "12", isActive: false },
    { id: "tafsir", icon: MessageCircle, label: "التفسير", badge: null, isActive: false },
    { id: "contemplation", icon: Heart, label: "التدبر", badge: null, isActive: false },
    { id: "search", icon: Search, label: "البحث المتقدم", badge: null, isActive: false },
  ];

  const userStats = {
    name: "أحمد محمد",
    level: "متقدم",
    currentStreak: 18,
    totalPoints: 2450,
    completionPercentage: 65,
    todayGoal: 75
  };

  const quickStats = [
    { label: "الختمة الحالية", value: "65%", color: "text-green-600" },
    { label: "أيام متتالية", value: "18", color: "text-blue-600" },
    { label: "آيات محفوظة", value: "487", color: "text-purple-600" },
    { label: "نقاط اليوم", value: "85", color: "text-orange-600" }
  ];

  return (
    <aside className="w-full lg:w-80 h-screen lg:h-[calc(100vh-6rem)] bg-sidebar border-l lg:border-l border-t lg:border-t-0 border-sidebar-border shadow-soft sidebar-scroll sticky top-0 lg:top-24 prevent-layout-shift">
      <div className="p-4 sm:p-6 h-full">
        <div className="space-y-6 sm:space-y-8">
          {/* User Profile Section */}
          <div className="p-3 sm:p-4 rounded-xl bg-gradient-card border animate-fade-in">
            <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-islamic flex items-center justify-center">
                <User className="h-5 w-5 sm:h-6 sm:w-6 text-primary-foreground" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-sm sm:text-base">{userStats.name}</h3>
                <div className="flex items-center gap-2">
                  <Badge className="text-xs bg-gradient-gold text-accent-foreground">
                    {userStats.level}
                  </Badge>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Flame className="h-3 w-3 text-orange-500" />
                    {userStats.currentStreak} يوم
                  </div>
                </div>
              </div>
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
            </div>

            {/* Khatma Progress Tracker */}
            <div className="mt-3 sm:mt-4">
              <KhatmaTracker />
            </div>
          </div>

          {/* Quick Stats */}
          <div>
            <h4 className="font-semibold text-xs sm:text-sm mb-3 sm:mb-4 text-muted-foreground uppercase tracking-wide">
              إحصائيات سريعة
            </h4>
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              {quickStats.map((stat, index) => (
                <div
                  key={index}
                  className="p-2 sm:p-3 rounded-lg bg-background border hover:shadow-soft transition-all cursor-pointer animate-scale-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className={`text-base sm:text-lg font-bold ${stat.color}`}>{stat.value}</div>
                  <div className="text-xs text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Main Navigation */}
          <nav className="space-y-1 sm:space-y-2">
            <h4 className="font-semibold text-xs sm:text-sm mb-3 sm:mb-4 text-muted-foreground uppercase tracking-wide">
              الميزات الرئيسية
            </h4>
            {features.map((feature, index) => (
              <Button
                key={feature.id}
                variant={activeFeature === feature.id ? "default" : "ghost"}
                className="w-full justify-start h-auto py-2 sm:py-3 px-3 sm:px-4 hover:scale-[1.02] transition-all group text-sm sm:text-base"
                onClick={() => {
                  setActiveFeature(feature.id);
                  const element = document.getElementById(feature.id);
                  if (element) {
                    element.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
              >
                <feature.icon className="ml-2 sm:ml-3 h-4 sm:h-5 w-4 sm:w-5 group-hover:scale-110 transition-transform" />
                <span className="flex-1 text-right">{feature.label}</span>
                {feature.badge && (
                  <Badge
                    variant={feature.badge === "جديد" ? "default" : "secondary"}
                    className={`mr-2 h-4 sm:h-5 text-[0.6rem] sm:text-xs animate-glow ${feature.badge === "جديد" ? "animate-glow" : ""
                      }`}
                  >
                    {feature.badge}
                  </Badge>
                )}
              </Button>
            ))}
          </nav>

          {/* Current Achievement */}
          <div className="p-3 sm:p-4 rounded-xl bg-gradient-gold border animate-float">
            <div className="text-center">
              <Trophy className="h-6 sm:h-8 w-6 sm:w-8 mx-auto mb-2 text-accent-foreground animate-glow" />
              <h4 className="font-semibold text-xs sm:text-sm mb-1 text-accent-foreground">
                إنجاز جديد!
              </h4>
              <p className="text-xs text-accent-foreground/80 mb-3">
                أكملت حفظ سورة البقرة
              </p>
              <Button variant="outline" size="sm" className="bg-white/20 border-white/30 text-accent-foreground hover:bg-white/30 text-xs sm:text-sm">
                عرض الإنجازات
              </Button>
            </div>
          </div>

          {/* Daily Streak */}
          <div className="p-3 sm:p-4 rounded-xl bg-primary/5 border border-primary/20">
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <h4 className="font-semibold text-xs sm:text-sm">السلسلة اليومية</h4>
              <div className="flex items-center gap-1">
                <Flame className="h-3 sm:h-4 w-3 sm:w-4 text-orange-500" />
                <span className="text-xs sm:text-sm font-bold text-primary">{userStats.currentStreak}</span>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-0.5 sm:gap-1 mb-2 sm:mb-3">
              {Array.from({ length: 7 }, (_, i) => (
                <div
                  key={i}
                  className={`w-4 h-4 sm:w-6 sm:h-6 rounded-sm ${i < 6 ? 'bg-primary' : 'bg-muted'
                    } flex items-center justify-center`}
                >
                  {i < 6 && <div className="w-1 h-1 sm:w-2 sm:h-2 bg-primary-foreground rounded-full" />}
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground text-center">
              اقرأ اليوم للحفاظ على سلسلتك!
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;