import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
    Music,
    Play,
    Loader2,
    CheckCircle2,
    Search,
    User,
    Mic2,
    Globe,
    Star,
    Download
} from "lucide-react";
import { QuranAudioService } from "@/lib/quran-audio";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

import { useQuran } from "@/contexts/QuranContext";

interface Reciter {
    id: string;
    name: string;
    image_url: string | null;
    bio: string | null;
}

const ReciterList = () => {
    const { setSelectedReciter } = useQuran();
    const [reciters, setReciters] = useState<Reciter[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState<string | null>(null);

    useEffect(() => {
        fetchReciters();
    }, []);

    const fetchReciters = async () => {
        try {
            type ReciterRow = {
                id: string;
                name: string;
                image_url: string | null;
                bio: string | null;
                created_at?: string;
            };
            const { data, error } = await supabase
                .from<ReciterRow>("reciters")
                .select("*")
                .order('name', { ascending: true });

            if (error) throw error;
            setReciters(data || []);
        } catch (error) {
            console.error("Error fetching reciters:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSyncAudio = async (reciterId: string) => {
        setSyncing(reciterId);
        try {
            const count = await QuranAudioService.syncReciterAudio(reciterId);
            toast({
                title: "تمت المزامنة بنجاح",
                description: `تم ربط ${count} سورة بالملفات الصوتية المتوقعة في Storage`,
            });
        } catch (error) {
            toast({
                title: "خطأ في المزامنة",
                description: "تأكد من وجود الجداول المطلوبة في قاعدة البيانات",
                variant: "destructive"
            });
        } finally {
            setSyncing(null);
        }
    };

    const filteredReciters = reciters.filter(r =>
        r.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex flex-col justify-center items-center p-20 space-y-4">
                <div className="relative">
                    <Loader2 className="h-12 w-12 animate-spin text-primary opacity-20" />
                    <Mic2 className="h-6 w-6 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                </div>
                <p className="text-muted-foreground animate-pulse font-medium">جاري جلب قائمة القراء...</p>
            </div>
        );
    }

    return (
        <div className="space-y-10">
            {/* Search Header */}
            <div className="max-w-md mx-auto relative group">
                <div className="absolute inset-0 bg-primary/5 blur-2xl group-hover:bg-primary/10 transition-colors rounded-full" />
                <div className="relative flex items-center">
                    <Search className="absolute right-4 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input
                        placeholder="ابحث عن قارئ..."
                        className="pr-12 py-6 bg-white/50 dark:bg-black/20 backdrop-blur-xl border-primary/10 focus:border-primary/30 rounded-2xl shadow-premium"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* Reciters Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredReciters.map((reciter) => (
                    <Card key={reciter.id} className="group relative overflow-hidden border-none bg-transparent">
                        {/* Animated Background Decor */}
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl" />

                        <div className="relative p-1">
                            <div className="bg-white/80 dark:bg-black/40 backdrop-blur-md rounded-[2rem] p-6 shadow-premium border border-white/20 dark:border-white/5 transition-all duration-500 group-hover:shadow-glow group-hover:-translate-y-2">

                                {/* Image & Header */}
                                <div className="flex items-start justify-between mb-6">
                                    <div className="relative">
                                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 p-0.5 shadow-lg group-hover:rotate-6 transition-transform duration-500">
                                            <div className="w-full h-full rounded-[0.9rem] bg-background flex items-center justify-center overflow-hidden">
                                                {reciter.image_url ? (
                                                    <img src={reciter.image_url} alt={reciter.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <User className="h-10 w-10 text-primary/40" />
                                                )}
                                            </div>
                                        </div>
                                        <div className="absolute -bottom-2 -right-2 bg-background dark:bg-zinc-900 rounded-lg p-1.5 shadow-md border border-white/10">
                                            <Mic2 className="h-4 w-4 text-primary" />
                                        </div>
                                    </div>

                                    <div className="text-left">
                                        <Badge variant="outline" className="text-[10px] uppercase tracking-widest bg-emerald-500/5 text-emerald-600 border-emerald-500/20 px-2 py-0.5">
                                            Tunisian Qalun
                                        </Badge>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="space-y-3">
                                    <h3 className="font-bold text-xl group-hover:text-primary transition-colors flex items-center gap-2">
                                        {reciter.name}
                                        <CheckCircle2 className="h-4 w-4 text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </h3>

                                    <div className="flex items-center gap-4 text-[10px] text-muted-foreground">
                                        <span className="flex items-center gap-1">
                                            <Globe className="h-3 w-3" />
                                            تونس
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                                            رواية قالون
                                        </span>
                                    </div>

                                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 h-10 group-hover:text-foreground transition-colors">
                                        {reciter.bio || "من أعلام المدرسة التونسية في القراءات، متميز بجمال الأداء وإتقان رواية قالون عن نافع المدني."}
                                    </p>
                                </div>

                                {/* Actions */}
                                <div className="mt-8 flex items-center gap-3">
                                    <Button
                                        className="flex-1 rounded-xl h-12 bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 group/btn transition-all active:scale-95"
                                        onClick={() => {
                                            setSelectedReciter({
                                                id: reciter.id,
                                                name: reciter.name,
                                                style: "قالون"
                                            });
                                            const player = document.getElementById('advanced-player');
                                            player?.scrollIntoView({ behavior: 'smooth' });
                                        }}
                                    >
                                        <Play className="h-4 w-4 ml-2 fill-white group-hover/btn:scale-110 transition-transform" />
                                        استماع الآن
                                    </Button>

                                    <Button
                                        variant="outline"
                                        className="w-12 h-12 rounded-xl border-dashed border-primary/20 hover:bg-primary/5 hover:border-primary/40 relative overflow-hidden"
                                        onClick={() => handleSyncAudio(reciter.id)}
                                        disabled={syncing === reciter.id}
                                    >
                                        {syncing === reciter.id ? (
                                            <Loader2 className="h-5 w-5 animate-spin text-primary" />
                                        ) : (
                                            <Download className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </Card>
                ))}

                {filteredReciters.length === 0 && (
                    <div className="col-span-full py-24 text-center">
                        <div className="w-24 h-24 bg-muted/30 rounded-full flex items-center justify-center mx-auto mb-6 border border-dashed border-border">
                            <Search className="h-10 w-10 text-muted-foreground opacity-30" />
                        </div>
                        <h3 className="text-2xl font-bold mb-2">لا توجد نتائج</h3>
                        <p className="text-muted-foreground">لم نجد أي قارئ يطابق بحثك حالياً.</p>
                        <Button
                            variant="link"
                            className="mt-4 text-primary"
                            onClick={() => setSearchQuery("")}
                        >
                            إلغاء البحث
                        </Button>
                    </div>
                )}
            </div>

            {/* Institutional Note */}
            <div className="p-8 rounded-[2.5rem] bg-gradient-to-r from-emerald-600/10 to-teal-600/10 border border-emerald-500/20 mt-12 flex flex-col md:flex-row items-center gap-6">
                <div className="w-16 h-16 rounded-2xl bg-white dark:bg-zinc-900 shadow-xl flex items-center justify-center flex-shrink-0">
                    <Star className="h-8 w-8 text-amber-500 fill-amber-500" />
                </div>
                <div>
                    <h4 className="font-bold text-lg mb-1">المدرسة التونسية في القراءات</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        تتميز المدرسة التونسية بخصوصية أدائية فريدة في رواية قالون عن نافع المدني، حيث تجمع بين الرصانة العلمية والجمالية الطربية الراقية التي تحافظ على وقار كلام الله تعالى.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ReciterList;
