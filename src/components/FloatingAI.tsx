import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
    MessageCircle,
    X,
    Send,
    Sparkles,
    Mic,
    Loader2,
    Minimize2,
    Maximize2
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const FloatingAI = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [message, setMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [conversations, setConversations] = useState<{ type: 'user' | 'ai', text: string }[]>([
        { type: 'ai', text: "مرحباً بك! أنا مساعد الزيتونة الذكي. كيف يمكنني مساعدتك الآن؟" }
    ]);

    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [conversations, isOpen]);

    const handleSendMessage = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!message.trim() || isLoading) return;

        const userText = message;
        setConversations(prev => [...prev, { type: 'user', text: userText }]);
        setMessage("");
        setIsLoading(true);

        try {
            const { data, error } = await supabase.functions.invoke('ai-chat', {
                body: {
                    message: userText, history: conversations.slice(-4).map(c => ({
                        type: c.type,
                        message: c.text
                    }))
                }
            });

            if (error) throw error;

            setConversations(prev => [...prev, { type: 'ai', text: data.response }]);
        } catch (err) {
            console.error("AI Error:", err);
            toast.error("عذراً، المساعد الذكي غير متاح حالياً.");
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 left-6 w-16 h-16 bg-gradient-islamic rounded-full shadow-2xl flex items-center justify-center text-white hover:scale-110 transition-all z-[100] group animate-bounce"
            >
                <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
                <MessageCircle className="h-8 w-8 relative z-10" />
                <span className="absolute -top-2 -right-2 bg-red-500 text-[10px] px-2 py-0.5 rounded-full border-2 border-white">AI</span>
            </button>
        );
    }

    return (
        <div className={`fixed bottom-6 left-6 z-[100] transition-all duration-300 ${isMinimized ? 'h-16 w-64' : 'h-[500px] w-[350px]'}`}>
            <Card className="h-full flex flex-col shadow-2xl border-primary/20 overflow-hidden bg-background/95 backdrop-blur-xl">
                {/* Header */}
                <div className="p-4 bg-gradient-islamic text-white flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 animate-pulse" />
                        <span className="font-bold">المساعد الذكي</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-white/20" onClick={() => setIsMinimized(!isMinimized)}>
                            {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-white/20" onClick={() => setIsOpen(false)}>
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {!isMinimized && (
                    <>
                        {/* Messages */}
                        <div ref={scrollRef} className="flex-1 p-4 overflow-y-auto space-y-3 bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')]">
                            {conversations.map((conv, i) => (
                                <div key={i} className={`flex ${conv.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[85%] p-3 rounded-2xl text-sm shadow-sm ${conv.type === 'user'
                                            ? 'bg-primary text-white rounded-tr-none'
                                            : 'bg-muted rounded-tl-none border border-border/50'
                                        }`}>
                                        {conv.text}
                                    </div>
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex justify-start">
                                    <div className="bg-muted p-3 rounded-2xl rounded-tl-none border border-border/50 flex items-center gap-2">
                                        <Loader2 className="h-3 w-3 animate-spin" />
                                        <span className="text-xs">يكتب حالياً...</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Input */}
                        <form onSubmit={handleSendMessage} className="p-3 border-t bg-muted/30">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="سؤال سريع..."
                                    className="flex-1 h-10 px-3 py-2 bg-background border rounded-xl text-sm focus:ring-2 focus:ring-primary outline-none"
                                    disabled={isLoading}
                                />
                                <Button type="submit" size="icon" className="h-10 w-10 bg-primary" disabled={isLoading}>
                                    <Send className="h-4 w-4" />
                                </Button>
                            </div>
                        </form>
                    </>
                )}
            </Card>
        </div>
    );
};

export default FloatingAI;
