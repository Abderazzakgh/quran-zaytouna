import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { lazy, Suspense } from "react";
import { Loader2 } from "lucide-react";
import { QuranProvider } from "./contexts/QuranContext";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const Index = lazy(() => import("./pages/Index"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    // Surgical removal of the reciter to ensure DB is updated
    const removeReciter = async () => {
      const { error } = await supabase
        .from('reciters' as any)
        .delete()
        .eq('name', 'أبو عبد الله منير التونسي');

      if (!error) {
        console.log('Reciter removed successfully');
      }
    };
    removeReciter();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <QuranProvider>
        <HelmetProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Suspense fallback={
                <div className="flex items-center justify-center min-h-screen">
                  <Loader2 className="h-10 w-10 animate-spin text-primary" />
                </div>
              }>
                <Routes>
                  <Route path="/" element={<Index />} />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </BrowserRouter>
          </TooltipProvider>
        </HelmetProvider>
      </QuranProvider>
    </QueryClientProvider>
  );
};

export default App;
