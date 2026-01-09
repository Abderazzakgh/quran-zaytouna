import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Repeat,
  Repeat1,
  ListMusic,
  User,
  Clock,
  Gauge,
  Loader2,
  Download,
  CheckCircle,
  Trash2,
  HardDrive,
  Wifi,
  WifiOff,
  Search,
  DownloadCloud,
  XCircle
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState, useRef, useEffect, useCallback } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useOfflineAudio } from "@/hooks/useOfflineAudio";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

import { useQuran, Reciter, Surah } from "@/contexts/QuranContext";

import { surahs } from "@/lib/quran-data";

const AdvancedAudioPlayer = () => {
  const {
    currentSurah: selectedSurah,
    setCurrentSurah: setSelectedSurah,
    selectedReciter,
    setSelectedReciter,
    isPlaying,
    setIsPlaying,
    audioElement // Changed from audioRef
  } = useQuran();

  const [reciterList, setReciterList] = useState<Reciter[]>([]);
  // Remove local audio state/ref usage

  // ... (keep other state like progress, duration, etc.)

  // Sync Logic with Shared Audio
  useEffect(() => {
    if (audioElement) {
      // Update local progress state based on shared audio events
      const updateProgress = () => setCurrentTime(audioElement.currentTime || 0);
      const updateDuration = () => setDuration(audioElement.duration || 0);

      audioElement.addEventListener('timeupdate', updateProgress);
      audioElement.addEventListener('loadedmetadata', updateDuration);

      return () => {
        audioElement.removeEventListener('timeupdate', updateProgress);
        audioElement.removeEventListener('loadedmetadata', updateDuration);
      }
    }
  }, [audioElement]);

  // Handle Play/Pause
  const togglePlay = () => {
    if (audioElement) {
      if (isPlaying) audioElement.pause();
      else audioElement.play();
    }
  };
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(80);
  const [isMuted, setIsMuted] = useState(false);
  const [repeatMode, setRepeatMode] = useState<"none" | "one" | "all">("none");
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [showDownloads, setShowDownloads] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredSurahs = surahs.filter(surah =>
    surah.name.includes(searchQuery) ||
    String(surah.id).includes(searchQuery)
  );

  // Duplicate audioRef removed

  const {
    downloadRecitation,
    getAudioUrl,
    getOfflineAudioUrl,
    isDownloaded,
    deleteRecitation,
    getDownloadedList,
    getTotalStorageSize,
    formatFileSize,
    isDownloading,
    downloadProgress,
    bulkDownloadSurahs,
    bulkDownloadState,
    cancelBulkDownload,
    getDownloadedCountForReciter
  } = useOfflineAudio();

  useEffect(() => {
    const fetchReciters = async () => {
      type ReciterRow = {
        id: string;
        name: string;
        narrative: string | null;
      };
      const { data, error } = await supabase
        .from<ReciterRow>("reciters")
        .select("id, name, narrative")
        .order("name");

      if (error) {
        console.error("Error fetching reciters:", error);
        return;
      }

      if (data && data.length > 0) {
        const formattedReciters = data.map((r) => ({
          id: r.id,
          name: r.name,
          style: r.narrative || "قالون"
        }));
        setReciterList(formattedReciters);
        // Only set default if none selected (using functional update to ensure fresh state)
        setSelectedReciter((prev: Reciter | null) => prev || formattedReciters[0]);
      }
    };

    fetchReciters();
  }, [setSelectedReciter]);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);


  useEffect(() => {
    if (audioElement) {
      audioElement.volume = isMuted ? 0 : volume / 100;
    }
  }, [volume, isMuted, audioElement]);

  useEffect(() => {
    if (audioElement) {
      audioElement.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed, audioElement]);

  useEffect(() => {
    if (audioElement && selectedReciter) {
      const wasPlaying = isPlaying;

      // Check for offline audio first
      const offlineUrl = getOfflineAudioUrl(selectedReciter.id, selectedSurah.id);
      if (offlineUrl) {
        audioElement.src = offlineUrl;
      } else {
        audioElement.src = getAudioUrl(selectedReciter.id, selectedSurah.id);
      }

      setIsLoading(true);
      setCurrentTime(0);
      if (wasPlaying) {
        audioElement.play().catch(console.error);
      }
    }
  }, [selectedReciter, selectedSurah, getAudioUrl, getOfflineAudioUrl, audioElement, isPlaying]);

  const handleDownload = async () => {
    if (!selectedReciter) return;
    const audioUrl = getAudioUrl(selectedReciter.id, selectedSurah.id);
    const success = await downloadRecitation(
      selectedReciter.id,
      selectedReciter.name,
      selectedSurah.id,
      selectedSurah.name,
      audioUrl
    );

    if (success) {
      toast.success(`تم تحميل سورة ${selectedSurah.name} بنجاح`);
    } else {
      toast.error('فشل التحميل، حاول مرة أخرى');
    }
  };

  const handleDeleteDownload = async (reciterId: string, surahId: number, surahName: string) => {
    const success = await deleteRecitation(reciterId, surahId);
    if (success) {
      toast.success(`تم حذف سورة ${surahName}`);
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handlePlayPause = () => {
    if (!audioElement) return;
    if (isPlaying) {
      audioElement.pause();
    } else {
      audioElement.play().catch(console.error);
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (value: number[]) => {
    if (audioElement) {
      audioElement.currentTime = value[0];
      setCurrentTime(value[0]);
    }
  };

  const handlePrevious = () => {
    const currentIndex = surahs.findIndex(s => s.id === selectedSurah.id);
    if (currentIndex > 0) {
      setSelectedSurah(surahs[currentIndex - 1]);
    }
  };

  const handleNext = () => {
    const currentIndex = surahs.findIndex(s => s.id === selectedSurah.id);
    if (currentIndex < surahs.length - 1) {
      setSelectedSurah(surahs[currentIndex + 1]);
    }
  };

  const toggleRepeat = () => {
    if (repeatMode === "none") setRepeatMode("one");
    else if (repeatMode === "one") setRepeatMode("all");
    else setRepeatMode("none");
  };

  const handleAudioEnded = () => {
    if (repeatMode === "one") {
      audioElement?.play();
    } else if (repeatMode === "all") {
      handleNext();
      setTimeout(() => audioElement?.play(), 100);
    } else {
      setIsPlaying(false);
    }
  };

  return (
    <section id="advanced-player" className="py-12 elegant-gradient">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 p-2 rounded-full bg-primary/10 mb-4">
              <ListMusic className="h-5 w-5 text-primary" />
              <Badge variant="secondary">مشغل التلاوات</Badge>
            </div>
            <h2 className="text-3xl font-bold mb-3">تلاوات برواية قالون</h2>
            <p className="text-muted-foreground">استمع لأجمل التلاوات من قراء تونس برواية قالون عن نافع</p>
          </div>

          {/* Audio Element is now global provided by QuranContext */}

          <Card className="p-6 bg-gradient-card shadow-xl border-primary/10 elegant-card">
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <User className="h-4 w-4 text-primary" />
                  اختر القارئ
                </label>
                <Select
                  value={selectedReciter?.id || ""}
                  onValueChange={(value) => {
                    const reciter = reciterList.find(r => r.id === value);
                    if (reciter) setSelectedReciter(reciter);
                  }}
                  disabled={reciterList.length === 0}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={reciterList.length > 0 ? "اختر القارئ" : "جاري تحميل القراء..."} />
                  </SelectTrigger>
                  <SelectContent>
                    {reciterList.map((reciter) => (
                      <SelectItem key={reciter.id} value={reciter.id}>
                        <div className="flex items-center gap-2">
                          <span>{reciter.name}</span>
                          <Badge variant="outline" className="text-xs">{reciter.style}</Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <ListMusic className="h-4 w-4 text-primary" />
                  اختر السورة
                </label>
                <Select
                  value={String(selectedSurah.id)}
                  onValueChange={(value) => {
                    const surah = surahs.find(s => s.id === Number(value));
                    if (surah) setSelectedSurah(surah);
                  }}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <div className="p-2 sticky top-0 bg-background border-b">
                      <div className="relative">
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="ابحث بالاسم أو الرقم..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pr-9 text-right"
                        />
                      </div>
                    </div>
                    <div className="max-h-[300px] overflow-y-auto">
                      {filteredSurahs.length > 0 ? (
                        filteredSurahs.map((surah) => (
                          <SelectItem key={surah.id} value={String(surah.id)}>
                            {surah.id}. {surah.name} ({surah.ayahCount} آية)
                          </SelectItem>
                        ))
                      ) : (
                        <p className="p-3 text-center text-muted-foreground text-sm">
                          لا توجد نتائج
                        </p>
                      )}
                    </div>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="text-center py-6 bg-muted/30 rounded-xl mb-6 relative">
              <div className="absolute top-3 left-3 flex items-center gap-2">
                {selectedReciter && isDownloaded(selectedReciter.id, selectedSurah.id) ? (
                  <Badge variant="secondary" className="gap-1">
                    <CheckCircle className="h-3 w-3" />
                    محفوظ
                  </Badge>
                ) : null}
                <Badge variant={isOnline ? "outline" : "destructive"} className="gap-1">
                  {isOnline ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
                  {isOnline ? "متصل" : "غير متصل"}
                </Badge>
              </div>

              <h3 className="text-2xl font-bold mb-1">سورة {selectedSurah.name}</h3>
              <p className="text-muted-foreground">{selectedReciter?.name || "اختر قارئاً"}</p>

              {selectedReciter && isDownloading === `${selectedReciter.id}_${selectedSurah.id}` && (
                <div className="mt-3 px-8">
                  <Progress value={downloadProgress} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-1">جاري التحميل... {downloadProgress}%</p>
                </div>
              )}

              {isLoading && !isDownloading && (
                <p className="text-sm text-primary mt-2 animate-pulse flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  جاري التحميل...
                </p>
              )}
            </div>

            <div className="space-y-2 mb-6">
              <Slider value={[currentTime]} max={duration || 100} step={1} onValueChange={handleSeek} />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-4 mb-6">
              <Button variant="ghost" size="icon" onClick={toggleRepeat} className={repeatMode !== "none" ? "text-primary" : ""}>
                {repeatMode === "one" ? <Repeat1 className="h-5 w-5" /> : <Repeat className="h-5 w-5" />}
              </Button>
              <Button variant="ghost" size="icon" onClick={handlePrevious} disabled={surahs.findIndex(s => s.id === selectedSurah.id) === 0}>
                <SkipBack className="h-5 w-5" />
              </Button>
              <Button size="lg" className="rounded-full w-16 h-16 shadow-lg" onClick={handlePlayPause} disabled={isLoading}>
                {isPlaying ? <Pause className="h-8 w-8" /> : <Play className="h-8 w-8 ml-1" />}
              </Button>
              <Button variant="ghost" size="icon" onClick={handleNext} disabled={surahs.findIndex(s => s.id === selectedSurah.id) === surahs.length - 1}>
                <SkipForward className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => setIsMuted(!isMuted)}>
                {isMuted || volume === 0 ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
              </Button>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4">
              <div className="flex items-center gap-2 min-w-[150px]">
                <Volume2 className="h-4 w-4 text-muted-foreground" />
                <Slider value={[volume]} max={100} step={1} onValueChange={(v) => setVolume(v[0])} className="w-24" />
                <span className="text-sm text-muted-foreground w-8">{volume}%</span>
              </div>

              <div className="flex items-center gap-2">
                <Gauge className="h-4 w-4 text-muted-foreground" />
                <Select value={String(playbackSpeed)} onValueChange={(v) => setPlaybackSpeed(Number(v))}>
                  <SelectTrigger className="w-20"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {[0.5, 0.75, 1, 1.25, 1.5].map(speed => (
                      <SelectItem key={speed} value={String(speed)}>{speed}x</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Badge variant={repeatMode !== "none" ? "default" : "outline"}>
                {repeatMode === "none" ? "بدون تكرار" : repeatMode === "one" ? "تكرار السورة" : "تكرار الكل"}
              </Badge>

              {selectedReciter && isDownloaded(selectedReciter.id, selectedSurah.id) ? (
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 border-red-200 hover:bg-red-50 hover:text-red-600 dark:border-red-900/30 dark:hover:bg-red-900/20"
                  onClick={() => handleDeleteDownload(selectedReciter.id, selectedSurah.id, selectedSurah.name)}
                >
                  <Trash2 className="h-4 w-4" />
                  حذف التحميل
                </Button>
              ) : (
                <Button
                  variant="secondary"
                  size="sm"
                  className="gap-2"
                  onClick={handleDownload}
                  disabled={!!isDownloading || !isOnline || !selectedReciter}
                >
                  {isDownloading === `${selectedReciter?.id}_${selectedSurah.id}` ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {downloadProgress}%
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4" />
                      {!isOnline ? "لا يوجد اتصال" : "تحميل"}
                    </>
                  )}
                </Button>
              )}
            </div>

            {/* Downloaded files section */}
            <div className="mt-6 pt-4 border-t">
              <Button
                variant="ghost"
                className="w-full justify-between"
                onClick={() => setShowDownloads(!showDownloads)}
              >
                <span className="flex items-center gap-2">
                  <HardDrive className="h-4 w-4" />
                  التلاوات المحفوظة ({getDownloadedList().length})
                </span>
                <span className="text-muted-foreground text-sm">
                  {formatFileSize(getTotalStorageSize())}
                </span>
              </Button>

              {showDownloads && (
                <div className="mt-3 space-y-2 max-h-48 overflow-y-auto">
                  {getDownloadedList().length === 0 ? (
                    <p className="text-center text-muted-foreground py-4">
                      لا توجد تلاوات محفوظة
                    </p>
                  ) : (
                    getDownloadedList().map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                      >
                        <div className="flex-1">
                          <p className="font-medium text-sm">{item.surahName}</p>
                          <p className="text-xs text-muted-foreground">{item.reciterName}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {formatFileSize(item.audioBlob.size)}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => handleDeleteDownload(item.reciterId, item.surahId, item.surahName)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </Card>

          {/* Bulk Download Progress */}
          {bulkDownloadState.isActive && (
            <Card className="mt-6 p-4 bg-primary/5 border-primary/20">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <DownloadCloud className="h-5 w-5 text-primary animate-pulse" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">جاري تحميل جميع السور</p>
                    <p className="text-xs text-muted-foreground">
                      {reciterList.find(r => r.id === bulkDownloadState.reciterId)?.name}
                    </p>
                  </div>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={cancelBulkDownload}
                  className="gap-2"
                >
                  <XCircle className="h-4 w-4" />
                  إلغاء
                </Button>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>السورة الحالية: {bulkDownloadState.currentSurah}</span>
                  <span>{bulkDownloadState.completedSurahs} / {bulkDownloadState.totalSurahs}</span>
                </div>
                <Progress
                  value={(bulkDownloadState.completedSurahs / bulkDownloadState.totalSurahs) * 100}
                  className="h-2"
                />
              </div>
            </Card>
          )}

        </div>
      </div>
    </section>
  );
};

export default AdvancedAudioPlayer;
