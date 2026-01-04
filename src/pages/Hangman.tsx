import { useState, useEffect, useCallback, useMemo } from "react";
import { mockWords, Word } from "@/data/mockWords";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, RotateCcw, Trophy, Frown, Volume2 } from "lucide-react";
import { Link } from "react-router-dom";
import { ThemeToggle } from "@/components/ThemeToggle";
import { cn } from "@/lib/utils";

const MAX_ERRORS = 7;
const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const SPECIAL_CHARS = ["É", "È", "Ê", "Ë", "À", "Â", "Ô", "Î", "Ù", "Û", "Ç"];

// Normalize text for comparison (remove accents)
const normalizeChar = (char: string): string => {
  return char.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();
};

// Get a random word that's suitable for hangman (not too short, has letters)
const getRandomWord = (): Word => {
  const suitableWords = mockWords.filter(w => {
    const word = w.nzebi_word.toUpperCase();
    // Word should be at least 3 chars and contain at least one letter
    return word.length >= 3 && /[A-ZÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖÙÚÛÜÝ]/i.test(word);
  });
  return suitableWords[Math.floor(Math.random() * suitableWords.length)];
};

type GameState = "playing" | "won" | "lost";

const Hangman = () => {
  const [currentWord, setCurrentWord] = useState<Word | null>(null);
  const [guessedLetters, setGuessedLetters] = useState<Set<string>>(new Set());
  const [errors, setErrors] = useState(0);
  const [gameState, setGameState] = useState<GameState>("playing");
  const [revealedIndices, setRevealedIndices] = useState<Set<number>>(new Set());

  // Initialize game
  useEffect(() => {
    startNewGame();
  }, []);

  const startNewGame = useCallback(() => {
    const word = getRandomWord();
    setCurrentWord(word);
    setGuessedLetters(new Set());
    setErrors(0);
    setGameState("playing");
    setRevealedIndices(new Set());
  }, []);

  // Get the display word (with blanks for unguessed letters)
  const displayWord = useMemo(() => {
    if (!currentWord) return [];
    
    return currentWord.nzebi_word.split("").map((char, index) => {
      const normalizedChar = normalizeChar(char);
      const isLetter = /[A-Z]/i.test(normalizedChar);
      
      if (!isLetter) {
        // Show punctuation, spaces, apostrophes directly
        return { char, revealed: true, index };
      }
      
      const isGuessed = guessedLetters.has(normalizedChar);
      const isRevealed = revealedIndices.has(index);
      
      return { 
        char: isGuessed || isRevealed ? char : "_", 
        revealed: isGuessed || isRevealed,
        index,
        justRevealed: isRevealed && !revealedIndices.has(index)
      };
    });
  }, [currentWord, guessedLetters, revealedIndices]);

  // Check win/lose condition
  useEffect(() => {
    if (!currentWord || gameState !== "playing") return;

    const wordLetters = currentWord.nzebi_word
      .split("")
      .filter(char => /[A-Z]/i.test(normalizeChar(char)))
      .map(char => normalizeChar(char));
    
    const uniqueLetters = new Set(wordLetters);
    const allGuessed = [...uniqueLetters].every(letter => guessedLetters.has(letter));

    if (allGuessed) {
      setGameState("won");
    } else if (errors >= MAX_ERRORS) {
      setGameState("lost");
      // Reveal all letters when lost
      setRevealedIndices(new Set(currentWord.nzebi_word.split("").map((_, i) => i)));
    }
  }, [guessedLetters, errors, currentWord, gameState]);

  const handleGuess = useCallback((letter: string) => {
    if (gameState !== "playing" || !currentWord) return;
    
    const normalizedLetter = normalizeChar(letter);
    if (guessedLetters.has(normalizedLetter)) return;

    const newGuessed = new Set(guessedLetters);
    newGuessed.add(normalizedLetter);
    setGuessedLetters(newGuessed);

    // Check if letter is in word
    const wordLetters = currentWord.nzebi_word
      .split("")
      .map(char => normalizeChar(char));
    
    if (!wordLetters.includes(normalizedLetter)) {
      setErrors(prev => prev + 1);
    } else {
      // Animate revealed letters
      const newRevealed = new Set(revealedIndices);
      wordLetters.forEach((char, index) => {
        if (char === normalizedLetter) {
          newRevealed.add(index);
        }
      });
      setRevealedIndices(newRevealed);
    }
  }, [gameState, currentWord, guessedLetters, revealedIndices]);

  const getLetterState = (letter: string) => {
    const normalized = normalizeChar(letter);
    if (!guessedLetters.has(normalized)) return "default";
    
    if (!currentWord) return "default";
    
    const wordLetters = currentWord.nzebi_word
      .split("")
      .map(char => normalizeChar(char));
    
    return wordLetters.includes(normalized) ? "correct" : "wrong";
  };

  const progressPercentage = (errors / MAX_ERRORS) * 100;

  if (!currentWord) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="gradient-warm py-6 px-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-primary-foreground hover:opacity-80 transition-opacity">
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Retour</span>
          </Link>
          <h1 className="text-xl font-bold text-primary-foreground">Jeu du Pendu</h1>
          <ThemeToggle />
        </div>
      </header>

      <main className="px-4 py-6">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Error Gauge */}
          <Card className="shadow-soft">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Erreurs</span>
                <span className={cn(
                  "text-sm font-medium",
                  errors >= MAX_ERRORS - 2 ? "text-red-500" : "text-muted-foreground"
                )}>
                  {errors} / {MAX_ERRORS}
                </span>
              </div>
              <div className="relative">
                <Progress 
                  value={progressPercentage} 
                  className={cn(
                    "h-3 transition-all",
                    errors >= MAX_ERRORS - 2 && "[&>div]:bg-red-500"
                  )}
                />
              </div>
              {/* Visual hangman stages */}
              <div className="flex justify-center gap-1 mt-3">
                {Array.from({ length: MAX_ERRORS }).map((_, i) => (
                  <div
                    key={i}
                    className={cn(
                      "w-4 h-4 rounded-full border-2 transition-all duration-300",
                      i < errors 
                        ? "bg-red-500 border-red-500 scale-110" 
                        : "border-muted-foreground/30 bg-transparent"
                    )}
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Word Display */}
          <Card className="shadow-soft">
            <CardHeader className="text-center pb-2">
              <p className="text-sm text-muted-foreground mb-2">
                Devinez le mot Nzébi
              </p>
              {currentWord.part_of_speech && (
                <p className="text-xs text-muted-foreground italic">
                  ({currentWord.part_of_speech})
                </p>
              )}
            </CardHeader>
            <CardContent className="pb-6">
              <div className="flex flex-wrap justify-center gap-2 min-h-[60px] items-center">
                {displayWord.map((item, index) => (
                  <span
                    key={index}
                    className={cn(
                      "text-2xl md:text-3xl font-bold transition-all duration-300",
                      item.revealed && item.char !== "_" 
                        ? "text-primary animate-scale-in" 
                        : "text-foreground",
                      item.char === " " && "mx-2",
                      item.char === "_" && "border-b-2 border-muted-foreground w-6 md:w-8 text-center"
                    )}
                  >
                    {item.char === " " ? "\u00A0" : item.char}
                  </span>
                ))}
              </div>
              
              {/* Hint: French translation (first letter hidden) */}
              {gameState === "playing" && (
                <p className="text-center text-sm text-muted-foreground mt-4">
                  Indice : <span className="italic">{currentWord.french_word}</span>
                </p>
              )}
            </CardContent>
          </Card>

          {/* Game Result */}
          {gameState !== "playing" && (
            <Card className={cn(
              "shadow-soft animate-fade-in border-2",
              gameState === "won" ? "border-green-500/50" : "border-red-500/50"
            )}>
              <CardContent className="p-6">
                <div className="text-center space-y-4">
                  <div className={cn(
                    "w-16 h-16 mx-auto rounded-full flex items-center justify-center",
                    gameState === "won" ? "bg-green-500/10" : "bg-red-500/10"
                  )}>
                    {gameState === "won" ? (
                      <Trophy className="w-8 h-8 text-green-500" />
                    ) : (
                      <Frown className="w-8 h-8 text-red-500" />
                    )}
                  </div>
                  
                  <div>
                    <h3 className={cn(
                      "text-xl font-bold mb-1",
                      gameState === "won" ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                    )}>
                      {gameState === "won" ? "Bravo !" : "Dommage !"}
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      {gameState === "won" 
                        ? "Vous avez trouvé le mot !" 
                        : "Le mot était :"}
                    </p>
                  </div>

                  {/* Word Card */}
                  <div className="bg-muted/50 rounded-lg p-4 text-left space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-primary">
                        {currentWord.nzebi_word}
                      </span>
                      <span className="text-sm text-muted-foreground italic">
                        {currentWord.part_of_speech}
                      </span>
                    </div>
                    <p className="text-foreground font-medium">
                      {currentWord.french_word}
                    </p>
                    {currentWord.example_nzebi && (
                      <div className="pt-2 border-t border-border/50">
                        <p className="text-sm text-muted-foreground">
                          <span className="font-medium">Ex:</span> {currentWord.example_nzebi}
                        </p>
                        {currentWord.example_french && (
                          <p className="text-sm text-muted-foreground italic">
                            → {currentWord.example_french}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                    <Button onClick={startNewGame} className="gap-2">
                      <RotateCcw className="w-4 h-4" />
                      Nouveau mot
                    </Button>
                    <Button variant="outline" asChild>
                      <Link to="/">Retour aux jeux</Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Keyboard */}
          {gameState === "playing" && (
            <Card className="shadow-soft">
              <CardContent className="p-4">
                {/* Main alphabet */}
                <div className="grid grid-cols-7 sm:grid-cols-9 gap-1.5 mb-3">
                  {ALPHABET.map((letter) => {
                    const state = getLetterState(letter);
                    return (
                      <button
                        key={letter}
                        onClick={() => handleGuess(letter)}
                        disabled={state !== "default"}
                        className={cn(
                          "aspect-square rounded-lg font-bold text-sm sm:text-base",
                          "transition-all duration-200 transform active:scale-95",
                          "flex items-center justify-center",
                          state === "default" && "bg-secondary hover:bg-secondary/80 text-secondary-foreground hover:scale-105",
                          state === "correct" && "bg-green-500 text-white cursor-default",
                          state === "wrong" && "bg-red-500/20 text-red-500/50 cursor-default"
                        )}
                      >
                        {letter}
                      </button>
                    );
                  })}
                </div>
                
                {/* Special characters for Nzébi accents */}
                <div className="flex flex-wrap justify-center gap-1.5 pt-2 border-t border-border">
                  {SPECIAL_CHARS.map((letter) => {
                    const state = getLetterState(letter);
                    return (
                      <button
                        key={letter}
                        onClick={() => handleGuess(letter)}
                        disabled={state !== "default"}
                        className={cn(
                          "w-9 h-9 sm:w-10 sm:h-10 rounded-lg font-bold text-sm",
                          "transition-all duration-200 transform active:scale-95",
                          "flex items-center justify-center",
                          state === "default" && "bg-secondary hover:bg-secondary/80 text-secondary-foreground hover:scale-105",
                          state === "correct" && "bg-green-500 text-white cursor-default",
                          state === "wrong" && "bg-red-500/20 text-red-500/50 cursor-default"
                        )}
                      >
                        {letter}
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default Hangman;
