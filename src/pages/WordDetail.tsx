import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Heart, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { mockWords } from "@/data/mockWords";
import { useState } from "react";

const WordDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isFavorite, setIsFavorite] = useState(false);
  
  const word = mockWords.find((w) => w.id === id);

  if (!word) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Mot non trouvé</h2>
          <Button onClick={() => navigate("/")}>
            Retour à l'accueil
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="gradient-warm p-6 shadow-soft">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/")}
            className="text-primary-foreground hover:bg-white/20"
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <h1 className="text-2xl font-bold text-primary-foreground">
            Détails
          </h1>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsFavorite(!isFavorite)}
            className="text-primary-foreground hover:bg-white/20"
          >
            <Heart className={isFavorite ? "fill-current" : ""} />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto p-6 space-y-6 animate-fade-in">
        {/* Word Header */}
        <Card className="p-6 shadow-soft">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-4xl font-bold text-foreground">{word.word}</h2>
              <Button
                variant="outline"
                size="icon"
                className="hover:bg-secondary"
              >
                <Volume2 className="h-5 w-5" />
              </Button>
            </div>
            {word.pronunciation && (
              <p className="text-muted-foreground italic">/{word.pronunciation}/</p>
            )}
            <div className="flex items-center gap-2">
              <span className="bg-secondary px-3 py-1 rounded-full text-sm text-secondary-foreground">
                {word.type}
              </span>
            </div>
          </div>
        </Card>

        {/* Translation */}
        <Card className="p-6 shadow-soft">
          <h3 className="text-sm font-semibold text-muted-foreground mb-2">
            TRADUCTION
          </h3>
          <p className="text-2xl font-semibold text-foreground">{word.translation}</p>
        </Card>

        {/* Definition */}
        <Card className="p-6 shadow-soft">
          <h3 className="text-sm font-semibold text-muted-foreground mb-3">
            DÉFINITION
          </h3>
          <p className="text-lg text-foreground leading-relaxed">{word.definition}</p>
        </Card>

        {/* Examples */}
        {word.examples && word.examples.length > 0 && (
          <Card className="p-6 shadow-soft">
            <h3 className="text-sm font-semibold text-muted-foreground mb-3">
              EXEMPLES
            </h3>
            <div className="space-y-3">
              {word.examples.map((example, index) => (
                <div
                  key={index}
                  className="p-3 bg-secondary/50 rounded-lg border-l-4 border-primary"
                >
                  <p className="text-foreground italic">"{example}"</p>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default WordDetail;
