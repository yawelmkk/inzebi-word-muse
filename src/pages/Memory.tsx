import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, RotateCcw, Timer, Grid3X3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { mockWords, Word } from "@/data/mockWords";

interface MemoryCard {
  id: string;
  content: string;
  type: "nzebi" | "french";
  wordId: string;
  isFlipped: boolean;
  isMatched: boolean;
}

const PAIRS_COUNT = 6;

const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const getRandomWords = (): Word[] => {
  const validWords = mockWords.filter(
    (w) => w.nzebi_word && w.french_word && w.nzebi_word.length > 0 && w.french_word.length > 0
  );
  return shuffleArray(validWords).slice(0, PAIRS_COUNT);
};

const createCards = (words: Word[]): MemoryCard[] => {
  const cards: MemoryCard[] = [];

  words.forEach((word, index) => {
    // Card with Nzébi word
    cards.push({
      id: `nzebi-${index}`,
      content: word.nzebi_word,
      type: "nzebi",
      wordId: word.id,
      isFlipped: false,
      isMatched: false,
    });
    // Card with French translation
    cards.push({
      id: `french-${index}`,
      content: word.french_word,
      type: "french",
      wordId: word.id,
      isFlipped: false,
      isMatched: false,
    });
  });

  return shuffleArray(cards);
};

const Memory = () => {
  const [cards, setCards] = useState<MemoryCard[]>([]);
  const [flippedCards, setFlippedCards] = useState<string[]>([]);
  const [matchedPairs, setMatchedPairs] = useState<number>(0);
  const [moves, setMoves] = useState<number>(0);
  const [timer, setTimer] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [gameComplete, setGameComplete] = useState<boolean>(false);
  const [isChecking, setIsChecking] = useState<boolean>(false);

  const initGame = useCallback(() => {
    const words = getRandomWords();
    setCards(createCards(words));
    setFlippedCards([]);
    setMatchedPairs(0);
    setMoves(0);
    setTimer(0);
    setIsRunning(false);
    setGameComplete(false);
    setIsChecking(false);
  }, []);

  useEffect(() => {
    initGame();
  }, [initGame]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning && !gameComplete) {
      interval = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, gameComplete]);

  useEffect(() => {
    if (matchedPairs === PAIRS_COUNT && matchedPairs > 0) {
      setGameComplete(true);
      setIsRunning(false);
    }
  }, [matchedPairs]);

  const handleCardClick = (cardId: string) => {
    if (isChecking) return;
    if (flippedCards.length >= 2) return;
    if (flippedCards.includes(cardId)) return;

    const card = cards.find((c) => c.id === cardId);
    if (!card || card.isMatched) return;

    if (!isRunning) {
      setIsRunning(true);
    }

    const newFlipped = [...flippedCards, cardId];
    setFlippedCards(newFlipped);

    setCards((prev) =>
      prev.map((c) => (c.id === cardId ? { ...c, isFlipped: true } : c))
    );

    if (newFlipped.length === 2) {
      setMoves((prev) => prev + 1);
      setIsChecking(true);

      const [firstId, secondId] = newFlipped;
      const firstCard = cards.find((c) => c.id === firstId);
      const secondCard = cards.find((c) => c.id === secondId);

      if (
        firstCard &&
        secondCard &&
        firstCard.wordId === secondCard.wordId &&
        firstCard.type !== secondCard.type
      ) {
        // Match!
        setTimeout(() => {
          setCards((prev) =>
            prev.map((c) =>
              c.wordId === firstCard.wordId ? { ...c, isMatched: true } : c
            )
          );
          setMatchedPairs((prev) => prev + 1);
          setFlippedCards([]);
          setIsChecking(false);
        }, 500);
      } else {
        // No match
        setTimeout(() => {
          setCards((prev) =>
            prev.map((c) =>
              newFlipped.includes(c.id) ? { ...c, isFlipped: false } : c
            )
          );
          setFlippedCards([]);
          setIsChecking(false);
        }, 1000);
      }
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="gradient-warm py-6 px-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2 text-primary-foreground hover:opacity-80 transition-opacity"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Retour</span>
          </Link>
          <h1 className="text-xl font-bold text-primary-foreground">Memory Nzébi</h1>
          <ThemeToggle />
        </div>
      </header>

      <main className="px-4 py-6 max-w-2xl mx-auto">
        {/* Stats */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Timer className="w-4 h-4" />
              <span className="font-mono text-lg">{formatTime(timer)}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Grid3X3 className="w-4 h-4" />
              <span className="font-mono text-lg">{moves} coups</span>
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            {matchedPairs}/{PAIRS_COUNT} paires
          </div>
        </div>

        {/* Game complete message */}
        {gameComplete && (
          <Card className="mb-6 shadow-soft border-primary/20 bg-primary/5 animate-fade-in">
            <CardContent className="p-6 text-center">
              <h2 className="text-2xl font-bold text-primary mb-2">🎉 Félicitations !</h2>
              <p className="text-muted-foreground mb-4">
                Vous avez trouvé toutes les paires en {formatTime(timer)} avec {moves} coups.
              </p>
              <Button onClick={initGame} className="gap-2">
                <RotateCcw className="w-4 h-4" />
                Rejouer
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Memory Grid */}
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-6">
          {cards.map((card) => (
            <div
              key={card.id}
              className="aspect-square perspective-1000"
              onClick={() => handleCardClick(card.id)}
            >
              <div
                className={`relative w-full h-full transition-transform duration-500 transform-style-preserve-3d cursor-pointer ${
                  card.isFlipped || card.isMatched ? "rotate-y-180" : ""
                }`}
              >
                {/* Back of card */}
                <div
                  className={`absolute inset-0 rounded-lg border-2 bg-gradient-to-br from-primary/80 to-primary flex items-center justify-center backface-hidden shadow-soft ${
                    card.isMatched ? "opacity-0" : ""
                  }`}
                >
                  <span className="text-3xl font-bold text-primary-foreground opacity-30">?</span>
                </div>

                {/* Front of card */}
                <div
                  className={`absolute inset-0 rounded-lg border-2 flex items-center justify-center p-2 backface-hidden rotate-y-180 shadow-soft transition-colors ${
                    card.isMatched
                      ? "bg-green-500/10 border-green-500/50"
                      : "bg-card border-border"
                  }`}
                >
                  <div className="text-center">
                    <span
                      className={`text-sm sm:text-base font-medium leading-tight block ${
                        card.isMatched ? "text-green-600 dark:text-green-400" : "text-foreground"
                      }`}
                    >
                      {card.content}
                    </span>
                    <span
                      className={`text-[10px] sm:text-xs mt-1 block ${
                        card.isMatched
                          ? "text-green-500/70 dark:text-green-400/70"
                          : "text-muted-foreground"
                      }`}
                    >
                      {card.type === "nzebi" ? "Nzébi" : "Français"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Replay button */}
        {!gameComplete && (
          <div className="text-center">
            <Button variant="outline" onClick={initGame} className="gap-2">
              <RotateCcw className="w-4 h-4" />
              Nouvelle partie
            </Button>
          </div>
        )}
      </main>

      {/* CSS for 3D flip effect */}
      <style>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        .transform-style-preserve-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
      `}</style>
    </div>
  );
};

export default Memory;
