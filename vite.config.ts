import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  // **********************************************
  // AJOUT ESSENTIEL POUR GITHUB PAGES
  // 'inzebi-word-muse' doit correspondre au nom de votre dépôt GitHub
  // **********************************************
  base: '/inzebi-word-muse/', 
  
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
