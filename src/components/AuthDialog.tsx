import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface AuthDialogProps {
  trigger?: React.ReactNode;
}

const AuthDialog = ({ trigger }: AuthDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSignUp = async () => {
    if (!email || !password) {
      toast.error("يرجى إدخال البريد الإلكتروني وكلمة المرور");
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName || undefined,
          },
        },
      });

      if (error) throw error;

      toast.success("تم إنشاء الحساب بنجاح! تحقق من بريدك الإلكتروني");
      setIsOpen(false);
      setEmail("");
      setPassword("");
      setFullName("");
    } catch (error: any) {
      toast.error(error.message || "حدث خطأ أثناء إنشاء الحساب");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = async () => {
    if (!email || !password) {
      toast.error("يرجى إدخال البريد الإلكتروني وكلمة المرور");
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      toast.success("تم تسجيل الدخول بنجاح");
      setIsOpen(false);
      setEmail("");
      setPassword("");
    } catch (error: any) {
      toast.error(error.message || "حدث خطأ أثناء تسجيل الدخول");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast.success("تم تسجيل الخروج بنجاح");
    } catch (error: any) {
      toast.error(error.message || "حدث خطأ أثناء تسجيل الخروج");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || <Button variant="outline">تسجيل الدخول</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isLogin ? "تسجيل الدخول" : "إنشاء حساب"}</DialogTitle>
          <DialogDescription>
            {isLogin 
              ? "سجل دخولك للوصول إلى جميع الميزات"
              : "أنشئ حساباً جديداً للبدء في رحلتك مع القرآن الكريم"}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="email">البريد الإلكتروني</Label>
            <Input
              id="email"
              type="email"
              placeholder="example@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          {!isLogin && (
            <div className="space-y-2">
              <Label htmlFor="fullName">الاسم الكامل (اختياري)</Label>
              <Input
                id="fullName"
                placeholder="محمد أحمد"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="password">كلمة المرور</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  isLogin ? handleSignIn() : handleSignUp();
                }
              }}
            />
          </div>
        </div>
        <DialogFooter className="flex-col gap-2">
          <Button
            onClick={isLogin ? handleSignIn : handleSignUp}
            className="w-full"
            disabled={isLoading}
          >
            {isLoading && <Loader2 className="h-4 w-4 ml-2 animate-spin" />}
            {isLogin ? "تسجيل الدخول" : "إنشاء حساب"}
          </Button>
          <Button
            variant="ghost"
            onClick={() => setIsLogin(!isLogin)}
            className="w-full"
          >
            {isLogin ? "ليس لديك حساب؟ سجل الآن" : "لديك حساب؟ سجل دخول"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AuthDialog;



