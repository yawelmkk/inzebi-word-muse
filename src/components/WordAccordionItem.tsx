import { useState, useEffect, useRef } from "react";
import { Heart, ChevronDown, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Word } from "@/data/mockWords";

interface WordAccordionItemProps {
  word: Word;
  onFavoriteChange?: (wordId: string, isFavorite: boolean) => void;
}

// Helper functions for favorites management
export const getFavorites = (): string[] => {
  const stored = localStorage.getItem('favoriteWords');
  return stored ? JSON.parse(stored) : [];
};

export const setFavorites = (favorites: string[]) => {
  localStorage.setItem('favoriteWords', JSON.stringify(favorites));
  // Dispatch custom event to notify other components
  window.dispatchEvent(new CustomEvent('favoritesChanged', { detail: favorites }));
};

export const WordAccordionItem = ({ word, onFavoriteChange }: WordAccordionItemProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Generate audio path from word
  const audioPath = `/audio/${encodeURIComponent(word.nzebi_word)}.mp3`;

  const playAudio = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    
    const audio = new Audio(audioPath);
    audioRef.current = audio;
    
    audio.onplay = () => setIsPlaying(true);
    audio.onended = () => setIsPlaying(false);
    audio.onerror = () => {
      setIsPlaying(false);
      console.log(`Audio non disponible pour: ${word.nzebi_word}`);
    };
    
    audio.play().catch(() => {
      setIsPlaying(false);
    });
  };

  // Load favorite state from localStorage
  useEffect(() => {
    const favorites = getFavorites();
    setIsFavorite(favorites.includes(word.id));
  }, [word.id]);

  // Listen for favorites changes from other components
  useEffect(() => {
    const handleFavoritesChanged = (e: CustomEvent<string[]>) => {
      setIsFavorite(e.detail.includes(word.id));
    };
    
    window.addEventListener('favoritesChanged', handleFavoritesChanged as EventListener);
    return () => {
      window.removeEventListener('favoritesChanged', handleFavoritesChanged as EventListener);
    };
  }, [word.id]);

  const toggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    const favorites = getFavorites();
    let newFavorites: string[];
    
    if (isFavorite) {
      newFavorites = favorites.filter(id => id !== word.id);
    } else {
      newFavorites = [...favorites, word.id];
    }
    
    setFavorites(newFavorites);
    setIsFavorite(!isFavorite);
    onFavoriteChange?.(word.id, !isFavorite);
  };

  return (
    <div className="border-2 rounded-lg overflow-hidden animate-fade-in bg-card">
      {/* Header - toujours visible */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
      >
        <div className="flex-1 text-left">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-xl font-bold text-foreground">{word.nzebi_word}</h3>
            {word.part_of_speech && (
              <span className="text-xs bg-secondary px-2 py-1 rounded-full text-secondary-foreground">
                {word.part_of_speech}
              </span>
            )}
          </div>
          <p className="text-muted-foreground mt-1">{word.french_word}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={playAudio}
            className={cn(
              "hover:scale-110 transition-transform",
              isPlaying && "text-primary animate-pulse"
            )}
          >
            <Volume2 className={isPlaying ? "text-primary" : "text-muted-foreground"} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleFavorite}
            className="hover:scale-110 transition-transform"
          >
            <Heart className={isFavorite ? "fill-primary text-primary" : "text-muted-foreground"} />
          </Button>
          <ChevronDown 
            className={cn(
              "h-5 w-5 text-muted-foreground transition-transform duration-200",
              isOpen && "rotate-180"
            )} 
          />
        </div>
      </button>

      {/* Contenu expandable */}
      <div
        className={cn(
          "overflow-hidden transition-all duration-300 ease-in-out",
          isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="px-4 pb-4 pt-2 border-t space-y-3">
          {/* Exemples */}
          {word.example_nzebi && (
            <div>
              <p className="text-sm font-medium text-foreground">Exemple :</p>
              <p className="text-sm text-primary italic">{word.example_nzebi}</p>
              {word.example_french && (
                <p className="text-sm text-muted-foreground">{word.example_french}</p>
              )}
            </div>
          )}

          {/* Forme plurielle */}
          {word.plural_form && (
            <div>
              <p className="text-sm font-medium text-foreground">Pluriel :</p>
              <p className="text-sm text-muted-foreground">{word.plural_form}</p>
            </div>
          )}

          {/* Synonymes */}
          {word.synonyms && (
            <div>
              <p className="text-sm font-medium text-foreground">Synonymes :</p>
              <p className="text-sm text-muted-foreground">{word.synonyms}</p>
            </div>
          )}

          {/* Nom scientifique */}
          {word.scientific_name && (
            <div>
              <p className="text-sm font-medium text-foreground">Nom scientifique :</p>
              <p className="text-sm text-muted-foreground italic">{word.scientific_name}</p>
            </div>
          )}

          {/* Impératif (pour les verbes) */}
          {word.imperative && (
            <div>
              <p className="text-sm font-medium text-foreground">Impératif :</p>
              <p className="text-sm text-muted-foreground">{word.imperative}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
