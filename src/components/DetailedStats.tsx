import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, 
  Calendar, 
  Target, 
  Clock,
  Award,
  BookOpen,
  Volume2,
  Heart,
  Star,
  Trophy,
  Flame,
  Zap,
  BarChart3
} from "lucide-react";

const DetailedStats = () => {
  const stats = {
    daily: {
      reading: { current: 45, target: 60, unit: "دقيقة" },
      listening: { current: 32, target: 45, unit: "دقيقة" },
      memorization: { current: 3, target: 5, unit: "آيات" },
      contemplation: { current: 2, target: 3, unit: "مواضيع" }
    },
    weekly: {
      readingStreak: 18,
      totalPages: 156,
      averageDaily: 22,
      bestDay: "الجمعة"
    },
    overall: {
      totalSuras: 24,
      totalAyahs: 487,
      totalHours: 124,
      rank: "متقدم"
    }
  };

  const achievements = [
    { 
      id: 1, 
      title: "حافظ الفاتحة", 
      description: "حفظت سورة الفاتحة كاملة", 
      earned: true, 
      date: "2024-01-15",
      points: 100,
      rarity: "شائع"
    },
    { 
      id: 2, 
      title: "مثابر الأسبوع", 
      description: "قرأت يومياً لمدة أسبوع كامل", 
      earned: true, 
      date: "2024-01-22",
      points: 250,
      rarity: "نادر"
    },
    { 
      id: 3, 
      title: "حافظ البقرة", 
      description: "حفظت سورة البقرة كاملة", 
      earned: false, 
      progress: 65,
      points: 1000,
      rarity: "أسطوري"
    },
    { 
      id: 4, 
      title: "متدبر عميق", 
      description: "تدبرت 100 آية مختلفة", 
      earned: false, 
      progress: 78,
      points: 500,
      rarity: "نادر"
    }
  ];

  const weeklyData = [
    { day: "السبت", reading: 40, listening: 25, memorization: 4 },
    { day: "الأحد", reading: 35, listening: 30, memorization: 3 },
    { day: "الاثنين", reading: 50, listening: 20, memorization: 5 },
    { day: "الثلاثاء", reading: 45, listening: 35, memorization: 4 },
    { day: "الأربعاء", reading: 60, listening: 40, memorization: 6 },
    { day: "الخميس", reading: 55, listening: 38, memorization: 5 },
    { day: "الجمعة", reading: 70, listening: 45, memorization: 7 }
  ];

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "شائع": return "bg-gray-500";
      case "نادر": return "bg-blue-500";
      case "أسطوري": return "bg-purple-500";
      default: return "bg-gray-500";
    }
  };

  return (
    <section className="py-12 bg-muted/20">
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">إحصائياتك التفصيلية</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              تتبع تقدمك في القراءة والحفظ والتدبر مع تحليلات مفصلة وشخصية
            </p>
          </div>

          {/* Daily Goals */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="p-6 animate-fade-in">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-islamic flex items-center justify-center">
                    <BookOpen className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold">القراءة اليومية</h3>
                    <p className="text-sm text-muted-foreground">الهدف: {stats.daily.reading.target} {stats.daily.reading.unit}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-2xl font-bold text-primary">{stats.daily.reading.current}</span>
                  <span className="text-sm text-muted-foreground">/{stats.daily.reading.target} {stats.daily.reading.unit}</span>
                </div>
                <Progress value={(stats.daily.reading.current / stats.daily.reading.target) * 100} />
              </div>
            </Card>

            <Card className="p-6 animate-fade-in" style={{ animationDelay: '100ms' }}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-gold flex items-center justify-center">
                    <Volume2 className="h-6 w-6 text-accent-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold">الاستماع</h3>
                    <p className="text-sm text-muted-foreground">الهدف: {stats.daily.listening.target} {stats.daily.listening.unit}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-2xl font-bold text-primary">{stats.daily.listening.current}</span>
                  <span className="text-sm text-muted-foreground">/{stats.daily.listening.target} {stats.daily.listening.unit}</span>
                </div>
                <Progress value={(stats.daily.listening.current / stats.daily.listening.target) * 100} />
              </div>
            </Card>

            <Card className="p-6 animate-fade-in" style={{ animationDelay: '200ms' }}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center">
                    <Target className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold">الحفظ</h3>
                    <p className="text-sm text-muted-foreground">الهدف: {stats.daily.memorization.target} {stats.daily.memorization.unit}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-2xl font-bold text-primary">{stats.daily.memorization.current}</span>
                  <span className="text-sm text-muted-foreground">/{stats.daily.memorization.target} {stats.daily.memorization.unit}</span>
                </div>
                <Progress value={(stats.daily.memorization.current / stats.daily.memorization.target) * 100} />
              </div>
            </Card>

            <Card className="p-6 animate-fade-in" style={{ animationDelay: '300ms' }}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-purple-500 flex items-center justify-center">
                    <Heart className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold">التدبر</h3>
                    <p className="text-sm text-muted-foreground">الهدف: {stats.daily.contemplation.target} {stats.daily.contemplation.unit}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-2xl font-bold text-primary">{stats.daily.contemplation.current}</span>
                  <span className="text-sm text-muted-foreground">/{stats.daily.contemplation.target} {stats.daily.contemplation.unit}</span>
                </div>
                <Progress value={(stats.daily.contemplation.current / stats.daily.contemplation.target) * 100} />
              </div>
            </Card>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Weekly Chart */}
            <div className="lg:col-span-2">
              <Card className="p-6">
                <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  الأداء الأسبوعي
                </h3>
                
                <div className="space-y-4">
                  {weeklyData.map((day, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{day.day}</span>
                        <span className="text-muted-foreground">
                          {day.reading + day.listening + day.memorization} نقطة
                        </span>
                      </div>
                      <div className="flex gap-1 h-2">
                        <div 
                          className="bg-gradient-islamic rounded-sm"
                          style={{ width: `${(day.reading / 100) * 100}%` }}
                        />
                        <div 
                          className="bg-gradient-gold rounded-sm"
                          style={{ width: `${(day.listening / 100) * 100}%` }}
                        />
                        <div 
                          className="bg-blue-500 rounded-sm"
                          style={{ width: `${(day.memorization / 10) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-4 border-t">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-gradient-islamic rounded-sm" />
                        <span>قراءة</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-gradient-gold rounded-sm" />
                        <span>استماع</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-sm" />
                        <span>حفظ</span>
                      </div>
                    </div>
                    <div className="text-muted-foreground">
                      أفضل يوم: {stats.weekly.bestDay}
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Overall Stats & Achievements */}
            <div className="space-y-6">
              {/* Overall Stats */}
              <Card className="p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-primary" />
                  الإحصائيات العامة
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">السور المحفوظة</span>
                    <span className="font-semibold">{stats.overall.totalSuras}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">إجمالي الآيات</span>
                    <span className="font-semibold">{stats.overall.totalAyahs}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">ساعات الاستماع</span>
                    <span className="font-semibold">{stats.overall.totalHours}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">المستوى</span>
                    <Badge className="bg-gradient-islamic text-primary-foreground">
                      {stats.overall.rank}
                    </Badge>
                  </div>
                </div>
              </Card>

              {/* Achievements */}
              <Card className="p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Award className="h-5 w-5 text-primary" />
                  الإنجازات
                </h3>
                <div className="space-y-3">
                  {achievements.map((achievement) => (
                    <div 
                      key={achievement.id}
                      className={`p-3 rounded-lg border transition-all ${
                        achievement.earned 
                          ? 'bg-primary/5 border-primary/20' 
                          : 'bg-muted/50 border-muted hover:bg-muted/80'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          achievement.earned 
                            ? 'bg-primary text-primary-foreground' 
                            : 'bg-muted text-muted-foreground'
                        }`}>
                          <Trophy className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium">{achievement.title}</h4>
                          <p className="text-xs text-muted-foreground mb-2">{achievement.description}</p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${getRarityColor(achievement.rarity)}`} />
                              <span className="text-xs text-muted-foreground">{achievement.rarity}</span>
                            </div>
                            <span className="text-xs font-medium">{achievement.points} نقطة</span>
                          </div>
                          {!achievement.earned && achievement.progress && (
                            <div className="mt-2">
                              <Progress value={achievement.progress} className="h-1" />
                              <p className="text-xs text-muted-foreground mt-1">{achievement.progress}% مكتمل</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DetailedStats;