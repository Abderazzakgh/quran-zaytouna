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
    <aside className="w-80 h-screen bg-sidebar border-l border-sidebar-border shadow-soft overflow-y-auto">
      <div className="p-6">
        {/* User Profile Section */}
        <div className="mb-8 p-4 rounded-xl bg-gradient-card border animate-fade-in">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-full bg-gradient-islamic flex items-center justify-center">
              <User className="h-6 w-6 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">{userStats.name}</h3>
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
          <div className="mt-4">
            <KhatmaTracker />
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mb-8">
          <h4 className="font-semibold text-sm mb-4 text-muted-foreground uppercase tracking-wide">
            إحصائيات سريعة
          </h4>
          <div className="grid grid-cols-2 gap-3">
            {quickStats.map((stat, index) => (
              <div
                key={index}
                className="p-3 rounded-lg bg-background border hover:shadow-soft transition-all cursor-pointer animate-scale-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={`text-lg font-bold ${stat.color}`}>{stat.value}</div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Navigation */}
        <nav className="space-y-2 mb-8">
          <h4 className="font-semibold text-sm mb-4 text-muted-foreground uppercase tracking-wide">
            الميزات الرئيسية
          </h4>
          {features.map((feature, index) => (
            <Button
              key={feature.id}
              variant={activeFeature === feature.id ? "default" : "ghost"}
              className="w-full justify-start h-auto py-3 px-4 hover:scale-105 transition-all group"
              onClick={() => {
                setActiveFeature(feature.id);
                const element = document.getElementById(feature.id);
                if (element) {
                  element.scrollIntoView({ behavior: 'smooth' });
                }
              }}
            >
              <feature.icon className="ml-3 h-5 w-5 group-hover:scale-110 transition-transform" />
              <span className="flex-1 text-right">{feature.label}</span>
              {feature.badge && (
                <Badge
                  variant={feature.badge === "جديد" ? "default" : "secondary"}
                  className={`mr-2 h-5 text-xs animate-glow ${feature.badge === "جديد" ? "animate-glow" : ""
                    }`}
                >
                  {feature.badge}
                </Badge>
              )}
            </Button>
          ))}
        </nav>

        {/* Current Achievement */}
        <div className="p-4 rounded-xl bg-gradient-gold border animate-float">
          <div className="text-center">
            <Trophy className="h-8 w-8 mx-auto mb-2 text-accent-foreground animate-glow" />
            <h4 className="font-semibold text-sm mb-1 text-accent-foreground">
              إنجاز جديد!
            </h4>
            <p className="text-xs text-accent-foreground/80 mb-3">
              أكملت حفظ سورة البقرة
            </p>
            <Button variant="outline" size="sm" className="bg-white/20 border-white/30 text-accent-foreground hover:bg-white/30">
              عرض الإنجازات
            </Button>
          </div>
        </div>

        {/* Daily Streak */}
        <div className="mt-6 p-4 rounded-xl bg-primary/5 border border-primary/20">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-sm">السلسلة اليومية</h4>
            <div className="flex items-center gap-1">
              <Flame className="h-4 w-4 text-orange-500" />
              <span className="text-sm font-bold text-primary">{userStats.currentStreak}</span>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-1 mb-3">
            {Array.from({ length: 7 }, (_, i) => (
              <div
                key={i}
                className={`w-6 h-6 rounded-sm ${i < 6 ? 'bg-primary' : 'bg-muted'
                  } flex items-center justify-center`}
              >
                {i < 6 && <div className="w-2 h-2 bg-primary-foreground rounded-full" />}
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground text-center">
            اقرأ اليوم للحفاظ على سلسلتك!
          </p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;