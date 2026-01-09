import { supabase } from "@/integrations/supabase/client";

/**
 * خدمة إدارة صوتيات القرآن الكريم
 * مخصصة لرواية قالون عن نافع بأصوات تونسية
 */

interface SurahMetadata {
    number: number;
    name: string;
    englishName: string;
    numberOfAyahs: number;
    revelationType: string;
}

export const QuranAudioService = {
    /**
     * جلب قائمة السور من API خارجي
     */
    async fetchSurahList(): Promise<SurahMetadata[]> {
        try {
            const response = await fetch("https://api.alquran.cloud/v1/surah");
            const data = await response.json();
            return data.data;
        } catch (error) {
            console.error("Error fetching surah list:", error);
            return [];
        }
    },

    /**
     * توليد رابط الصوت من Supabase Storage
     * المسار المتوقع: reciters/{reciter_id}/{surah_number}.mp3
     */
    getAudioUrl(reciterId: string, surahNumber: number): string {
        const { data } = supabase.storage
            .from("quran-audio")
            .getPublicUrl(`reciters/${reciterId}/${surahNumber.toString().padStart(3, "0")}.mp3`);

        return data.publicUrl;
    },

    /**
     * مزامنة البيانات مع قاعدة البيانات لشيخ معين
     */
    async syncReciterAudio(reciterId: string) {
        const surahs = await this.fetchSurahList();

        const audioData = surahs.map((surah) => ({
            reciter_id: reciterId,
            surah_number: surah.number,
            audio_url: this.getAudioUrl(reciterId, surah.number),
        }));

        // تنفيذ عملية الـ upsert (إدخال أو تحديث)
        type SurahAudioRow = {
            reciter_id: string;
            surah_number: number;
            audio_url: string;
            created_at?: string;
        };
        const { error } = await supabase
            .from("surah_audio")
            .upsert(audioData, { onConflict: "reciter_id, surah_number" });

        if (error) {
            console.error("Error syncing audio metadata:", error);
            throw error;
        }

        return audioData.length;
    },

    /**
     * جلب التسجيلات الصوتية لشيخ معين من قاعدة البيانات
     */
    async getReciterSurahs(reciterId: string) {
        const { data, error } = await supabase
            .from("surah_audio")
            .select("*")
            .eq("reciter_id", reciterId)
            .order("surah_number", { ascending: true });

        if (error) {
            console.error("Error fetching surah audio:", error);
            return [];
        }

        return data;
    }
};
