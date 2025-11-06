import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { SearchBar } from "@/components/SearchBar";
import { WordCard } from "@/components/WordCard";
import { mockWords } from "@/data/mockWords";
import { Sparkles, BookOpen } from "lucide-react";

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [displayLimit, setDisplayLimit] = useState(50);
  const navigate = useNavigate();
  const location = useLocation();
  const scrollPositionRef = useRef(0);
  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Restaurer la position de scroll instantanément si on revient de la page de détail
    if (location.state?.scrollPosition !== undefined) {
      window.scrollTo(0, location.state.scrollPosition);
    }
  }, [location.state]);

  // Infinite scroll pour charger plus de mots
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && displayLimit < mockWords.length) {
          setDisplayLimit((prev) => Math.min(prev + 50, mockWords.length));
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [displayLimit]);

  const handleWordClick = (wordId: string) => {
    // Sauvegarder la position actuelle avant de naviguer
    scrollPositionRef.current = window.scrollY;
    navigate(`/word/${wordId}`, { state: { scrollPosition: scrollPositionRef.current } });
  };

  const filteredWords = mockWords.filter(
    (word) =>
      word.nzebi_word.toLowerCase().includes(searchQuery.toLowerCase()) ||
      word.french_word.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sélectionner 3 mots différents chaque jour (mémorisé pour éviter les recalculs)
  const featuredWords = useMemo(() => {
    const today = new Date();
    const dateString = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;
    
    // Créer un seed basé sur la date
    let seed = 0;
    for (let i = 0; i < dateString.length; i++) {
      seed = (seed * 31 + dateString.charCodeAt(i)) % mockWords.length;
    }
    
    // Sélectionner 3 mots différents basés sur le seed
    const indices = new Set<number>();
    let currentSeed = seed;
    
    while (indices.size < 3 && indices.size < mockWords.length) {
      indices.add(currentSeed % mockWords.length);
      currentSeed = (currentSeed * 7 + 13) % mockWords.length;
    }
    
    return Array.from(indices).map(index => mockWords[index]);
  }, []); // Recalculé seulement au montage du composant

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Hero Header */}
      <div className="gradient-warm p-4 pb-6 shadow-soft">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center gap-3 mb-4">
            <BookOpen className="h-8 w-8 text-primary-foreground" />
            <h1 className="text-3xl md:text-4xl font-bold text-primary-foreground text-center">
              Dictionnaire Inzébi
            </h1>
          </div>
        </div>
      </div>

      {/* Sticky Search Bar */}
      <div className="sticky top-0 z-10 bg-background shadow-md py-4">
        <div className="max-w-4xl mx-auto px-4">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Rechercher un mot en Inzébi ou en Français..."
          />
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 mt-6">
        {/* Featured Words */}
        {!searchQuery && (
          <div className="mb-8 animate-fade-in">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold text-foreground">
                Mots du jour
              </h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {featuredWords.map((word) => (
              <WordCard
                key={word.id}
                word={word.nzebi_word}
                translation={word.french_word}
                partOfSpeech={word.part_of_speech}
                onClick={() => handleWordClick(word.id)}
              />
              ))}
            </div>
          </div>
        )}

        {/* Search Results */}
        {searchQuery && (
          <div className="animate-fade-in">
            <h2 className="text-xl font-semibold text-foreground mb-4">
              {filteredWords.length} résultat{filteredWords.length > 1 ? "s" : ""}
            </h2>
            <div className="space-y-4">
              {filteredWords.length > 0 ? (
                filteredWords.map((word) => (
              <WordCard
                key={word.id}
                word={word.nzebi_word}
                translation={word.french_word}
                partOfSpeech={word.part_of_speech}
                onClick={() => handleWordClick(word.id)}
              />
                ))
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground text-lg">
                    Aucun mot trouvé pour "{searchQuery}"
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* All Words Section */}
        {!searchQuery && (
          <div className="mt-12 animate-fade-in">
            <h2 className="text-xl font-semibold text-foreground mb-4">
              Tous les mots ({mockWords.length})
            </h2>
            <div className="space-y-4">
              {mockWords.slice(0, displayLimit).map((word) => (
              <WordCard
                key={word.id}
                word={word.nzebi_word}
                translation={word.french_word}
                partOfSpeech={word.part_of_speech}
                onClick={() => handleWordClick(word.id)}
              />
              ))}
            </div>
            {/* Observateur pour le chargement progressif */}
            {displayLimit < mockWords.length && (
              <div ref={observerTarget} className="py-8 text-center">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
                <p className="mt-2 text-sm text-muted-foreground">
                  Chargement... ({displayLimit}/{mockWords.length})
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
