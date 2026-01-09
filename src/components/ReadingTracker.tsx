import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  BookMarked, 
  Target,
  Flame,
  Calendar,
  TrendingUp,
  Award,
  Clock,
  ChevronLeft,
  Loader2
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { toast } from "sonner";

const ReadingTracker = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const getUserId = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id || null);
    };
    getUserId();
  }, []);

  // Fetch reading goals
  const { data: readingGoals } = useQuery({
    queryKey: ["reading_goals", userId],
    queryFn: async () => {
      if (!userId) return null;
      const { data, error } = await supabase
        .from("reading_goals")
        .select("*")
        .eq("user_id", userId)
        .single();
      
      if (error && error.code !== "PGRST116") throw error;
      return data;
    },
    enabled: !!userId,
  });

  // Fetch today's session
  const today = new Date().toISOString().split("T")[0];
  const { data: todaySession } = useQuery({
    queryKey: ["reading_sessions", userId, today],
    queryFn: async () => {
      if (!userId) return null;
      const { data, error } = await supabase
        .from("reading_sessions")
        .select("*")
        .eq("user_id", userId)
        .eq("date", today)
        .single();
      
      if (error && error.code !== "PGRST116") throw error;
      return data;
    },
    enabled: !!userId,
  });

  // Fetch weekly sessions
  const { data: weeklySessions = [] } = useQuery({
    queryKey: ["reading_sessions_weekly", userId],
    queryFn: async () => {
      if (!userId) return [];
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      
      const { data, error } = await supabase
        .from("reading_sessions")
        .select("*")
        .eq("user_id", userId)
        .gte("date", weekAgo.toISOString().split("T")[0])
        .order("date", { ascending: true });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!userId,
  });

  // Fetch khatma history
  const { data: khatmaHistory = [] } = useQuery({
    queryKey: ["khatma_history", userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from("khatma_history")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(5);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!userId,
  });

  // Calculate stats
  const totalPages = 604;
  const pagesRead = todaySession?.pages_read || 0;
  const dailyGoal = readingGoals?.daily_pages_goal || 5;
  const todayPages = todaySession?.pages_read || 0;
  const currentJuz = todaySession?.juz_number || Math.ceil((pagesRead || 1) / 20);
  
  // Calculate streak
  const { data: streakData } = useQuery({
    queryKey: ["reading_streak", userId],
    queryFn: async () => {
      if (!userId) return { streak: 0 };
      const { data, error } = await supabase
        .from("reading_sessions")
        .select("date")
        .eq("user_id", userId)
        .order("date", { ascending: false });
      
      if (error) throw error;
      
      let streak = 0;
      if (data && data.length > 0) {
        const sortedDates = data.map(d => new Date(d.date).getTime()).sort((a, b) => b - a);
        let checkDate = new Date();
        checkDate.setHours(0, 0, 0, 0);
        
        for (const date of sortedDates) {
          const sessionDate = new Date(date);
          sessionDate.setHours(0, 0, 0, 0);
          const diffDays = Math.floor((checkDate.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24));
          
          if (diffDays === streak) {
            streak++;
            checkDate = sessionDate;
          } else if (diffDays > streak) {
            break;
          }
        }
      }
      
      return { streak };
    },
    enabled: !!userId,
  });

  const streak = streakData?.streak || 0;
  const progressPercentage = (pagesRead / totalPages) * 100;

  // Weekly progress
  const weekDays = ["السبت", "الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة"];
  const weeklyProgress = weekDays.map((day, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - index));
    const dateStr = date.toISOString().split("T")[0];
    const session = weeklySessions.find(s => s.date === dateStr);
    return {
      day,
      pages: session?.pages_read || 0,
      goal: dailyGoal,
    };
  });

  // Format khatma history
  const formattedKhatmaHistory = khatmaHistory.map(khatma => {
    const startDate = new Date(khatma.start_date);
    const endDate = khatma.end_date ? new Date(khatma.end_date) : null;
    const duration = endDate 
      ? Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
      : Math.ceil((new Date().getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    return {
      id: khatma.id,
      startDate: startDate.toLocaleDateString("ar-SA"),
      endDate: endDate ? endDate.toLocaleDateString("ar-SA") : "جاري",
      duration: `${duration} يوم`,
    };
  });

  return (
    <section className="py-12 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 p-2 rounded-full bg-primary/10 mb-4">
              <BookMarked className="h-5 w-5 text-primary" />
              <Badge variant="secondary">تتبع القراءة</Badge>
            </div>
            <h2 className="text-3xl font-bold mb-4">تقدمك في القراءة</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              تابع تقدمك في ختم القرآن الكريم وحقق أهدافك اليومية
            </p>
          </div>

          {/* Main Progress Card */}
          <Card className="p-8 mb-8 bg-gradient-card">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-islamic flex items-center justify-center">
                    <BookMarked className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">ختمتك الحالية</h3>
                    <p className="text-sm text-muted-foreground">بدأت منذ 15 يوم</p>
                  </div>
                </div>

                <div className="mb-6">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-muted-foreground">التقدم الإجمالي</span>
                    <span className="font-bold">{progressPercentage.toFixed(1)}%</span>
                  </div>
                  <Progress value={progressPercentage} className="h-4" />
                  <div className="flex justify-between mt-2 text-sm text-muted-foreground">
                    <span>{pagesRead} صفحة</span>
                    <span>{totalPages} صفحة</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Card className="p-4 bg-background">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <Target className="h-4 w-4" />
                      <span className="text-xs">الجزء الحالي</span>
                    </div>
                    <p className="text-2xl font-bold">الجزء {currentJuz}</p>
                  </Card>
                  <Card className="p-4 bg-background">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <Clock className="h-4 w-4" />
                      <span className="text-xs">المتبقي</span>
                    </div>
                    <p className="text-2xl font-bold">{totalPages - pagesRead} صفحة</p>
                  </Card>
                </div>
              </div>

              {/* Circular Progress */}
              <div className="flex justify-center">
                <div className="relative w-56 h-56">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="112"
                      cy="112"
                      r="100"
                      stroke="currentColor"
                      strokeWidth="12"
                      fill="none"
                      className="text-muted"
                    />
                    <circle
                      cx="112"
                      cy="112"
                      r="100"
                      stroke="url(#gradient)"
                      strokeWidth="12"
                      fill="none"
                      strokeLinecap="round"
                      strokeDasharray={`${progressPercentage * 6.28} 628`}
                    />
                    <defs>
                      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="hsl(145, 65%, 35%)" />
                        <stop offset="100%" stopColor="hsl(145, 55%, 45%)" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-4xl font-bold">{progressPercentage.toFixed(0)}%</span>
                    <span className="text-sm text-muted-foreground">مكتمل</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center">
                  <Flame className="h-5 w-5 text-orange-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{streak}</p>
                  <p className="text-xs text-muted-foreground">يوم متتالي</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <Target className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{todayPages}/{dailyGoal}</p>
                  <p className="text-xs text-muted-foreground">صفحات اليوم</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {todaySession?.time_spent_minutes 
                      ? `${Math.floor(todaySession.time_spent_minutes / 60)}:${String(todaySession.time_spent_minutes % 60).padStart(2, "0")}`
                      : "0:00"}
                  </p>
                  <p className="text-xs text-muted-foreground">وقت القراءة</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-purple-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {todaySession?.time_spent_minutes && todayPages > 0
                      ? `${Math.round((todayPages / todaySession.time_spent_minutes) * 60)} صفحة/ساعة`
                      : "0 صفحة/ساعة"}
                  </p>
                  <p className="text-xs text-muted-foreground">متوسط السرعة</p>
                </div>
              </div>
            </Card>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Weekly Progress */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  تقدم الأسبوع
                </h3>
                <Badge variant="outline">هذا الأسبوع</Badge>
              </div>
              
              <div className="space-y-4">
                {weeklyProgress.map((day, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <span className="w-16 text-sm text-muted-foreground">{day.day}</span>
                    <div className="flex-1">
                      <Progress 
                        value={(day.pages / day.goal) * 100} 
                        className="h-2"
                      />
                    </div>
                    <span className={`text-sm font-medium ${day.pages >= day.goal ? 'text-green-600' : 'text-muted-foreground'}`}>
                      {day.pages}/{day.goal}
                    </span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Khatma History */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold flex items-center gap-2">
                  <Award className="h-5 w-5 text-primary" />
                  سجل الختمات
                </h3>
                <Button variant="ghost" size="sm">
                  عرض الكل
                  <ChevronLeft className="h-4 w-4 mr-1" />
                </Button>
              </div>
              
              <div className="space-y-4">
                {formattedKhatmaHistory.length > 0 ? (
                  formattedKhatmaHistory.map((khatma) => (
                    <Card key={khatma.id} className="p-4 bg-muted/50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-gold flex items-center justify-center">
                            <Award className="h-5 w-5 text-accent-foreground" />
                          </div>
                          <div>
                            <p className="font-medium">الختمة #{khatma.id.slice(0, 8)}</p>
                            <p className="text-xs text-muted-foreground">
                              {khatma.startDate} - {khatma.endDate}
                            </p>
                          </div>
                        </div>
                        <Badge variant="secondary">{khatma.duration}</Badge>
                      </div>
                    </Card>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    لا توجد ختمات سابقة
                  </p>
                )}
              </div>

              <Button className="w-full mt-4">
                بدء ختمة جديدة
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ReadingTracker;
