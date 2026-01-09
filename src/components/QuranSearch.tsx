import { useState, useEffect } from "react";
import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { useQuran, Surah } from "@/contexts/QuranContext";
import { DialogTitle } from "@radix-ui/react-dialog";

import { surahs as surahList } from "@/lib/quran-data";
// Note: surahList constant is removed as we import it.
// Note: For a real app, import the FULL constant list.
// I will create a robust fuzzy search here.

export function QuranSearch() {
    const [open, setOpen] = useState(false);
    const { setCurrentSurah, setCurrentAyah } = useQuran();
    const [query, setQuery] = useState("");

    // Keyboard shortcut to open search
    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((open) => !open);
            }
        };
        document.addEventListener("keydown", down);
        return () => document.removeEventListener("keydown", down);
    }, []);

    const handleSelect = (surah: any) => {
        setCurrentSurah(surah);
        setCurrentAyah(1); // Reset to first ayah or allow deep linking later
        setOpen(false);
    };

    return (
        <>
            <Button
                variant="outline"
                className="relative h-10 w-full justify-start rounded-[0.75rem] bg-background/50 text-sm font-normal text-muted-foreground shadow-sm sm:pr-12 md:w-64 lg:w-80 border-primary/10 hover:bg-background/80"
                onClick={() => setOpen(true)}
            >
                <span className="hidden lg:inline-flex">ابحث عن سورة...</span>
                <span className="inline-flex lg:hidden">بحث...</span>
                <kbd className="pointer-events-none absolute left-2 top-2 hidden h-6 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
                    <span className="text-xs">⌘</span>K
                </kbd>
                <Search className="absolute right-3 top-2.5 h-4 w-4 opacity-50" />
            </Button>

            <CommandDialog open={open} onOpenChange={setOpen}>
                <DialogTitle className="sr-only">البحث في القرآن الكريم</DialogTitle>
                <CommandInput
                    placeholder="اكتب اسم السورة (مثال: الكهف)..."
                    className="text-right"
                    value={query}
                    onValueChange={setQuery}
                />
                <CommandList className="text-right" dir="rtl">
                    <CommandEmpty>لم يتم العثور على نتائج.</CommandEmpty>
                    <CommandGroup heading="السور">
                        {/* 
               In a real scenario, we'd map the full list. 
               For now, we map the sample list + generic logic if imported.
               Since I don't have the full list in a separate file yet, I'll rely on the one in AdvancedAudioPlayer if I could export it.
               But to be safe, I'm using a static list for demo purposes of the *Feature*.
            */}
                        {surahList.map((surah) => (
                            <CommandItem
                                key={surah.id}
                                onSelect={() => handleSelect(surah)}
                                className="cursor-pointer gap-2"
                            >
                                <span className="font-bold text-primary">{surah.id}.</span>
                                <span>سورة {surah.name}</span>
                                <span className="mr-auto text-xs text-muted-foreground">({surah.ayahCount} آية)</span>
                            </CommandItem>
                        ))}

                        {/* Quick Actions example */}
                        <CommandItem onSelect={() => handleSelect({ id: 36, name: 'يس', ayahCount: 83 })} className="cursor-pointer">
                            <span className="font-bold text-emerald-600">قلب القرآن (يس)</span>
                        </CommandItem>
                    </CommandGroup>
                </CommandList>
            </CommandDialog>
        </>
    );
}
