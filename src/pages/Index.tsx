import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { SearchBar } from "@/components/SearchBar";
import { WordCard } from "@/components/WordCard";
import { mockWords } from "@/data/mockWords";
import { Sparkles, BookOpen, MoreVertical, Settings, Info, Mail, Link, MessageCircle } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [displayLimit, setDisplayLimit] = useState(50);
  const [isContactDialogOpen, setIsContactDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("dictionary");
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

  // Sélectionner 5 mots différents chaque jour (mémorisé pour éviter les recalculs)
  const featuredWords = useMemo(() => {
    const today = new Date();
    const dateString = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;
    
    // Créer un seed basé sur la date
    let seed = 0;
    for (let i = 0; i < dateString.length; i++) {
      seed = (seed * 31 + dateString.charCodeAt(i)) % mockWords.length;
    }
    
    // Sélectionner 5 mots différents basés sur le seed
    const indices = new Set<number>();
    let currentSeed = seed;
    
    while (indices.size < 5 && indices.size < mockWords.length) {
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
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3 flex-1 justify-center">
              <BookOpen className="h-8 w-8 text-primary-foreground" />
              <h1 className="text-3xl md:text-4xl font-bold text-primary-foreground text-center">
                Dictionnaire Inzébi
              </h1>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="text-primary-foreground hover:bg-primary-foreground/20"
                >
                  <MoreVertical className="h-6 w-6" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Paramètres</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Info className="mr-2 h-4 w-4" />
                  <span>À propos</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIsContactDialogOpen(true)}>
                  <Mail className="mr-2 h-4 w-4" />
                  <span>Contactez-nous</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link className="mr-2 h-4 w-4" />
                  <span>Liens utiles</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Contact Dialog */}
      <Dialog open={isContactDialogOpen} onOpenChange={setIsContactDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Contactez-nous</DialogTitle>
            <DialogDescription>
              Choisissez votre méthode de contact préférée
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 mt-4">
            <Button
              onClick={() => {
                window.open('https://wa.me/24176208199', '_blank');
                setIsContactDialogOpen(false);
              }}
              className="w-full flex items-center justify-center gap-2"
              variant="default"
            >
              <MessageCircle className="h-5 w-5" />
              Contacter via WhatsApp
            </Button>
            <Button
              onClick={() => {
                window.location.href = 'mailto:languenzebiofficiel@gmail.com';
                setIsContactDialogOpen(false);
              }}
              className="w-full flex items-center justify-center gap-2"
              variant="secondary"
            >
              <Mail className="h-5 w-5" />
              Contacter par Email
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Tabs Navigation */}
      <div className="max-w-4xl mx-auto px-4 pt-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="dictionary" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Dictionnaire
            </TabsTrigger>
            <TabsTrigger value="wordofday" className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Mots du jour
            </TabsTrigger>
          </TabsList>

          {/* Dictionary Tab */}
          <TabsContent value="dictionary" className="mt-0">
            {/* Search Bar */}
            <div className="mb-6">
              <SearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Rechercher un mot en Inzébi ou en Français..."
              />
            </div>

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
              <div className="animate-fade-in">
                <h2 className="text-xl font-semibold text-foreground mb-4">
                  Tous les mots
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
          </TabsContent>

          {/* Word of the Day Tab */}
          <TabsContent value="wordofday" className="mt-0">
            <div className="animate-fade-in">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                  <Sparkles className="h-6 w-6 text-primary" />
                  Mots du jour
                </h2>
                <p className="text-muted-foreground mt-2">
                  Découvrez les {featuredWords.length} mots sélectionnés pour aujourd'hui
                </p>
              </div>
              <div className="space-y-4">
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
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
