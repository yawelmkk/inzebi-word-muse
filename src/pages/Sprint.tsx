import { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Heart, RotateCcw, Zap, Volume2, VolumeX } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { mockWords, Word } from "@/data/mockWords";

interface FallingWord {
  id: string;
  word: string;
  isCorrect: boolean;
  x: number;
  y: number;
  speed: number;
}

interface MissedWord {
  word: Word;
  reason: "wrong_click" | "timeout";
}

const GAME_HEIGHT = 400;
const WORD_HEIGHT = 50;
const INITIAL_SPEED = 1;
const SPEED_INCREMENT = 0.15;
const MAX_LIVES = 3;

const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// Simple sound effects using Web Audio API
const createAudioContext = () => {
  return new (window.AudioContext || (window as any).webkitAudioContext)();
};

const playCorrectSound = (audioContext: AudioContext | null) => {
  if (!audioContext) return;
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  oscillator.frequency.value = 880;
  oscillator.type = "sine";
  gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 0.2);
};

const playWrongSound = (audioContext: AudioContext | null) => {
  if (!audioContext) return;
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  oscillator.frequency.value = 220;
  oscillator.type = "square";
  gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 0.3);
};

const Sprint = () => {
  const [gameState, setGameState] = useState<"ready" | "playing" | "gameover">("ready");
  const [lives, setLives] = useState(MAX_LIVES);
  const [score, setScore] = useState(0);
  const [currentWord, setCurrentWord] = useState<Word | null>(null);
  const [fallingWords, setFallingWords] = useState<FallingWord[]>([]);
  const [speed, setSpeed] = useState(INITIAL_SPEED);
  const [missedWords, setMissedWords] = useState<MissedWord[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [flashEffect, setFlashEffect] = useState<"correct" | "wrong" | null>(null);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const animationRef = useRef<number>();
  const usedWordsRef = useRef<Set<string>>(new Set());
  const gameContainerRef = useRef<HTMLDivElement>(null);

  const getValidWords = useCallback(() => {
    return mockWords.filter(
      (w) => w.nzebi_word && w.french_word && w.nzebi_word.length > 0 && w.french_word.length > 0
    );
  }, []);

  const getNextQuestion = useCallback(() => {
    const validWords = getValidWords().filter((w) => !usedWordsRef.current.has(w.id));
    
    if (validWords.length < 4) {
      usedWordsRef.current.clear();
      return getNextQuestion();
    }

    const shuffled = shuffleArray(validWords);
    const correctWord = shuffled[0];
    const wrongWords = shuffled.slice(1, 3);

    usedWordsRef.current.add(correctWord.id);

    const containerWidth = gameContainerRef.current?.offsetWidth || 400;
    const wordWidth = 120;
    const positions = [
      containerWidth * 0.15,
      containerWidth * 0.5 - wordWidth / 2,
      containerWidth * 0.85 - wordWidth,
    ];
    const shuffledPositions = shuffleArray(positions);

    const newFallingWords: FallingWord[] = [
      {
        id: `correct-${Date.now()}`,
        word: correctWord.nzebi_word,
        isCorrect: true,
        x: shuffledPositions[0],
        y: -WORD_HEIGHT,
        speed: speed,
      },
      {
        id: `wrong1-${Date.now()}`,
        word: wrongWords[0].nzebi_word,
        isCorrect: false,
        x: shuffledPositions[1],
        y: -WORD_HEIGHT - 20,
        speed: speed,
      },
      {
        id: `wrong2-${Date.now()}`,
        word: wrongWords[1].nzebi_word,
        isCorrect: false,
        x: shuffledPositions[2],
        y: -WORD_HEIGHT - 40,
        speed: speed,
      },
    ];

    setCurrentWord(correctWord);
    setFallingWords(newFallingWords);
  }, [getValidWords, speed]);

  const startGame = useCallback(() => {
    if (!audioContextRef.current && soundEnabled) {
      audioContextRef.current = createAudioContext();
    }
    setGameState("playing");
    setLives(MAX_LIVES);
    setScore(0);
    setSpeed(INITIAL_SPEED);
    setMissedWords([]);
    usedWordsRef.current.clear();
    getNextQuestion();
  }, [getNextQuestion, soundEnabled]);

  const handleWordClick = useCallback(
    (clickedWord: FallingWord) => {
      if (gameState !== "playing") return;

      if (clickedWord.isCorrect) {
        if (soundEnabled) playCorrectSound(audioContextRef.current);
        setFlashEffect("correct");
        setTimeout(() => setFlashEffect(null), 200);
        setScore((prev) => prev + 1);
        setSpeed((prev) => prev + SPEED_INCREMENT);
        getNextQuestion();
      } else {
        if (soundEnabled) playWrongSound(audioContextRef.current);
        setFlashEffect("wrong");
        setTimeout(() => setFlashEffect(null), 200);
        
        if (currentWord) {
          setMissedWords((prev) => [...prev, { word: currentWord, reason: "wrong_click" }]);
        }
        
        setLives((prev) => {
          const newLives = prev - 1;
          if (newLives <= 0) {
            setGameState("gameover");
          } else {
            getNextQuestion();
          }
          return newLives;
        });
      }
    },
    [gameState, soundEnabled, currentWord, getNextQuestion]
  );

  // Animation loop
  useEffect(() => {
    if (gameState !== "playing") return;

    const animate = () => {
      setFallingWords((prev) => {
        const updated = prev.map((word) => ({
          ...word,
          y: word.y + word.speed * 2,
        }));

        // Check if correct word has exited
        const correctWord = updated.find((w) => w.isCorrect);
        if (correctWord && correctWord.y > GAME_HEIGHT) {
          if (soundEnabled) playWrongSound(audioContextRef.current);
          setFlashEffect("wrong");
          setTimeout(() => setFlashEffect(null), 200);
          
          if (currentWord) {
            setMissedWords((prevMissed) => [...prevMissed, { word: currentWord, reason: "timeout" }]);
          }
          
          setLives((prevLives) => {
            const newLives = prevLives - 1;
            if (newLives <= 0) {
              setGameState("gameover");
            } else {
              setTimeout(() => getNextQuestion(), 100);
            }
            return newLives;
          });
          return [];
        }

        return updated;
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [gameState, soundEnabled, currentWord, getNextQuestion]);

  const toggleSound = () => {
    setSoundEnabled((prev) => !prev);
    if (!audioContextRef.current) {
      audioContextRef.current = createAudioContext();
    }
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
          <h1 className="text-xl font-bold text-primary-foreground">Sprint des Mots</h1>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSound}
              className="text-primary-foreground hover:bg-primary-foreground/20"
            >
              {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </Button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="px-4 py-6 max-w-2xl mx-auto">
        {/* Ready state */}
        {gameState === "ready" && (
          <Card className="shadow-soft animate-fade-in">
            <CardContent className="p-8 text-center space-y-6">
              <div className="w-20 h-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                <Zap className="w-10 h-10 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-2">Sprint des Mots</h2>
                <p className="text-muted-foreground">
                  Une traduction française s'affiche. Cliquez sur le bon mot Nzébi avant qu'il ne disparaisse !
                </p>
              </div>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>🎯 Plus vous répondez juste, plus ça va vite !</p>
                <p>❤️ Vous avez 3 vies</p>
                <p>🔊 Sons activés par défaut</p>
              </div>
              <Button onClick={startGame} size="lg" className="gap-2">
                <Zap className="w-5 h-5" />
                Commencer
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Playing state */}
        {gameState === "playing" && (
          <div className="space-y-4 animate-fade-in">
            {/* Stats bar */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                {Array.from({ length: MAX_LIVES }).map((_, i) => (
                  <Heart
                    key={i}
                    className={`w-6 h-6 transition-all ${
                      i < lives ? "fill-red-500 text-red-500" : "text-muted-foreground"
                    }`}
                  />
                ))}
              </div>
              <div className="text-lg font-bold text-foreground">
                Score: {score}
              </div>
            </div>

            {/* Question */}
            <Card className="shadow-soft">
              <CardContent className="p-4 text-center">
                <p className="text-sm text-muted-foreground mb-1">Trouvez la traduction de :</p>
                <p className="text-2xl font-bold text-primary">{currentWord?.french_word}</p>
              </CardContent>
            </Card>

            {/* Game area */}
            <div
              ref={gameContainerRef}
              className={`relative rounded-lg border-2 overflow-hidden transition-colors ${
                flashEffect === "correct"
                  ? "border-green-500 bg-green-500/10"
                  : flashEffect === "wrong"
                  ? "border-red-500 bg-red-500/10"
                  : "border-border bg-card"
              }`}
              style={{ height: GAME_HEIGHT }}
            >
              {/* Falling words */}
              {fallingWords.map((word) => (
                <button
                  key={word.id}
                  onClick={() => handleWordClick(word)}
                  className="absolute px-4 py-2 rounded-lg font-medium text-sm transition-transform hover:scale-105 cursor-pointer border-2 shadow-md bg-card text-foreground border-primary/30 hover:border-primary hover:bg-primary/5"
                  style={{
                    left: word.x,
                    top: word.y,
                    minWidth: 100,
                    textAlign: "center",
                  }}
                >
                  {word.word}
                </button>
              ))}

              {/* Danger zone indicator */}
              <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-t from-red-500/30 to-transparent" />
            </div>

            {/* Speed indicator */}
            <div className="text-center text-sm text-muted-foreground">
              Vitesse: {speed.toFixed(1)}x
            </div>
          </div>
        )}

        {/* Game over state */}
        {gameState === "gameover" && (
          <div className="space-y-6 animate-fade-in">
            <Card className="shadow-soft">
              <CardContent className="p-8 text-center space-y-4">
                <div className="w-20 h-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                  <Zap className="w-10 h-10 text-primary" />
                </div>
                <h2 className="text-2xl font-bold text-foreground">Partie terminée !</h2>
                <p className="text-4xl font-bold text-primary">{score} points</p>
                <p className="text-muted-foreground">
                  Vitesse finale: {speed.toFixed(1)}x
                </p>
                <Button onClick={startGame} className="gap-2">
                  <RotateCcw className="w-4 h-4" />
                  Rejouer
                </Button>
              </CardContent>
            </Card>

            {/* Missed words review */}
            {missedWords.length > 0 && (
              <Card className="shadow-soft">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4">
                    📚 Mots à réviser ({missedWords.length})
                  </h3>
                  <div className="space-y-4">
                    {missedWords.map((missed, index) => (
                      <div
                        key={`${missed.word.id}-${index}`}
                        className="p-4 rounded-lg border bg-card"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="text-xl font-bold text-foreground">
                              {missed.word.nzebi_word}
                            </p>
                            <p className="text-primary font-medium">
                              {missed.word.french_word}
                            </p>
                          </div>
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${
                              missed.reason === "wrong_click"
                                ? "bg-red-500/10 text-red-500"
                                : "bg-orange-500/10 text-orange-500"
                            }`}
                          >
                            {missed.reason === "wrong_click" ? "Mauvais clic" : "Temps écoulé"}
                          </span>
                        </div>
                        {missed.word.part_of_speech && (
                          <p className="text-xs text-muted-foreground italic mb-2">
                            ({missed.word.part_of_speech})
                          </p>
                        )}
                        {missed.word.example_nzebi && (
                          <div className="mt-2 p-3 rounded bg-muted/50">
                            <p className="text-sm italic text-foreground">
                              "{missed.word.example_nzebi}"
                            </p>
                            <p className="text-sm text-muted-foreground mt-1">
                              → {missed.word.example_french}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default Sprint;
