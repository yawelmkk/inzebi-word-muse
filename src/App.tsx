import { Toaster } from "@/components/ui/toaster";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "next-themes";

import Index from "./pages/Index";
import WordDetail from "./pages/WordDetail";
import NotFound from "./pages/NotFound";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// Importation nommée simple (comme première tentative)
import { Sonner } from "@/components/ui/sonner"; 

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
        <BrowserRouter basename="/inzebi-word-muse">
          <TooltipProvider>
            <Toaster />
            <Sonner /> 

            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/word/:id" element={<WordDetail />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </TooltipProvider>
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;