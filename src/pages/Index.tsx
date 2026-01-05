import { useState, useEffect, useRef, useMemo } from "react";
import { Link as RouterLink } from "react-router-dom";
import { SearchBar } from "@/components/SearchBar";
import { WordAccordionItem } from "@/components/WordAccordionItem";
import { CategoryFilter } from "@/components/CategoryFilter";
import { ThemeToggle } from "@/components/ThemeToggle";
import { mockWords } from "@/data/mockWords";
import { Sparkles, BookOpen, MoreVertical, Info, Mail, Link, MessageCircle, Facebook, Youtube, Gamepad2, PenLine, Grid3X3 } from "lucide-react";
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
  // Restaurer l'état depuis sessionStorage
  const savedState = sessionStorage.getItem('dictionaryState');
  const parsedState = savedState ? JSON.parse(savedState) : null;
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [displayLimit, setDisplayLimit] = useState(parsedState?.displayLimit || 50);
  const [isContactDialogOpen, setIsContactDialogOpen] = useState(false);
  const [isLinksDialogOpen, setIsLinksDialogOpen] = useState(false);
  const [isAboutDialogOpen, setIsAboutDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(parsedState?.activeTab || "dictionary");
  const observerTarget = useRef<HTMLDivElement>(null);
  const hasRestoredScroll = useRef(false);

  // Restaurer la position de scroll après le premier rendu
  useEffect(() => {
    if (parsedState?.scrollPosition && !hasRestoredScroll.current) {
      hasRestoredScroll.current = true;
      // Attendre que le DOM soit rendu avec les bons éléments
      requestAnimationFrame(() => {
        window.scrollTo(0, parsedState.scrollPosition);
        // Nettoyer après restauration
        sessionStorage.removeItem('dictionaryState');
      });
    }
  }, []);

  // Filtrer par recherche + catégorie (mémoïsé pour éviter les gels UI)
  const filteredWords = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const category = selectedCategory.trim().toLowerCase();

    return mockWords.filter((word) => {
      const nz = word.nzebi_word.toLowerCase();
      const fr = word.french_word.toLowerCase();

      const matchesSearch = q === "" || nz.includes(q) || fr.includes(q);
      if (!matchesSearch) return false;

      if (category === "") return true;

      const partOfSpeech = word.part_of_speech.toLowerCase();

      // Cas spéciaux (évite les collisions entre catégories)
      if (category === "pronom personnel") {
        return partOfSpeech === "pronom personnel";
      }
      if (category === "pronom") {
        return partOfSpeech.includes("pronom") && partOfSpeech !== "pronom personnel";
      }
      if (category === "nom commun") {
        return partOfSpeech === "nom commun" || partOfSpeech.startsWith("nom commun");
      }
      if (category === "nom propre") {
        return partOfSpeech === "nom propre" || partOfSpeech.startsWith("nom propre");
      }

      return partOfSpeech.includes(category) || partOfSpeech.startsWith(category);
    });
  }, [searchQuery, selectedCategory]);

  // Reset pagination when filters change
  useEffect(() => {
    console.log("[Index] filters", {
      searchQuery,
      selectedCategory,
      results: filteredWords.length,
    });
    setDisplayLimit(50);
  }, [searchQuery, selectedCategory, filteredWords.length]);

  // Infinite scroll pour charger plus de mots
  useEffect(() => {
    const total = filteredWords.length;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && displayLimit < total) {
          setDisplayLimit((prev) => Math.min(prev + 50, total));
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
  }, [displayLimit, filteredWords.length]);

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
            <div className="flex items-center gap-1">
              <ThemeToggle />
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
                  <DropdownMenuItem onClick={() => setIsAboutDialogOpen(true)}>
                    <Info className="mr-2 h-4 w-4" />
                    <span>À propos</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setIsContactDialogOpen(true)}>
                    <Mail className="mr-2 h-4 w-4" />
                    <span>Contactez-nous</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setIsLinksDialogOpen(true)}>
                    <Link className="mr-2 h-4 w-4" />
                    <span>Liens utiles</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
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

      {/* Links Dialog */}
      <Dialog open={isLinksDialogOpen} onOpenChange={setIsLinksDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Liens utiles</DialogTitle>
            <DialogDescription>
              Suivez-nous sur les réseaux sociaux
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 mt-4">
            <Button
              onClick={() => {
                window.open('https://www.facebook.com/languenzebiofficiel', '_blank');
                setIsLinksDialogOpen(false);
              }}
              className="w-full flex items-center justify-center gap-2"
              variant="default"
            >
              <Facebook className="h-5 w-5" />
              Facebook
            </Button>
            <Button
              onClick={() => {
                window.open('https://www.youtube.com/@langue-nzebi-officiel', '_blank');
                setIsLinksDialogOpen(false);
              }}
              className="w-full flex items-center justify-center gap-2"
              variant="secondary"
            >
              <Youtube className="h-5 w-5" />
              YouTube
            </Button>
            <Button
              onClick={() => {
                window.open('https://www.tiktok.com/@langue.nzbi.offic', '_blank');
                setIsLinksDialogOpen(false);
              }}
              className="w-full flex items-center justify-center gap-2"
              variant="secondary"
            >
              <MessageCircle className="h-5 w-5" />
              TikTok
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* About Dialog */}
      <Dialog open={isAboutDialogOpen} onOpenChange={setIsAboutDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>À propos</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 text-sm text-foreground leading-relaxed">
            <p>
              Le dictionnaire Nzébi-français est une application conçue pour préserver, valoriser et transmettre la langue et le patrimoine culturel de l'ethnie Nzébi du Gabon et du Congo.
            </p>
            <p>
              Elle permet à tout utilisateur de découvrir des mots en langue nzébi, leur traduction en français, et dans certains cas, leur prononciation audio, afin d'en faciliter l'apprentissage et la mémorisation.
            </p>
            <p>
              Ce projet s'inscrit dans une démarche de sauvegarde des langues gabonaises minoritaires, souvent menacées de disparition à cause de l'exode rural, de la domination du français, et du vieillissement des locuteurs natifs.
            </p>
            
            <h3 className="font-semibold text-base mt-4">Origine des données linguistiques</h3>
            <p>
              Les données de ce dictionnaire proviennent d'un travail existant, réalisé par: Luc de NADAILLAC, sous la forme d'un PDF librement accessible en ligne. Ce dictionnaire numérique ne prétend en aucun cas s'approprier ce travail. Au contraire, il vise à le valoriser, le diffuser et le rendre plus accessible, notamment aux jeunes générations.
            </p>
            <p>
              Nous reconnaissons et respectons la propriété intellectuelle de l'auteur initial, et l'application ne saurait exister sans sa contribution précieuse.
            </p>
            
            <h3 className="font-semibold text-base mt-4">Qui sont les Nzébi ?</h3>
            <p>
              Les Nzébi (ou Ndzébi, parfois écrit Njebi) sont un peuple bantou du Gabon et du Congo-Brazzaville. Au Gabon, ils sont principalement présents dans le sud-est du pays.
            </p>
            
            <h4 className="font-semibold mt-3">Localisation</h4>
            <p>
              Ils sont installés dans la province du Haut-Ogooué (notamment autour de Franceville, Moanda, Bongoville) et aussi dans le sud de la Ngounié (Mbigou, Mandji, Lébamba, Mouila).
            </p>
            <p>
              Le territoire nzébi se situe entre forêts équatoriales, plateaux sablonneux et zones minières, en bordure du fleuve Ogooué et de ses affluents.
            </p>
            
            <h4 className="font-semibold mt-3">Population</h4>
            <p>
              Leur population est estimée entre 50 000 et 70 000 personnes au Gabon, bien que beaucoup aient migré vers les villes comme Libreville ou Port-Gentil. Certains groupes Nzébi sont également présents au Congo-Brazzaville.
            </p>
            
            <h4 className="font-semibold mt-3">Histoire, culture et langue</h4>
            <p>
              Les Nzébi descendent de peuples bantous migrants, venus des rives du fleuve Congo.
            </p>
            <p>
              Ils sont réputés pour leur culture spirituelle riche, leurs rituels d'initiation (Bwiti, Mwiri, etc.), leurs masques traditionnels et leur oralité poétique.
            </p>
            <p>
              Leur langue, le nzébi, fait partie du groupe B.50 des langues bantoues, avec une grammaire complexe fondée sur les classes nominales et un système de tons.
            </p>
            <p>
              Cependant, cette langue est aujourd'hui en danger, menacée par la prédominance du français dans l'enseignement, les médias et la vie sociale. C'est pourquoi cette application souhaite contribuer, à son échelle, à la préservation de ce patrimoine linguistique précieux.
            </p>
            <p className="font-medium mt-4">
              En utilisant cette application, vous participez activement à la transmission de la langue nzébi. Merci de votre engagement et de votre curiosité.
            </p>
            <p className="font-medium">
              Merci d'utiliser cette application et de soutenir la mission de Langue Nzébi Officiel. En diffusant et en pratiquant la langue nzébi, vous aidez à faire vivre un patrimoine culturel précieux.
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Tabs Navigation */}
      <div className="max-w-4xl mx-auto px-4 pt-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="dictionary" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Dictionnaire
            </TabsTrigger>
            <TabsTrigger value="wordofday" className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Mots du jour
            </TabsTrigger>
            <TabsTrigger value="games" className="flex items-center gap-2">
              <Gamepad2 className="h-4 w-4" />
              Jeux
            </TabsTrigger>
          </TabsList>

          {/* Dictionary Tab */}
          <TabsContent value="dictionary" className="mt-0">
            {/* Search Bar and Filters */}
            <div className="sticky top-0 z-20 bg-background pb-4 pt-0 space-y-4">
              <SearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Rechercher un mot en Inzébi ou en Français..."
              />
              <CategoryFilter
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
              />
            </div>

            {/* Results */}
            <div className="animate-fade-in">
              <div className="space-y-3">
                {filteredWords.length > 0 ? (
                  filteredWords.slice(0, displayLimit).map((word) => (
                    <WordAccordionItem key={word.id} word={word} />
                  ))
                ) : (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground text-lg">
                      Aucun mot trouvé
                      {searchQuery ? ` pour "${searchQuery}"` : ""}
                    </p>
                  </div>
                )}
              </div>

              {/* Observateur pour le chargement progressif */}
              {filteredWords.length > 0 && displayLimit < filteredWords.length && (
                <div ref={observerTarget} className="py-8 text-center">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Chargement... ({Math.min(displayLimit, filteredWords.length)}/{filteredWords.length})
                  </p>
                </div>
              )}
            </div>
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
              <div className="space-y-3">
                {featuredWords.map((word) => (
                  <WordAccordionItem key={word.id} word={word} />
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Games Tab */}
          <TabsContent value="games" className="mt-0">
            <div className="animate-fade-in">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                  <Gamepad2 className="h-6 w-6 text-primary" />
                  Jeux d'apprentissage
                </h2>
                <p className="text-muted-foreground mt-2">
                  Apprenez le Nzébi de manière ludique
                </p>
              </div>
              <div className="space-y-4">
                <RouterLink to="/quiz" className="block">
                  <div className="rounded-lg border bg-card text-card-foreground shadow-soft p-6 hover:border-primary/50 hover:shadow-md transition-all duration-200 cursor-pointer">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <BookOpen className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg text-foreground mb-1">
                          Quiz de vocabulaire
                        </h3>
                        <p className="text-sm text-muted-foreground mb-3">
                          Testez vos connaissances en traduisant des mots Nzébi en français. 10 questions aléatoires à chaque partie.
                        </p>
                        <span className="inline-flex items-center text-sm font-medium text-primary">
                          Jouer maintenant →
                        </span>
                      </div>
                    </div>
                  </div>
                </RouterLink>

                <RouterLink to="/hangman" className="block">
                  <div className="rounded-lg border bg-card text-card-foreground shadow-soft p-6 hover:border-primary/50 hover:shadow-md transition-all duration-200 cursor-pointer">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <PenLine className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg text-foreground mb-1">
                          Jeu du Pendu
                        </h3>
                        <p className="text-sm text-muted-foreground mb-3">
                          Devinez le mot Nzébi lettre par lettre. Attention, vous n'avez droit qu'à 7 erreurs !
                        </p>
                        <span className="inline-flex items-center text-sm font-medium text-primary">
                          Jouer maintenant →
                        </span>
                      </div>
                    </div>
                  </div>
                </RouterLink>

                <RouterLink to="/memory" className="block">
                  <div className="rounded-lg border bg-card text-card-foreground shadow-soft p-6 hover:border-primary/50 hover:shadow-md transition-all duration-200 cursor-pointer">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Grid3X3 className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg text-foreground mb-1">
                          Jeu de Memory
                        </h3>
                        <p className="text-sm text-muted-foreground mb-3">
                          Associez les mots Nzébi à leur traduction française. Entraînez votre mémoire !
                        </p>
                        <span className="inline-flex items-center text-sm font-medium text-primary">
                          Jouer maintenant →
                        </span>
                      </div>
                    </div>
                  </div>
                </RouterLink>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
