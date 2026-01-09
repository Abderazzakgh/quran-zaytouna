import { Button } from "@/components/ui/button";
import { Search, Menu, Settings, Moon, Sun, User, LogOut, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import AuthDialog from "./AuthDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
// الشعار من مجلد public
import { QuranSearch } from "./QuranSearch";
const zaytounaEmblem = "/zaytouna-emblem.svg";

interface HeaderProps {
  onMenuClick?: () => void;
}

const Header = ({ onMenuClick }: HeaderProps) => {
  const [isDark, setIsDark] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    // Get initial user
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      if (user) {
        fetchProfile(user.id);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (data) setProfile(data);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <header className="sticky top-0 z-50 glass-card border-b border-white/10 shadow-premium backdrop-blur-md w-full">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 sm:gap-6">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden hover:bg-primary/10 transition-colors touch-target"
              onClick={onMenuClick}
            >
              <Menu className="h-5 w-5 sm:h-6 sm:w-6 text-foreground/80" />
            </Button>

            <div className="flex items-center gap-2 sm:gap-4 group cursor-pointer">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <img
                  src={zaytounaEmblem}
                  alt="مصحف الزيتونة"
                  className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 object-contain drop-shadow-md group-hover:scale-105 group-hover:rotate-3 transition-transform duration-500"
                />
              </div>
              <div className="flex flex-col">
                <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gradient-primary tracking-tight">
                  مصحف الزيتونة
                </h1>
                <div className="flex items-center gap-1 sm:gap-2 mt-0.5">
                  <Badge variant="outline" className="text-[8px] sm:text-[10px] uppercase tracking-widest border-primary/20 bg-primary/5 text-primary font-semibold px-1.5 sm:px-2">
                    رواية قالون
                  </Badge>
                  <span className="text-[8px] sm:text-[10px] text-muted-foreground/60 hidden sm:inline">الرقمية للقرآن الكريم</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <div className="hidden md:block flex-1 max-w-xs">
              <QuranSearch />
            </div>

            <div className="flex items-center gap-1 bg-muted/40 p-1 rounded-xl border border-border/40">
              <Button variant="ghost" size="icon" onClick={toggleTheme} className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl hover:bg-background shadow-none transition-all duration-300 touch-target">
                {isDark ? <Sun className="h-[16px] sm:h-[18px] w-[16px] sm:w-[18px] text-yellow-500" /> : <Moon className="h-[16px] sm:h-[18px] w-[16px] sm:w-[18px] text-slate-700" />}
              </Button>

              <div className="w-0.5 sm:w-[1px] h-4 sm:h-5 bg-border/50 mx-0.5 sm:mx-1" />

              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl hover:bg-background shadow-none transition-all duration-300 touch-target">
                      <User className="h-[16px] sm:h-[18px] w-[16px] sm:w-[18px] text-primary" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 sm:w-56 glass-card border-border/50 mt-2 p-2">
                    <div className="px-3 py-2 border-b border-border/30 mb-2">
                      <p className="text-xs text-muted-foreground">مرحباً بك</p>
                      <p className="text-sm font-semibold truncate">{profile?.full_name || profile?.username || user.email}</p>
                    </div>
                    <DropdownMenuItem className="rounded-lg mb-1 focus:bg-primary/10 cursor-pointer">
                      <Settings className="h-4 w-4 ml-2" />
                      الإعدادات
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleSignOut} className="rounded-lg text-destructive focus:bg-destructive/10 cursor-pointer">
                      <LogOut className="h-4 w-4 ml-2" />
                      تسجيل الخروج
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <AuthDialog />
              )}
            </div>

            <Button
              variant="default"
              className="button-premium hidden sm:flex h-9 sm:h-11 px-4 sm:px-6 font-semibold text-sm sm:text-base"
              onClick={() => {
                const element = document.getElementById('ai-assistant');
                if (element) {
                  element.scrollIntoView({ behavior: 'smooth' });
                }
              }}
            >
              <Sparkles className="h-3 sm:h-4 w-3 sm:w-4 ml-1 sm:ml-2" />
              <span className="hidden md:inline">المساعد الذكي</span>
              <span className="md:hidden">AI</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;