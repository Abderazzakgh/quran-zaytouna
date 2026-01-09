import React, { createContext, useContext, useState, ReactNode, useRef, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { surahs } from "@/lib/quran-data";
import { toast } from "sonner";
import type { User } from "@supabase/supabase-js";

export interface Reciter {
    id: string;
    name: string;
    style: string;
}

export interface Surah {
    id: number;
    name: string;
    ayahCount: number;
}

interface QuranContextType {
    currentSurah: Surah;
    setCurrentSurah: (surah: Surah) => void;
    currentAyah: number;
    setCurrentAyah: (ayah: number) => void;
    selectedReciter: Reciter | null;
    setSelectedReciter: React.Dispatch<React.SetStateAction<Reciter | null>>;
    isPlaying: boolean;
    setIsPlaying: (playing: boolean) => void;
    audioElement: HTMLAudioElement | null;
    fontSize: number;
    setFontSize: (size: number) => void;
    completedSurahs: number[];
    toggleSurahCompletion: (id: number) => void;
}

const defaultSurah: Surah = { id: 1, name: "الفاتحة", ayahCount: 7 };

const QuranContext = createContext<QuranContextType | undefined>(undefined);

export const QuranProvider: React.FC<{ children: ReactNode }> = ({ children }) => {


    const [currentSurah, setCurrentSurah] = useState<Surah>(defaultSurah);
    const [currentAyah, setCurrentAyah] = useState<number>(1);
    const [selectedReciter, setSelectedReciter] = useState<Reciter | null>(null);
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
    const [fontSize, setFontSize] = useState<number>(32);

    const [completedSurahs, setCompletedSurahs] = useState<number[]>([]);
    const [user, setUser] = useState<User | null>(null);

    const toggleSurahCompletion = (id: number) => {
        setCompletedSurahs(prev =>
            prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]
        );
    };

    // Auth & Cloud Sync
    useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
            if (session?.user) fetchCloudProgress(session.user.id);
        });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
            if (session?.user) {
                fetchCloudProgress(session.user.id);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const fetchCloudProgress = async (userId: string) => {
        try {
            type UserProgressRow = {
                user_id: string;
                surah_id: number;
                ayah_number: number | null;
                reciter_id: string | null;
                font_size: number | null;
                completed_surahs: number[] | null;
                updated_at: string | null;
            };
            const { data } = await supabase
                .from('user_progress')
                .select('*')
                .eq('user_id', userId)
                .single();

            if (data) {
                const cloudData = data;
                const surahObj = surahs.find(s => s.id === (cloudData as UserProgressRow).surah_id);
                if (surahObj) setCurrentSurah(surahObj);
                if ((cloudData as UserProgressRow).ayah_number != null) setCurrentAyah((cloudData as UserProgressRow).ayah_number);
                if ((cloudData as UserProgressRow).font_size != null) setFontSize((cloudData as UserProgressRow).font_size);
                if ((cloudData as UserProgressRow).completed_surahs) setCompletedSurahs((cloudData as UserProgressRow).completed_surahs);

                toast.success("تم مزامنة ختمتك من السحابة");
            }
        } catch (e) {
            console.error(e);
        }
    };

    // Save Bookmark (Local + Cloud)
    useEffect(() => {
        const bookmark = {
            surah: currentSurah,
            ayah: currentAyah,
            reciter: selectedReciter,
            fontSize,
            completedSurahs
        };

        if (typeof window !== "undefined") {
            localStorage.setItem("quran_bookmark_v2", JSON.stringify(bookmark));
        }

        // Sync to cloud if user is logged in
        if (user) {
            const timeoutId = setTimeout(() => {
                type UserProgressInsert = {
                    user_id: string;
                    surah_id: number;
                    ayah_number: number;
                    reciter_id: string | null;
                    font_size: number;
                    completed_surahs: number[];
                    updated_at: string;
                };
                const payload: UserProgressInsert = {
                    user_id: user.id,
                    surah_id: currentSurah.id,
                    ayah_number: currentAyah,
                    reciter_id: selectedReciter?.id ?? null,
                    font_size,
                    completed_surahs: completedSurahs,
                    updated_at: new Date().toISOString()
                };
                supabase
                    .from<UserProgressInsert>('user_progress')
                    .upsert(payload, { onConflict: 'user_id' })
                    .then(({ error }) => {
                        if (error) console.error("Cloud save error", error);
                    });
            }, 3000); // 3s debounce

            return () => clearTimeout(timeoutId);
        }
    }, [currentSurah, currentAyah, selectedReciter, fontSize, completedSurahs, user]);

    // Restore Bookmark on Init (Local)
    const didRestoreRef = useRef(false);
    useEffect(() => {
        if (didRestoreRef.current) return;
        if (typeof window !== "undefined") {
            const saved = localStorage.getItem("quran_bookmark_v2");
            if (saved) {
                try {
                    const parsed = JSON.parse(saved);
                    if (parsed.surah) setCurrentSurah(parsed.surah);
                    if (parsed.ayah) setCurrentAyah(parsed.ayah);
                    if (parsed.reciter) setSelectedReciter(parsed.reciter);
                    if (parsed.fontSize) setFontSize(parsed.fontSize);
                    if (parsed.completedSurahs) setCompletedSurahs(parsed.completedSurahs);

                    if (parsed.surah && parsed.ayah && !user) {
                        toast.success(`مرحباً بعودتك! تم الانتقال إلى سورة ${parsed.surah.name} الآية ${parsed.ayah}`);
                    }
                } catch (e) {
                    console.error("Failed to restore bookmark", e);
                }
            }
        }
        didRestoreRef.current = true;
    }, [user]); // include user to satisfy hook rules while guarding restore

    // Initialize Global Audio Element
    useEffect(() => {
        if (typeof window !== "undefined" && !audioElement) {
            const audio = new Audio();
            audio.preload = "auto";
            setAudioElement(audio);

            // Sync isPlaying state with actual audio events
            const handlePlay = () => setIsPlaying(true);
            const handlePause = () => setIsPlaying(false);
            const handleEnded = () => setIsPlaying(false);
            const handleError = () => {
                setIsPlaying(false);
                toast.error("تعذّر تحميل الصوت");
            };

            audio.addEventListener('play', handlePlay);
            audio.addEventListener('pause', handlePause);
            audio.addEventListener('ended', handleEnded);
            audio.addEventListener('error', handleError);

            return () => {
                audio.removeEventListener('play', handlePlay);
                audio.removeEventListener('pause', handlePause);
                audio.removeEventListener('ended', handleEnded);
                audio.removeEventListener('error', handleError);
            };
        }
    }, [audioElement]); // Dependency added to ensure cleanup runs if audioElement changes, though it should only be set once.

    return (
        <QuranContext.Provider
            value={{
                currentSurah,
                setCurrentSurah,
                currentAyah,
                setCurrentAyah,
                selectedReciter,
                setSelectedReciter,
                isPlaying,
                setIsPlaying,
                audioElement,
                fontSize,
                setFontSize,
                completedSurahs,
                toggleSurahCompletion
            }}
        >
            {children}
        </QuranContext.Provider>
    );
};

export const useQuran = () => {
    const context = useContext(QuranContext);
    if (context === undefined) {
        throw new Error('useQuran must be used within a QuranProvider');
    }
    return context;
};
