import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Brain, 
  Trophy, 
  Calendar, 
  Clock,
  PlayCircle,
  CheckCircle2,
  Target,
  TrendingUp,
  Loader2
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";

const MemorizationSection = () => {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const getUserId = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id || null);
    };
    getUserId();
  }, []);

  // Fetch memorization plans
  const { data: plans = [] } = useQuery({
    queryKey: ["memorization_plans", userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from("memorization_plans")
        .select("*")
        .eq("user_id", userId)
        .order("priority", { ascending: false })
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!userId,
  });

  // Fetch today's sessions
  const today = new Date().toISOString().split("T")[0];
  const { data: todaySessions = [] } = useQuery({
    queryKey: ["memorization_sessions", userId, today],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from("memorization_sessions")
        .select(`
          *,
          memorization_plans(surah_name, start_ayah, end_ayah)
        `)
        .eq("user_id", userId)
        .eq("date", today);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!userId,
  });

  // Fetch achievements
  const { data: achievements = [] } = useQuery({
    queryKey: ["achievements", userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from("achievements")
        .select("*")
        .eq("user_id", userId)
        .order("earned_at", { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!userId,
  });

  // Calculate stats
  const completedPlans = plans.filter(p => p.status === "completed").length;
  const todayAyahs = todaySessions.reduce((sum, s) => sum + (s.ayahs_memorized || 0), 0);
  const streakDays = achievements.find(a => a.achievement_type === "streak")?.metadata as any || { days: 0 };
  
  const memorizationStats = [
    { label: "السور المحفوظة", value: String(completedPlans), icon: CheckCircle2, color: "text-green-600" },
    { label: "الآيات اليوم", value: String(todayAyahs), icon: Target, color: "text-blue-600" },
    { label: "أيام متتالية", value: String(streakDays.days || 0), icon: TrendingUp, color: "text-purple-600" },
    { label: "الوقت المتبقي", value: "15 دقيقة", icon: Clock, color: "text-orange-600" }
  ];

  // Format today's plan from active plans
  const todaysPlan = plans.slice(0, 3).map((plan, index) => {
    const session = todaySessions.find(s => s.plan_id === plan.id);
    const totalAyahs = plan.end_ayah - plan.start_ayah + 1;
    const memorizedAyahs = session?.ayahs_memorized || 0;
    const progress = totalAyahs > 0 ? Math.round((memorizedAyahs / totalAyahs) * 100) : 0;
    
    let status = "قادم";
    if (plan.status === "completed" || progress === 100) status = "مكتمل";
    else if (plan.status === "in_progress" || progress > 0) status = "جاري";
    
    return {
      surah: `سورة ${plan.surah_name}`,
      ayahs: `الآيات ${plan.start_ayah}-${plan.end_ayah}`,
      status,
      progress,
      time: session?.time_spent_minutes ? `${session.time_spent_minutes} دقيقة` : "0 دقيقة",
      planId: plan.id,
    };
  });

  // Format achievements
  const formattedAchievements = achievements.slice(0, 3).map(ach => ({
    title: ach.achievement_name,
    description: ach.description || "",
    earned: !!ach.earned_at,
  }));

  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 p-2 rounded-full bg-primary/10 mb-4">
              <Brain className="h-5 w-5 text-primary" />
              <Badge variant="secondary">الحفظ الذكي</Badge>
            </div>
            <h2 className="text-3xl font-bold mb-4">برنامج الحفظ المتقدم</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              نظام حفظ ذكي يعتمد على أحدث طرق التكرار المتباعد لضمان ثبات الحفظ
            </p>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {memorizationStats.map((stat, index) => (
              <Card key={index} className="p-6 text-center">
                <stat.icon className={`h-8 w-8 mx-auto mb-3 ${stat.color}`} />
                <div className="text-2xl font-bold mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </Card>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Today's Plan */}
            <div className="lg:col-span-2">
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    خطة اليوم
                  </h3>
                  <Badge variant="outline">3 مهام</Badge>
                </div>

                <div className="space-y-4">
                  {todaysPlan.length > 0 ? (
                    todaysPlan.map((plan, index) => (
                      <Card key={plan.planId || index} className="p-4 border-l-4 border-l-primary/20">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h4 className="font-medium">{plan.surah}</h4>
                            <p className="text-sm text-muted-foreground">{plan.ayahs}</p>
                          </div>
                          <div className="text-left">
                            <Badge 
                              variant={plan.status === "مكتمل" ? "default" : 
                                     plan.status === "جاري" ? "secondary" : "outline"}
                            >
                              {plan.status}
                            </Badge>
                            <p className="text-xs text-muted-foreground mt-1">{plan.time}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <Progress value={plan.progress} className="flex-1" />
                          <span className="text-sm font-medium">{plan.progress}%</span>
                          <Button 
                            size="sm" 
                            variant={plan.status === "مكتمل" ? "outline" : "default"}
                            disabled={plan.status === "قادم"}
                          >
                            <PlayCircle className="h-4 w-4 ml-1" />
                            {plan.status === "مكتمل" ? "مراجعة" : 
                             plan.status === "جاري" ? "متابعة" : "ابدأ"}
                          </Button>
                        </div>
                      </Card>
                    ))
                  ) : (
                    <Card className="p-8 text-center">
                      <p className="text-muted-foreground">لا توجد خطط حفظ حالياً</p>
                    </Card>
                  )}
                </div>

                <div className="mt-6 p-4 bg-gradient-card rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">التقدم الإجمالي اليوم</h4>
                      <p className="text-sm text-muted-foreground">2 من 3 مهام مكتملة</p>
                    </div>
                    <div className="text-left">
                      <div className="text-2xl font-bold text-primary">67%</div>
                      <Progress value={67} className="w-20 mt-1" />
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Achievements & Streak */}
            <div className="space-y-6">
              <Card className="p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-primary" />
                  الإنجازات
                </h3>
                <div className="space-y-3">
                  {formattedAchievements.length > 0 ? (
                    formattedAchievements.map((achievement, index) => (
                    <div 
                      key={index}
                      className={`p-3 rounded-lg border ${
                        achievement.earned 
                          ? 'bg-primary/5 border-primary/20' 
                          : 'bg-muted/50 border-muted'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          achievement.earned 
                            ? 'bg-primary text-primary-foreground' 
                            : 'bg-muted text-muted-foreground'
                        }`}>
                          <Trophy className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-sm font-medium">{achievement.title}</h4>
                          <p className="text-xs text-muted-foreground">{achievement.description}</p>
                        </div>
                      </div>
                    </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      لا توجد إنجازات بعد
                    </p>
                  )}
                </div>
              </Card>

              <Card className="p-6 bg-gradient-gold">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-accent-foreground/10 flex items-center justify-center">
                    <TrendingUp className="h-8 w-8 text-accent-foreground" />
                  </div>
                  <h3 className="font-bold text-accent-foreground mb-2">
                    18 يوماً متتالياً!
                  </h3>
                  <p className="text-sm text-accent-foreground/80 mb-4">
                    أنت في طريقك لتحقيق هدف الشهر
                  </p>
                  <Button variant="outline" size="sm" className="bg-white/20 border-white/30">
                    عرض التفاصيل
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MemorizationSection;