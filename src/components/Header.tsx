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
    <header className="sticky top-0 z-50 glass-card border-b border-white/10 shadow-premium backdrop-blur-md">
      <div className="container mx-auto px-4 lg:px-8 py-3 lg:py-5">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden hover:bg-primary/10 transition-colors"
              onClick={onMenuClick}
            >
              <Menu className="h-6 w-6 text-foreground/80" />
            </Button>

            <div className="flex items-center gap-4 group cursor-pointer">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <img
                  src={zaytounaEmblem}
                  alt="مصحف الزيتونة"
                  className="w-14 h-14 lg:w-16 lg:h-16 object-contain drop-shadow-md group-hover:scale-105 group-hover:rotate-3 transition-transform duration-500"
                />
              </div>
              <div className="flex flex-col">
                <h1 className="text-2xl lg:text-3xl font-bold text-gradient-primary tracking-tight">
                  مصحف الزيتونة
                </h1>
                <div className="flex items-center gap-2 mt-0.5">
                  <Badge variant="outline" className="text-[10px] uppercase tracking-widest border-primary/20 bg-primary/5 text-primary font-semibold px-2">
                    رواية قالون
                  </Badge>
                  <span className="text-[10px] text-muted-foreground/60 hidden lg:inline">الرقمية للقرآن الكريم</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:block">
              <QuranSearch />
            </div>

            <div className="flex items-center gap-1.5 bg-muted/40 p-1.5 rounded-2xl border border-border/40">
              <Button variant="ghost" size="icon" onClick={toggleTheme} className="w-9 h-9 rounded-xl hover:bg-background shadow-none transition-all duration-300">
                {isDark ? <Sun className="h-[18px] w-[18px] text-yellow-500" /> : <Moon className="h-[18px] w-[18px] text-slate-700" />}
              </Button>

              <div className="w-[1px] h-5 bg-border/50 mx-1" />

              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="w-9 h-9 rounded-xl hover:bg-background shadow-none transition-all duration-300">
                      <User className="h-[18px] w-[18px] text-primary" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 glass-card border-border/50 mt-2 p-2">
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
              className="button-premium hidden sm:flex h-11 px-6 font-semibold"
              onClick={() => {
                const element = document.getElementById('ai-assistant');
                if (element) {
                  element.scrollIntoView({ behavior: 'smooth' });
                }
              }}
            >
              <Sparkles className="h-4 w-4 ml-2" />
              المساعد الذكي
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;