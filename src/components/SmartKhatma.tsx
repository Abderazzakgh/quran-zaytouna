import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Calendar,
  Target,
  Clock,
  TrendingUp,
  CheckCircle,
  Play,
  Pause,
  RotateCcw,
  Settings,
  Flame,
  Trophy,
  BookOpen,
  Loader2
} from "lucide-react";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface KhatmaGoal {
  id: string;
  name: string;
  days: number;
  pagesPerDay: number;
  description: string;
}

const khatmaGoals: KhatmaGoal[] = [
  { id: "7days", name: "ختمة أسبوعية", days: 7, pagesPerDay: 86, description: "للمتقدمين - 86 صفحة يومياً" },
  { id: "15days", name: "ختمة نصف شهرية", days: 15, pagesPerDay: 40, description: "مكثفة - 40 صفحة يومياً" },
  { id: "30days", name: "ختمة شهرية", days: 30, pagesPerDay: 20, description: "متوسطة - 20 صفحة يومياً (جزء)" },
  { id: "60days", name: "ختمة شهرين", days: 60, pagesPerDay: 10, description: "مريحة - 10 صفحات يومياً" },
  { id: "ramadan", name: "ختمة رمضان", days: 30, pagesPerDay: 20, description: "ختمة مباركة في الشهر الفضيل" },
];

