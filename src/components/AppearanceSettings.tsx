import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Settings, Type } from "lucide-react";
import { useQuran } from "@/contexts/QuranContext";

export const AppearanceSettings = () => {
    const { fontSize, setFontSize } = useQuran();

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
                    <Type className="h-5 w-5" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-4" side="top">
                <div className="space-y-4">
                    <h4 className="font-semibold text-sm leading-none border-b pb-2">إعدادات العرض</h4>

                    <div className="space-y-2">
                        <div className="flex justify-between items-center text-sm">
                            <span>حجم الخط</span>
                            <span>{fontSize}px</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs">A</span>
                            <Slider
                                value={[fontSize]}
                                min={24}
                                max={80}
                                step={2}
                                onValueChange={(v) => setFontSize(v[0])}
                                className="flex-1"
                            />
                            <span className="text-lg">A</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground pt-2">
                        {/* Future: Add Font Type selections here */}
                        <div className="p-2 border rounded bg-muted/20 text-center">خط الأميري (افتراضي)</div>
                        <div className="p-2 border rounded bg-muted/20 text-center opacity-50">خط عثماني (قريباً)</div>
                    </div>
                </div>
            </PopoverContent>
        </Popover >
    );
};
