import { Toaster } from "@/components/ui/toaster";
// ... (autres imports)
import { BrowserRouter, Routes, Route } from "react-router-dom";
// ...

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter basename="/inzebi-word-muse"> 
        <TooltipProvider>
          {/* ... reste du code ... */}
          <Routes>
            <Route path="/" element={<Index />} />
            {/* ... */}
          </Routes>
        </TooltipProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};
export default App;