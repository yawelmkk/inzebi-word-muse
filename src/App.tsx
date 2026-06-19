import { Toaster } from "@/components/ui/toaster";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "next-themes";
import { Component, lazy, ReactNode, Suspense, useState } from "react";
import { AuthProvider } from "@/hooks/useAuth";
import SplashScreen from "@/components/SplashScreen";

const Index = lazy(() => import("./pages/Index"));
const WordDetail = lazy(() => import("./pages/WordDetail"));
const Quiz = lazy(() => import("./pages/Quiz"));
const Hangman = lazy(() => import("./pages/Hangman"));
const Memory = lazy(() => import("./pages/Memory"));
const Sprint = lazy(() => import("./pages/Sprint"));
const Auth = lazy(() => import("./pages/Auth"));
const NotFound = lazy(() => import("./pages/NotFound"));

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

const RouteLoading = () => (
  <div className="min-h-screen bg-background flex items-center justify-center px-6 text-center">
    <div className="space-y-3">
      <div className="mx-auto h-10 w-10 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
      <p className="text-sm font-medium text-muted-foreground">Chargement du dictionnaire…</p>
    </div>
  </div>
);

class AppErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.error("Erreur de rendu de l'application", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-6 text-center">
          <div className="max-w-md space-y-4">
            <h1 className="text-2xl font-bold text-foreground">Le dictionnaire n’a pas pu s’afficher</h1>
            <p className="text-muted-foreground">
              Recharge la page. Si le problème continue, le fichier des mots contient probablement une donnée invalide.
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="rounded-md bg-primary px-4 py-2 text-primary-foreground font-medium"
            >
              Recharger
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const App = () => {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <AppErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <BrowserRouter basename={import.meta.env.PROD && typeof window !== "undefined" && window.location.hostname.endsWith("github.io") ? "/inzebi-word-muse" : "/"}>
            <AuthProvider>
              <TooltipProvider>
                <Toaster />
                {showSplash && <SplashScreen onComplete={() => setShowSplash(false)} duration={2500} />}
                <Suspense fallback={<RouteLoading />}>
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/splash" element={<SplashScreen onComplete={() => {}} duration={999999} />} />
                    <Route path="/auth" element={<Auth />} />
                    <Route path="/word/:id" element={<WordDetail />} />
                    <Route path="/quiz" element={<Quiz />} />
                    <Route path="/hangman" element={<Hangman />} />
                    <Route path="/memory" element={<Memory />} />
                    <Route path="/sprint" element={<Sprint />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
              </TooltipProvider>
            </AuthProvider>
          </BrowserRouter>
        </ThemeProvider>
      </QueryClientProvider>
    </AppErrorBoundary>
  );
};

export default App;
