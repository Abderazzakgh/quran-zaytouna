import { useQuran } from "@/contexts/QuranContext";
import { surahs } from "@/lib/quran-data";
import { Progress } from "@/components/ui/progress";
import { Trophy, Calendar, CheckCircle2 } from "lucide-react";

export const KhatmaTracker = () => {
    const { currentSurah, currentAyah, completedSurahs } = useQuran();

    // Calculate total ayahs in Quran
    const totalAyahs = surahs.reduce((acc, surah) => acc + surah.ayahCount, 0);

    // Calculate read ayahs based on MARKED completed surahs + current progress
    const completedAyahsCount = surahs
        .filter(s => completedSurahs.includes(s.id))
        .reduce((acc, s) => acc + s.ayahCount, 0);

    // Add current ayah only if current surah is NOT marked as completed
    const currentContribution = completedSurahs.includes(currentSurah.id) ? 0 : currentAyah;

    const totalRead = Math.min(totalAyahs, completedAyahsCount + currentContribution);

    const percentage = Math.min(100, Math.round((totalRead / totalAyahs) * 100));

    return (
        <div className="p-4 rounded-xl bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20">
            <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                    <Trophy className="h-5 w-5" />
                </div>
                <div>
                    <h4 className="font-semibold text-sm">مسار الختمة</h4>
                    <p className="text-xs text-muted-foreground">واصل تقدمك...</p>
                </div>
                <div className="mr-auto font-bold text-lg text-primary">{percentage}%</div>
            </div>

            <Progress value={percentage} className="h-2 mb-2 bg-primary/20" />

            <div className="flex justify-between items-center text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    {totalRead} آية
                </span>
                <span className="flex items-center gap-1">
                    {totalAyahs - totalRead} متبقية
                </span>
            </div>
        </div>
    );
};
