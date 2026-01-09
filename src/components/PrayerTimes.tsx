import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Moon,
  Sunrise,
  Sun,
  Sunset,
  Clock,
  MapPin,
  Bell,
  BellOff,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
import { Coordinates, CalculationMethod, PrayerTimes as AdhanPrayerTimes, Madhab } from "adhan";
import { toast } from "sonner";

const ADHAN_AUDIO_URL = "/907KaYCcppc.mp3"; // Local Tunisian Adhan or user selected audio

const PrayerTimes = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [coords, setCoords] = useState<Coordinates | null>(null);
  const [prayerTimes, setPrayerTimes] = useState<AdhanPrayerTimes | null>(null);
  const [isAdhanEnabled, setIsAdhanEnabled] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [nextPrayerName, setNextPrayerName] = useState("");
  const [nextPrayerTime, setNextPrayerTime] = useState<Date | null>(null);
  const [lastPlayedPrayer, setLastPlayedPrayer] = useState<string | null>(null);

  // Get User Location
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCoords(new Coordinates(position.coords.latitude, position.coords.longitude));
        },
        () => {
          // Default to Tunis coordinates if geolocation fails
          setCoords(new Coordinates(36.8065, 10.1815));
        }
      );
    } else {
      setCoords(new Coordinates(36.8065, 10.1815));
    }
  }, []);

  // Calculate Prayer Times
  const [currentMinute, setCurrentMinute] = useState<number>(new Date().getMinutes());

  useEffect(() => {
    if (coords) {
      const now = new Date();
      const params = CalculationMethod.MoonsightingCommittee();
      params.madhab = Madhab.Shafi;

      const today = new AdhanPrayerTimes(coords, now, params);
      setPrayerTimes(today);

      const next = today.nextPrayer();
      let nextTime = today.timeForPrayer(next);
      let name = getArName(next);

      if (next === "none") {
        const tomorrow = new Date(now);
        tomorrow.setDate(now.getDate() + 1);
        const tomorrowTimes = new AdhanPrayerTimes(coords, tomorrow, params);
        nextTime = tomorrowTimes.fajr;
        name = getArName("fajr");
      }

      setNextPrayerName(name);
      setNextPrayerTime(nextTime);
    }
  }, [coords, currentMinute]);

  // Timer for current time
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);
      setCurrentMinute(now.getMinutes());

      // Check for Adhan time
      if (prayerTimes && isAdhanEnabled && !isMuted) {
        const currentPrayer = prayerTimes.currentPrayer();

        // Only play for actual prayers (exclude none and sunrise)
        if (currentPrayer !== "none" && currentPrayer !== "sunrise") {
          const prayerTime = prayerTimes.timeForPrayer(currentPrayer);

          if (prayerTime && lastPlayedPrayer !== currentPrayer) {
            const diff = Math.abs(now.getTime() - prayerTime.getTime());

            // If we are within 1 minute of the prayer time, play it
            // We use lastPlayedPrayer to ensure it only plays once
            if (diff < 60000) {
              playAdhan(getArName(currentPrayer));
              setLastPlayedPrayer(currentPrayer);
            }
          }
        }
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [prayerTimes, isAdhanEnabled, isMuted, lastPlayedPrayer]);

  const playAdhan = (prayerName: string) => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(e => {
        console.error("Adhan play failed:", e);
        toast.error("فشل تشغيل صوت الأذان. قد يحتاج المتصفح إلى تفاعل منك أولاً.");
      });

      toast(`حان الآن موعد أذان ${prayerName}`, {
        icon: <Bell className="h-4 w-4 text-primary animate-ring" />,
        duration: 300000, // 5 minutes (approx adhan length)
        action: {
          label: "إيقاف",
          onClick: () => {
            if (audioRef.current) {
              audioRef.current.pause();
              audioRef.current.currentTime = 0;
            }
          }
        }
      });
    }
  };

  const testAdhan = () => {
    playAdhan("تجريبي");
  };

  const getArName = (prayer: string): string => {
    const names: Record<string, string> = {
      fajr: "الفجر",
      sunrise: "الشروق",
      dhuhr: "الظهر",
      asr: "العصر",
      maghrib: "المغرب",
      isha: "العشاء",
      none: "لا يوجد"
    };
    return names[prayer] || prayer;
  };

  const getTimeRemaining = () => {
    if (!nextPrayerTime) return "00:00:00";

    const diff = nextPrayerTime.getTime() - currentTime.getTime();
    if (diff < 0) return "00:00:00";

    const h = Math.floor(diff / (1000 * 60 * 60));
    const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((diff % (1000 * 60)) / 1000);

    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const formatTime = (date: Date | undefined) => {
    if (!date) return "--:--";
    return date.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
  };

  const prayers = prayerTimes ? [
    { id: 'fajr', name: "الفجر", time: formatTime(prayerTimes.fajr), icon: Moon, passed: currentTime > prayerTimes.fajr },
    { id: 'sunrise', name: "الشروق", time: formatTime(prayerTimes.sunrise), icon: Sunrise, passed: currentTime > prayerTimes.sunrise },
    { id: 'dhuhr', name: "الظهر", time: formatTime(prayerTimes.dhuhr), icon: Sun, passed: currentTime > prayerTimes.dhuhr },
    { id: 'asr', name: "العصر", time: formatTime(prayerTimes.asr), icon: Sun, passed: currentTime > prayerTimes.asr },
    { id: 'maghrib', name: "المغرب", time: formatTime(prayerTimes.maghrib), icon: Sunset, passed: currentTime > prayerTimes.maghrib },
    { id: 'isha', name: "العشاء", time: formatTime(prayerTimes.isha), icon: Moon, passed: currentTime > prayerTimes.isha },
  ] : [];

  return (
    <section className="py-20 bg-background relative overflow-hidden">
      <audio ref={audioRef} src={ADHAN_AUDIO_URL} />
      <div className="absolute inset-0 bg-grid-islamic opacity-10" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-6xl mx-auto animate-fade-up">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6 group cursor-default">
              <Clock className="h-5 w-5 text-primary group-hover:rotate-12 transition-transform" />
              <span className="text-sm font-bold text-primary tracking-widest uppercase">مواقيت الصلاة</span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold mb-4 tracking-tight">توقيت الصلوات حسب موقعك</h2>

            <div className="flex flex-col items-center gap-4 mb-8">
              <div className="bg-primary/5 backdrop-blur-sm border border-primary/10 px-8 py-4 rounded-3xl shadow-inner group">
                <p className="text-xs text-primary/60 font-medium mb-1 uppercase tracking-widest">الوقت الحالي الآن</p>
                <div className="text-4xl font-mono font-black text-primary tracking-tighter">
                  {currentTime.toLocaleTimeString('ar-TN', { hour12: false })}
                </div>
              </div>

              <div className="flex items-center justify-center gap-3 text-muted-foreground">
                <div className="bg-muted p-1.5 rounded-lg">
                  <MapPin className="h-4 w-4 text-primary" />
                </div>
                <span className="font-medium">
                  {coords?.latitude ? `موقعك: ${coords.latitude.toFixed(2)}, ${coords.longitude.toFixed(2)}` : "جاري تحديد الموقع..."}
                </span>
              </div>
            </div>
          </div>

          {/* Next Prayer Card */}
          <Card className="premium-card p-10 mb-12 bg-gradient-islamic text-primary-foreground border-0 shadow-2xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-islamic-pattern opacity-10" />
            <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-10">
              <div className="text-center lg:text-right flex items-center gap-6">
                <div className="w-20 h-20 rounded-3xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-lg border border-white/20">
                  <Bell className={`h-10 w-10 text-white ${isAdhanEnabled ? 'animate-bounce' : ''}`} />
                </div>
                <div>
                  <p className="text-white/80 text-lg mb-1 font-light">الصلاة القادمة</p>
                  <h3 className="text-5xl font-extrabold tracking-tighter shadow-sm">{nextPrayerName}</h3>
                </div>
              </div>

              <div className="text-center bg-white/10 backdrop-blur-md px-12 py-6 rounded-3xl border border-white/20 shadow-inner">
                <p className="text-white/80 text-sm mb-2 font-medium uppercase tracking-[0.2em]">الوقت المتبقي</p>
                <div className="text-5xl lg:text-6xl font-black font-mono tracking-widest drop-shadow-lg">
                  {getTimeRemaining()}
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <Button
                  variant="outline"
                  className={`gap-4 bg-white/20 px-6 py-6 rounded-2xl border border-white/30 hover:bg-white/30 transition-colors text-white ${isAdhanEnabled ? 'border-emerald-400 border-2' : ''}`}
                  onClick={() => {
                    setIsAdhanEnabled(!isAdhanEnabled);
                    if (!isAdhanEnabled) {
                      audioRef.current?.load();
                      toast.success("تم تفعيل تنبيهات الأذان. يرجى التأكد من عدم كتم الصوت.");
                    }
                  }}
                >
                  {isAdhanEnabled ? <Bell className="h-5 w-5" /> : <BellOff className="h-5 w-5" />}
                  <span className="text-sm font-bold tracking-wide">
                    {isAdhanEnabled ? "تنبيهات الأذان مفعلة" : "تنبيهات الأذان معطلة"}
                  </span>
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white/70 hover:text-white"
                  onClick={testAdhan}
                >
                  <Volume2 className="h-4 w-4 ml-2" />
                  تجربة الصوت
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white/70 hover:text-white"
                  onClick={() => setIsMuted(!isMuted)}
                >
                  {isMuted ? <VolumeX className="h-4 w-4 ml-2" /> : <Volume2 className="h-4 w-4 ml-2" />}
                  {isMuted ? "صامت" : "صوت"}
                </Button>
              </div>
            </div>
          </Card>

          {/* Prayer Times Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {prayers.map((prayer, index) => {
              const isNext = prayerTimes?.nextPrayer() === prayer.id;
              return (
                <Card
                  key={index}
                  className={`p-8 text-center transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 group relative overflow-hidden ${isNext
                    ? 'ring-2 ring-primary/40 bg-primary/5 scale-105 shadow-xl'
                    : prayer.passed
                      ? 'opacity-40 grayscale-[0.5] hover:opacity-80'
                      : 'glass-card border-border/40'
                    }`}
                >
                  {isNext && (
                    <div className="absolute top-0 right-0 p-2">
                      <div className="w-2 h-2 rounded-full bg-primary animate-ping" />
                    </div>
                  )}
                  <div className={`w-14 h-14 mx-auto mb-5 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:rotate-12 ${isNext
                    ? 'bg-gradient-islamic text-white shadow-lg'
                    : 'bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary'
                    }`}>
                    <prayer.icon className="h-7 w-7" />
                  </div>
                  <h4 className="font-bold text-xl mb-2 tracking-tight group-hover:text-primary transition-colors">{prayer.name}</h4>
                  <p className={`text-2xl font-black font-mono tracking-tighter ${isNext ? 'text-primary' : 'text-muted-foreground/80'}`}>
                    {prayer.time}
                  </p>
                  {isNext && (
                    <Badge className="mt-4 bg-primary/10 text-primary border-primary/20 px-4 py-1" variant="outline">
                      القادم
                    </Badge>
                  )}
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default PrayerTimes;