const SmartKhatma = () => {
  const [selectedGoal, setSelectedGoal] = useState<KhatmaGoal>(khatmaGoals[2]);
  const [userId, setUserId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const getUserId = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id || null);
    };
    getUserId();
  }, []);

  // Fetch active khatma
  const { data: activeKhatma, isLoading: khatmaLoading } = useQuery({
    queryKey: ["active_khatma", userId],
    queryFn: async () => {
      if (!userId) return null;
      const { data, error } = await supabase
        .from("khatma_history")
        .select("*")
        .eq("user_id", userId)
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(1)
        .single();
      
      if (error && error.code !== "PGRST116") throw error;
      return data;
    },
    enabled: !!userId,
  });

  // Fetch daily progress
  const { data: dailyProgress } = useQuery({
    queryKey: ["khatma_daily_progress", activeKhatma?.id],
    queryFn: async () => {
      if (!activeKhatma) return null;
      const today = new Date().toISOString().split("T")[0];
      const { data, error } = await supabase
        .from("khatma_daily_progress")
        .select("*")
        .eq("khatma_id", activeKhatma.id)
        .eq("date", today)
        .single();
      
      if (error && error.code !== "PGRST116") throw error;
      return data;
    },
    enabled: !!activeKhatma,
  });

  const isActive = !!activeKhatma;
  const currentDay = activeKhatma 
    ? Math.ceil((activeKhatma.pages_completed || 0) / (activeKhatma.pages_per_day || 1)) + 1
    : 1;
  const pagesReadToday = dailyProgress?.pages_read || 0;
  const totalPagesRead = activeKhatma?.pages_completed || 0;
  const streak = activeKhatma 
    ? Math.floor((new Date().getTime() - new Date(activeKhatma.start_date).getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  const totalPages = activeKhatma?.total_pages || 604;
  const overallProgress = (totalPagesRead / totalPages) * 100;
  const todayProgress = activeKhatma 
    ? (pagesReadToday / (activeKhatma.pages_per_day || 1)) * 100
    : 0;
  const expectedProgress = activeKhatma && activeKhatma.target_days
    ? (currentDay / activeKhatma.target_days) * 100
    : 0;
  const isAhead = overallProgress >= expectedProgress;

  // Start khatma mutation
  const startKhatmaMutation = useMutation({
    mutationFn: async (goal: KhatmaGoal) => {
      if (!userId) throw new Error("Not authenticated");
      
      const startDate = new Date().toISOString().split("T")[0];
      const { data, error } = await supabase
        .from("khatma_history")
        .insert({
          user_id: userId,
          name: goal.name,
          start_date: startDate,
          target_days: goal.days,
          pages_per_day: goal.pagesPerDay,
          total_pages: 604,
          pages_completed: 0,
          status: "active",
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["active_khatma", userId] });
      toast.success("تم بدء الختمة بنجاح! بارك الله فيك");
    },
    onError: (error: Error) => {
      toast.error("حدث خطأ: " + error.message);
    },
  });

  const startKhatma = () => {
    startKhatmaMutation.mutate(selectedGoal);
  };

  // Pause khatma mutation
  const pauseKhatmaMutation = useMutation({
    mutationFn: async () => {
      if (!activeKhatma) return;
      const { error } = await supabase
        .from("khatma_history")
        .update({ status: "paused" })
        .eq("id", activeKhatma.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["active_khatma", userId] });
      toast.info("تم إيقاف الختمة مؤقتاً");
    },
  });

  const pauseKhatma = () => {
    pauseKhatmaMutation.mutate();
  };

  // Reset khatma mutation
  const resetKhatmaMutation = useMutation({
    mutationFn: async () => {
      if (!activeKhatma) return;
      const { error } = await supabase
        .from("khatma_history")
        .update({ status: "paused", pages_completed: 0 })
        .eq("id", activeKhatma.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["active_khatma", userId] });
      toast.info("تم إعادة تعيين الختمة");
    },
  });

  const resetKhatma = () => {
    if (confirm("هل أنت متأكد من إعادة تعيين الختمة؟")) {
      resetKhatmaMutation.mutate();
    }
  };

  // Add pages mutation
  const addPagesMutation = useMutation({
    mutationFn: async (pages: number) => {
      if (!activeKhatma || !userId) throw new Error("No active khatma");
      
      const today = new Date().toISOString().split("T")[0];
      const newPagesRead = pagesReadToday + pages;
      const newTotalPages = Math.min(totalPagesRead + pages, totalPages);
      
      // Update khatma
      const { error: khatmaError } = await supabase
        .from("khatma_history")
        .update({ pages_completed: newTotalPages })
        .eq("id", activeKhatma.id);
      
      if (khatmaError) throw khatmaError;

      // Update or create daily progress
      const { error: progressError } = await supabase
        .from("khatma_daily_progress")
        .upsert({
          khatma_id: activeKhatma.id,
          day_number: currentDay,
          date: today,
          pages_read: newPagesRead,
          target_pages: activeKhatma.pages_per_day || selectedGoal.pagesPerDay,
          completed: newPagesRead >= (activeKhatma.pages_per_day || selectedGoal.pagesPerDay),
        }, {
          onConflict: "khatma_id,day_number",
        });
      
      if (progressError) throw progressError;

      return { newPagesRead, newTotalPages };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["active_khatma", userId] });
      queryClient.invalidateQueries({ queryKey: ["khatma_daily_progress", activeKhatma?.id] });
      
      if (data.newPagesRead >= (activeKhatma?.pages_per_day || selectedGoal.pagesPerDay)) {
        toast.success("أحسنت! أكملت هدف اليوم 🎉");
      }
    },
    onError: (error: Error) => {
      toast.error("حدث خطأ: " + error.message);
    },
  });

  const addPages = (pages: number) => {
    addPagesMutation.mutate(pages);
  };

  const completeToday = () => {
    const remaining = (activeKhatma?.pages_per_day || selectedGoal.pagesPerDay) - pagesReadToday;
    if (remaining > 0) {
      addPages(remaining);
    }
  };

  const nextDay = () => {
    // This will be handled automatically by the daily progress system
    toast.info("سيتم الانتقال تلقائياً عند بدء يوم جديد");
  };

  const getDailySchedule = () => {
    if (!activeKhatma) return [];
    
    const schedule = [];
    const pagesPerDay = activeKhatma.pages_per_day || selectedGoal.pagesPerDay;
    const totalDays = activeKhatma.target_days || selectedGoal.days;
    
    for (let i = 1; i <= Math.min(7, totalDays); i++) {
      const dayNum = currentDay + i - 1;
      if (dayNum > totalDays) break;
      
      const startPage = ((dayNum - 1) * pagesPerDay) + 1;
      const endPage = Math.min(dayNum * pagesPerDay, totalPages);
      const juz = Math.ceil(endPage / 20);
      
      schedule.push({
        day: dayNum,
        startPage,
        endPage,
        juz,
        isToday: dayNum === currentDay,
        isCompleted: dayNum < currentDay
      });
    }
    return schedule;
  };

  return (
    <section className="py-12 bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 p-2 rounded-full bg-primary/10 mb-4">
              <Calendar className="h-5 w-5 text-primary" />
              <Badge variant="secondary">الختمة الذكية</Badge>
            </div>
            <h2 className="text-3xl font-bold mb-3">جدول ختمة مخصص</h2>
            <p className="text-muted-foreground">خطط لختمتك واتبع تقدمك بذكاء</p>
          </div>

          {!isActive ? (
            <Card className="p-8 bg-gradient-card border-primary/10">
              <div className="text-center mb-8">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-islamic flex items-center justify-center">
                  <BookOpen className="h-10 w-10 text-primary-foreground" />
                </div>
                <h3 className="text-2xl font-bold mb-2">ابدأ ختمة جديدة</h3>
                <p className="text-muted-foreground">اختر هدفك وابدأ رحلتك مع كتاب الله</p>
              </div>

              <div className="max-w-md mx-auto space-y-4">
                <label className="text-sm font-medium">اختر نوع الختمة</label>
                <Select
                  value={selectedGoal.id}
                  onValueChange={(value) => {
                    const goal = khatmaGoals.find(g => g.id === value);
                    if (goal) setSelectedGoal(goal);
                  }}
                >
                  <SelectTrigger className="h-14">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {khatmaGoals.map((goal) => (
                      <SelectItem key={goal.id} value={goal.id}>
                        <div className="flex flex-col items-start">
                          <span className="font-medium">{goal.name}</span>
                          <span className="text-xs text-muted-foreground">{goal.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Card className="p-4 bg-muted/50">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-primary">{selectedGoal.days}</div>
                      <div className="text-xs text-muted-foreground">يوم</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-primary">{selectedGoal.pagesPerDay}</div>
                      <div className="text-xs text-muted-foreground">صفحة/يوم</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-primary">{Math.ceil(selectedGoal.pagesPerDay / 20)}</div>
                      <div className="text-xs text-muted-foreground">جزء/يوم</div>
                    </div>
                  </div>
                </Card>

                <Button 
                  onClick={startKhatma} 
                  className="w-full h-14 text-lg gap-2"
                  disabled={startKhatmaMutation.isPending}
                >
                  {startKhatmaMutation.isPending ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Play className="h-5 w-5" />
                  )}
                  ابدأ الختمة
                </Button>
              </div>
            </Card>
          ) : (
            <div className="space-y-6">
              {/* Progress Overview */}
              <Card className="p-6 bg-gradient-card border-primary/10">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-islamic flex items-center justify-center">
                      <Target className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <div>
                      <h3 className="font-bold">{activeKhatma?.name || selectedGoal.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        اليوم {currentDay} من {activeKhatma?.target_days || selectedGoal.days}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={isAhead ? "default" : "secondary"} className="gap-1">
                      {isAhead ? <TrendingUp className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                      {isAhead ? "متقدم" : "متأخر"}
                    </Badge>
                    <Button variant="ghost" size="icon" onClick={pauseKhatma}>
                      <Pause className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={resetKhatma}>
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Overall Progress */}
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>تقدم الختمة الكلي</span>
                      <span className="font-medium">{totalPagesRead} / {totalPages} صفحة ({overallProgress.toFixed(1)}%)</span>
                    </div>
                    <Progress value={overallProgress} className="h-3" />
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>هدف اليوم</span>
                      <span className="font-medium">
                        {pagesReadToday} / {activeKhatma?.pages_per_day || selectedGoal.pagesPerDay} صفحة
                      </span>
                    </div>
                    <Progress value={todayProgress} className="h-2" />
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-4 gap-4 mt-6">
                  <div className="text-center p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center justify-center gap-1 text-orange-500 mb-1">
                      <Flame className="h-4 w-4" />
                      <span className="text-xl font-bold">{streak}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">سلسلة</div>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-muted/50">
                    <div className="text-xl font-bold text-primary">{totalPagesRead}</div>
                    <div className="text-xs text-muted-foreground">صفحة مقروءة</div>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-muted/50">
                    <div className="text-xl font-bold text-primary">{Math.ceil(totalPagesRead / 20)}</div>
                    <div className="text-xs text-muted-foreground">جزء</div>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-muted/50">
                    <div className="text-xl font-bold text-primary">
                      {(activeKhatma?.target_days || selectedGoal.days) - currentDay}
                    </div>
                    <div className="text-xs text-muted-foreground">يوم متبقي</div>
                  </div>
                </div>

                {/* Today's Actions */}
                <div className="flex gap-3 mt-6">
                  <Button onClick={() => addPages(5)} variant="outline" className="flex-1">
                    +5 صفحات
                  </Button>
                  <Button onClick={() => addPages(10)} variant="outline" className="flex-1">
                    +10 صفحات
                  </Button>
                  <Button onClick={completeToday} className="flex-1 gap-2">
                    <CheckCircle className="h-4 w-4" />
                    إكمال اليوم
                  </Button>
                </div>
              </Card>

              {/* Daily Schedule */}
              <Card className="p-6">
                <h3 className="font-bold mb-4 flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  جدول الأيام القادمة
                </h3>
                <div className="space-y-2">
                  {getDailySchedule().map((day) => (
                    <div 
                      key={day.day}
                      className={`flex items-center justify-between p-3 rounded-lg transition-all ${
                        day.isToday 
                          ? "bg-primary/10 border border-primary/20" 
                          : day.isCompleted 
                            ? "bg-green-50 dark:bg-green-950/20" 
                            : "bg-muted/50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {day.isCompleted ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : day.isToday ? (
                          <div className="w-5 h-5 rounded-full bg-primary animate-pulse" />
                        ) : (
                          <div className="w-5 h-5 rounded-full border-2 border-muted-foreground/30" />
                        )}
                        <div>
                          <span className="font-medium">اليوم {day.day}</span>
                          {day.isToday && <Badge className="mr-2 text-xs">اليوم</Badge>}
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        صفحة {day.startPage} - {day.endPage} (الجزء {day.juz})
                      </div>
                    </div>
                  ))}
                </div>

                {activeKhatma && 
                 currentDay < (activeKhatma.target_days || selectedGoal.days) && 
                 pagesReadToday >= (activeKhatma.pages_per_day || selectedGoal.pagesPerDay) && (
                  <Button onClick={nextDay} className="w-full mt-4 gap-2">
                    الانتقال لليوم التالي
                    <Trophy className="h-4 w-4" />
                  </Button>
                )}
              </Card>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default SmartKhatma;
