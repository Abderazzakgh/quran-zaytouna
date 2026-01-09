import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Bell, 
  Settings, 
  CheckCircle2, 
  Clock,
  BookOpen,
  Volume2,
  Brain,
  Heart,
  Calendar,
  X
} from "lucide-react";
import { useState } from "react";

const NotificationCenter = () => {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: "reminder",
      title: "وقت الورد اليومي",
      message: "حان وقت قراءة ورد اليوم من سورة البقرة",
      time: "منذ 5 دقائق",
      isRead: false,
      icon: BookOpen,
      color: "text-blue-600"
    },
    {
      id: 2,
      type: "achievement",
      title: "إنجاز جديد!",
      message: "مبروك! لقد أكملت حفظ 10 آيات جديدة",
      time: "منذ ساعة",
      isRead: false,
      icon: Brain,
      color: "text-green-600"
    },
    {
      id: 3,
      type: "contemplation",
      title: "آية للتدبر",
      message: "تدبر آية اليوم: 'وما أوتيتم من العلم إلا قليلاً'",
      time: "منذ 3 ساعات",
      isRead: true,
      icon: Heart,
      color: "text-purple-600"
    },
    {
      id: 4,
      type: "audio",
      title: "تلاوة جديدة",
      message: "تم إضافة تلاوة جديدة للشيخ ماهر المعيقلي",
      time: "أمس",
      isRead: true,
      icon: Volume2,
      color: "text-orange-600"
    },
    {
      id: 5,
      type: "schedule",
      title: "جدولة مراجعة",
      message: "لا تنس مراجعة سورة الفاتحة اليوم",
      time: "أمس",
      isRead: false,
      icon: Calendar,
      color: "text-indigo-600"
    }
  ]);

  const markAsRead = (id: number) => {
    setNotifications(notifications.map(notif => 
      notif.id === id ? { ...notif, isRead: true } : notif
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(notif => ({ ...notif, isRead: true })));
  };

  const removeNotification = (id: number) => {
    setNotifications(notifications.filter(notif => notif.id !== id));
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "reminder": return "تذكير";
      case "achievement": return "إنجاز";
      case "contemplation": return "تدبر";
      case "audio": return "صوتي";
      case "schedule": return "جدولة";
      default: return "عام";
    }
  };

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case "reminder": return "bg-blue-500";
      case "achievement": return "bg-green-500";
      case "contemplation": return "bg-purple-500";
      case "audio": return "bg-orange-500";
      case "schedule": return "bg-indigo-500";
      default: return "bg-gray-500";
    }
  };

  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="relative">
                <Bell className="h-8 w-8 text-primary" />
                {unreadCount > 0 && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-glow">
                    {unreadCount}
                  </div>
                )}
              </div>
              <h2 className="text-3xl font-bold">مركز الإشعارات</h2>
            </div>
            <p className="text-muted-foreground">
              ابق على اطلاع بتذكيراتك وإنجازاتك القرآنية
            </p>
          </div>

          {/* Notification Controls */}
          <Card className="p-4 mb-6 animate-fade-in">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="text-sm text-muted-foreground">
                  {unreadCount > 0 ? `${unreadCount} إشعارات غير مقروءة` : "جميع الإشعارات مقروءة"}
                </div>
                {unreadCount > 0 && (
                  <Button variant="outline" size="sm" onClick={markAllAsRead}>
                    <CheckCircle2 className="h-4 w-4 ml-1" />
                    وضع علامة مقروء للكل
                  </Button>
                )}
              </div>
              
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4 ml-1" />
                إعدادات الإشعارات
              </Button>
            </div>
          </Card>

          {/* Notifications List */}
          <div className="space-y-4">
            {notifications.map((notification, index) => (
              <Card 
                key={notification.id}
                className={`p-6 transition-all hover:shadow-soft animate-slide-up ${
                  !notification.isRead ? 'border-l-4 border-l-primary bg-primary/2' : ''
                }`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center ${notification.color}`}>
                    <notification.icon className="h-5 w-5" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <h3 className={`font-semibold ${!notification.isRead ? 'text-primary' : ''}`}>
                          {notification.title}
                        </h3>
                        <Badge 
                          variant="secondary" 
                          className={`text-xs text-white ${getTypeBadgeColor(notification.type)}`}
                        >
                          {getTypeLabel(notification.type)}
                        </Badge>
                        {!notification.isRead && (
                          <div className="w-2 h-2 bg-primary rounded-full animate-glow" />
                        )}
                      </div>
                      
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => removeNotification(notification.id)}
                        className="hover:text-red-500"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <p className="text-muted-foreground mb-3 leading-relaxed">
                      {notification.message}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {notification.time}
                      </div>
                      
                      {!notification.isRead && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => markAsRead(notification.id)}
                        >
                          <CheckCircle2 className="h-3 w-3 ml-1" />
                          وضع علامة مقروء
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {notifications.length === 0 && (
            <Card className="p-12 text-center">
              <Bell className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">لا توجد إشعارات</h3>
              <p className="text-muted-foreground">
                ستظهر هنا جميع تذكيراتك وإنجازاتك القرآنية
              </p>
            </Card>
          )}

          {/* Quick Actions */}
          <Card className="p-6 mt-8 bg-gradient-card">
            <h3 className="font-semibold mb-4">إجراءات سريعة</h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Button variant="outline" className="h-auto p-4 flex-col gap-2">
                <BookOpen className="h-5 w-5" />
                <span className="text-sm">تذكير الورد</span>
              </Button>
              <Button variant="outline" className="h-auto p-4 flex-col gap-2">
                <Brain className="h-5 w-5" />
                <span className="text-sm">جلسة حفظ</span>
              </Button>
              <Button variant="outline" className="h-auto p-4 flex-col gap-2">
                <Heart className="h-5 w-5" />
                <span className="text-sm">تدبر آية</span>
              </Button>
              <Button variant="outline" className="h-auto p-4 flex-col gap-2">
                <Volume2 className="h-5 w-5" />
                <span className="text-sm">استماع</span>
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default NotificationCenter;