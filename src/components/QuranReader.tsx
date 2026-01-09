import { Helmet } from "react-helmet-async";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Play,
  Pause,
  Bookmark,
  Heart,
  Settings,
  Loader2,
  ChevronRight,
  ChevronLeft,
  Quote,
  Volume2,
  CheckCircle2,
  Circle
} from "lucide-react";
import { useQuran } from "@/contexts/QuranContext";
import { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import { QuranAudioService } from "@/lib/quran-audio";
import { useOfflineAudio } from "@/hooks/useOfflineAudio";
import { AppearanceSettings } from "./AppearanceSettings";

// Constants for Heuristic Sync
// Average recitation speed adjusted for slower/measured reading (Tartil/Tajweed)
const SECONDS_PER_WORD = 1.8;

interface AyahData {
  number: number;
  arabic: string;
  tafsir: string;
  startTime: number;
  endTime: number;
  duration: number;
}

const QuranReader = () => {
  const {
    currentAyah,
    setCurrentAyah,
    isPlaying,
    setIsPlaying,
    currentSurah,
    selectedReciter,
    audioElement, // Changed from audioRef
    fontSize, // Added
    completedSurahs,
    toggleSurahCompletion
  } = useQuran();

  const [ayahs, setAyahs] = useState<AyahData[]>([]);
  const [loading, setLoading] = useState(true);
  const [direction, setDirection] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string>("");
  // Ref to track if audio seek is initiated by auto-advance to prevent loops
  const isAutoSeeking = useRef(false);

  const { getAudioUrl } = useOfflineAudio();
  // NOTE: audioElement is now global, so we don't initialize it here.

  // Calculate Heuristic Timeline based on Text
  const generateTimeline = (ayahsText: any[]) => {
    let currentTime = 0;
    return ayahsText.map((ayah) => {
      const wordCount = ayah.text.split(" ").length;
      // Heuristic duration calculation
      const duration = Math.max(3, wordCount * SECONDS_PER_WORD);
      const startTime = currentTime;
      currentTime += duration;

      return {
        startTime,
        endTime: currentTime,
        duration
      };
    });
  };

  // Fetch data and build timeline
  useEffect(() => {
    const fetchSurahData = async () => {
      setLoading(true);
      try {
        const response = await fetch(`https://api.alquran.cloud/v1/surah/${currentSurah.id}/editions/quran-uthmani,ar.ibnashur`);
        const data = await response.json();

        if (data.code !== 200) throw new Error("Failed to fetch data");

        const uthmaniData = data.data.find((e: any) => e.edition.identifier === "quran-uthmani")?.ayahs || [];
        const tafsirData = data.data.find((e: any) => e.edition.identifier === "ar.ibnashur")?.ayahs || [];

        if (!uthmaniData.length) throw new Error("Quran text not found");

        const timeline = generateTimeline(uthmaniData);

        const combined = uthmaniData.map((ayah: any, index: number) => ({
          number: ayah.numberInSurah,
          arabic: ayah.text,
          tafsir: tafsirData[index]?.text || "تفسير غير متوفر لهذه الآية حالياً.",
          startTime: timeline[index].startTime,
          endTime: timeline[index].endTime,
          duration: timeline[index].duration
        }));

        setAyahs(combined);

        // Set Audio URL (Full Surah)
        if (selectedReciter?.id) {
          const url = getAudioUrl(selectedReciter.id, currentSurah.id);
          setAudioUrl(url);
        } else {
          // Fallback logic
        }

      } catch (error) {
        console.error("Error fetching surah:", error);
        toast.error("حدث خطأ في تحميل السورة");
      } finally {
        setLoading(false);
      }
    };

    fetchSurahData();
  }, [currentSurah.id, selectedReciter, getAudioUrl]);

  // Audio Playback & Sync Logic (Using GLOBAL audioElement)
  useEffect(() => {
    if (!audioElement || !audioUrl) return;

    // Load source if changed
    if (audioElement.src !== audioUrl) {
      audioElement.src = audioUrl;
      // Start from beginning if new surah
      if (currentAyah === 1) audioElement.currentTime = 0;
      else {
        const ayahTime = ayahs[currentAyah - 1]?.startTime || 0;
        audioElement.currentTime = ayahTime;
      }
    }

    const handleTimeUpdate = () => {
      if (!audioElement || !ayahs.length) return;

      if (isAutoSeeking.current) return;

      const time = audioElement.currentTime;

      // Find which ayah corresponds to this time
      // We check if the time is within the window of any ayah
      const activeAyah = ayahs.find(a => time >= a.startTime && time < a.endTime);

      if (activeAyah && activeAyah.number !== currentAyah) {
        // Only update if different
        setDirection(activeAyah.number > currentAyah ? 1 : -1);
        setCurrentAyah(activeAyah.number);
      }

      // Check if surah ended uses last ayah end time
      if (ayahs.length > 0 && time >= ayahs[ayahs.length - 1].endTime) {
        setIsPlaying(false);
        audioElement.currentTime = 0;
        setCurrentAyah(1);
        toast.success("صدق الله العظيم");
      }
    };

    audioElement.addEventListener('timeupdate', handleTimeUpdate);

    if (isPlaying) {
      if (audioElement.paused) {
        audioElement.play().catch(e => {
          console.error(e);
          setIsPlaying(false);
        });
      }
    } else {
      audioElement.pause();
    }

    return () => {
      audioElement?.removeEventListener('timeupdate', handleTimeUpdate);
    };
  }, [audioUrl, isPlaying, ayahs, currentAyah, setIsPlaying, setCurrentAyah, audioElement]);

  // Seek logic for manual navigation
  useEffect(() => {
    if (!audioElement || !ayahs.length) return;

    const targetAyah = ayahs[currentAyah - 1];
    if (!targetAyah) return;

    const currentTime = audioElement.currentTime;

    // Check if current time is OUTSIDE the target ayah's window.
    // If it is inside, we assume it's normal playback.
    // If it is outside, the user must have changed the ayah manually.
    if (currentTime < targetAyah.startTime || currentTime > targetAyah.endTime) {
      isAutoSeeking.current = true;
      audioElement.currentTime = targetAyah.startTime + 0.1; // +0.1 to be safe inside
      // Allow updates again after a brief moment
      setTimeout(() => {
        isAutoSeeking.current = false;
      }, 500);
    }

  }, [currentAyah, ayahs, audioElement]);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleNextAyah = () => {
    if (currentAyah < ayahs.length) {
      setDirection(1);
      setCurrentAyah(currentAyah + 1);
    }
  };

  const handlePrevAyah = () => {
    if (currentAyah > 1) {
      setDirection(-1);
      setCurrentAyah(currentAyah - 1);
    }
  };

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center animate-fade-in bg-background/50 backdrop-blur-md rounded-[3rem] my-10 border border-primary/10">
        <div className="relative">
          <Loader2 className="h-16 w-16 animate-spin text-primary opacity-20" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 bg-primary/40 rounded-full animate-pulse" />
          </div>
        </div>
        <p className="mt-6 text-primary font-bold tracking-widest animate-pulse">جاري تحميل آيات الذكر الحكيم...</p>
        <p className="text-xs text-muted-foreground mt-2">تفسير ابن عاشور - رواية قالون</p>
      </div>
    );
  }

  const currentAyahData = ayahs[currentAyah - 1] || ayahs[0];

  return (
    <section id="reading" className="py-20 relative overflow-hidden bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')]">
      <Helmet>
        <title>{`سورة ${currentSurah.name} - الآية ${currentAyah} | مصحف الزيتونة`}</title>
        <meta name="description" content={`اقرأ واستمع لسورة ${currentSurah.name} آية ${currentAyah} بصوت القارئ ${selectedReciter?.name || 'الشيخ'} برواية قالون عن نافع.`} />
        <meta property="og:title" content={`سورة ${currentSurah.name} - الآية ${currentAyah} | مصحف الزيتونة`} />
        <meta property="og:description" content={`اقرأ واستمع لسورة ${currentSurah.name} آية ${currentAyah} بصوت القارئ ${selectedReciter?.name || 'الشيخ'} برواية قالون عن نافع.`} />
        <meta property="og:type" content="article" />
        {/* We can add dynamic OG Image generation later */}
      </Helmet>
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-primary/5 pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-5xl mx-auto">

          {/* Header & Breadcrumbs */}
          <div className="text-center mb-12">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-white dark:bg-black/20 shadow-premium border border-primary/10 mb-6"
            >
              <span className="text-primary font-bold">سورة {currentSurah.name}</span>
              <span className="text-muted-foreground/30">•</span>
              <span className="text-sm font-medium">الآية {currentAyah} من {ayahs.length}</span>
              <span className="text-muted-foreground/30">•</span>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">رواية قالون</Badge>
                {selectedReciter && (
                  <Badge variant="outline" className="border-primary/20 text-primary">{selectedReciter.name}</Badge>
                )}
                <span className="text-muted-foreground/30">•</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`h-6 px-2 text-xs rounded-full gap-1 border transition-colors ${completedSurahs.includes(currentSurah.id)
                    ? "bg-green-500/10 text-green-600 border-green-500/20 hover:bg-green-500/20"
                    : "bg-muted/50 text-muted-foreground border-transparent hover:bg-muted"
                    }`}
                  onClick={() => toggleSurahCompletion(currentSurah.id)}
                >
                  {completedSurahs.includes(currentSurah.id) ? (
                    <>
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>مكتملة</span>
                    </>
                  ) : (
                    <>
                      <Circle className="h-3.5 w-3.5" />
                      <span>تعليم كمقروءة</span>
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
            <h2 className="text-5xl font-black mb-4 tracking-tighter bg-gradient-islamic bg-clip-text text-transparent">
              محراب التلاوة
            </h2>
          </div>

          <div className="grid lg:grid-cols-12 gap-8 items-start">

            {/* Sidebar Controls */}
            <div className="lg:col-span-1 flex lg:flex-col gap-4 justify-center">
              <Button
                variant="outline"
                size="icon"
                className="w-14 h-14 rounded-2xl shadow-premium border-primary/20 hover:bg-primary hover:text-white transition-all"
                onClick={handlePrevAyah}
                disabled={currentAyah === 1}
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="w-14 h-14 rounded-2xl shadow-premium border-primary/20 hover:bg-primary hover:text-white transition-all"
                onClick={handleNextAyah}
                disabled={currentAyah === ayahs.length}
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
            </div>

            {/* Main Focus Area */}
            <div className="lg:col-span-10 space-y-8">

              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={`${currentSurah.id}-${currentAyah}`}
                  custom={direction}
                  initial={{ opacity: 0, x: direction * 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -direction * 50 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                >
                  <Card className="p-10 lg:p-16 rounded-[3.5rem] bg-white/80 dark:bg-zinc-900/80 backdrop-blur-2xl border-none shadow-premium relative overflow-hidden min-h-[400px] flex flex-col justify-center">
                    {/* Decorative Background Icon */}
                    <Quote className="absolute top-10 right-10 h-32 w-32 text-primary/5 -rotate-12" />

                    <div className="relative z-10 text-center space-y-12">

                      {/* Ayah Counter Icon */}
                      <div className="mx-auto w-20 h-20 rounded-3xl bg-gradient-islamic p-0.5 shadow-glow rotate-45 group hover:rotate-[135deg] transition-transform duration-700">
                        <div className="w-full h-full bg-background rounded-[1.4rem] flex items-center justify-center -rotate-45 group-hover:rotate-[225deg] transition-transform duration-700">
                          <span className="text-2xl font-black text-primary font-amiri">{currentAyah}</span>
                        </div>
                      </div>

                      {/* The Ayah Text */}
                      <p
                        style={{ fontSize: `${fontSize}px` }}
                        className={`quran-text text-center leading-[2] font-amiri transition-all duration-700 ${isPlaying ? 'text-emerald-600 drop-shadow-[0_0_15px_rgba(5,150,105,0.3)]' : 'text-foreground'
                          }`}
                      >
                        {currentAyahData?.arabic}
                      </p>

                      {/* Interaction Bar */}
                      <div className="flex items-center justify-center gap-6 pt-6">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-12 w-12 rounded-full hover:bg-primary/10 hover:text-primary transition-colors"
                          onClick={togglePlay}
                        >
                          {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 ml-1" />}
                        </Button>
                        <div className="h-8 w-[1px] bg-border" />
                        <Button variant="ghost" size="icon" className="h-12 w-12 rounded-full hover:bg-emerald-500/10 hover:text-emerald-500">
                          <Bookmark className="h-5 w-5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-12 w-12 rounded-full hover:bg-red-500/10 hover:text-red-500">
                          <Heart className="h-5 w-5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-12 w-12 rounded-full hover:bg-blue-500/10 hover:text-blue-500">
                          <Volume2 className="h-5 w-5" />
                        </Button>
                        <AppearanceSettings />
                      </div>
                    </div>
                  </Card>
                </motion.div>
              </AnimatePresence>

              {/* Tafsir Ibn Ashur Section */}
              <motion.div
                key={`tafsir-${currentAyah}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="p-8 lg:p-12 rounded-[2.5rem] bg-emerald-50/50 dark:bg-emerald-900/10 border-2 border-emerald-500/10 shadow-soft">
                  <div className="flex items-center gap-4 mb-6 border-b border-emerald-500/10 pb-4">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-lg">
                      <Settings className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xl text-emerald-900 dark:text-emerald-100">تحرير التحرير والتنوير</h4>
                      <p className="text-xs text-emerald-600/70 font-bold uppercase tracking-widest">للإمام الشيخ الطاهر بن عاشور</p>
                    </div>
                  </div>

                  <div className="relative">
                    <Quote className="absolute -top-4 -right-2 h-10 w-10 text-emerald-500/10" />
                    <p className="text-lg text-muted-foreground leading-loose text-right font-medium italic pr-4">
                      {currentAyahData?.tafsir || "لا يوجد تفسير متوفر لهذه الآية."}
                    </p>
                  </div>

                  <div className="mt-8 flex justify-end">
                    <Badge variant="outline" className="bg-white/50 border-emerald-200 text-emerald-700">دقة زيتونية</Badge>
                  </div>
                </Card>
              </motion.div>
            </div>
          </div>

          {/* Progress Indicator */}
          <div className="mt-12 max-w-2xl mx-auto space-y-4">
            <div className="flex justify-between items-end px-2">
              <span className="text-xs font-bold text-muted-foreground">التقدم في السورة</span>
              <span className="text-2xl font-black text-primary">{Math.round((currentAyah / ayahs.length) * 100)}%</span>
            </div>
            <div className="h-3 w-full bg-muted rounded-full overflow-hidden p-1 shadow-inner border border-primary/5">
              <motion.div
                className="h-full bg-gradient-islamic rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${(currentAyah / ayahs.length) * 100}%` }}
              />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default QuranReader;