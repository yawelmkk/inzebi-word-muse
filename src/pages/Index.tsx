import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { SearchBar } from "@/components/SearchBar";
import { WordCard } from "@/components/WordCard";
import { mockWords } from "@/data/mockWords";
import { Sparkles, BookOpen } from "lucide-react";

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const filteredWords = mockWords.filter(
    (word) =>
      word.nzebi_word.toLowerCase().includes(searchQuery.toLowerCase()) ||
      word.french_word.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const featuredWords = mockWords.slice(0, 3);

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Hero Header */}
      <div className="gradient-warm p-8 pb-12 shadow-soft">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center justify-center gap-3 mb-4">
            <BookOpen className="h-8 w-8 text-primary-foreground" />
            <h1 className="text-3xl md:text-4xl font-bold text-primary-foreground text-center">
              Dictionnaire Inzébi
            </h1>
          </div>
          <p className="text-primary-foreground/90 text-center text-lg">
            Découvrez la richesse de la langue Inzébi
          </p>
          
          {/* Search Bar */}
          <div className="mt-6">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Rechercher un mot en Inzébi ou en Français..."
            />
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 -mt-6">
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
                onClick={() => navigate(`/word/${word.id}`)}
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
                onClick={() => navigate(`/word/${word.id}`)}
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
              Tous les mots
            </h2>
            <div className="space-y-4">
              {mockWords.map((word) => (
              <WordCard
                key={word.id}
                word={word.nzebi_word}
                translation={word.french_word}
                partOfSpeech={word.part_of_speech}
                onClick={() => navigate(`/word/${word.id}`)}
              />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
