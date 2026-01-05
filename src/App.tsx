import { Toaster } from "@/components/ui/toaster";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "next-themes";

import Index from "./pages/Index";
import WordDetail from "./pages/WordDetail";
import Quiz from "./pages/Quiz";
import Hangman from "./pages/Hangman";
import Memory from "./pages/Memory";
import NotFound from "./pages/NotFound";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// L'import de Sonner est supprimé car il fait échouer le build.

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
        <BrowserRouter basename={import.meta.env.PROD ? "/inzebi-word-muse" : "/"}>
          <TooltipProvider>
            <Toaster />
            {/* Le composant Sonner est supprimé pour le build */}

            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/word/:id" element={<WordDetail />} />
              <Route path="/quiz" element={<Quiz />} />
              <Route path="/hangman" element={<Hangman />} />
              <Route path="/memory" element={<Memory />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </TooltipProvider>
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;