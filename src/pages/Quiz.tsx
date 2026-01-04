import { useState, useEffect, useMemo, useCallback } from "react";
import { mockWords, Word } from "@/data/mockWords";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, RotateCcw, Trophy, CheckCircle2, XCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { ThemeToggle } from "@/components/ThemeToggle";
import { cn } from "@/lib/utils";

const TOTAL_QUESTIONS = 10;
const OPTIONS_COUNT = 4;

interface QuizQuestion {
  word: Word;
  options: string[];
  correctAnswer: string;
}

const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const generateQuestions = (): QuizQuestion[] => {
  const availableWords = mockWords.filter(w => w.french_word && w.nzebi_word);
  const shuffledWords = shuffleArray(availableWords);
  const selectedWords = shuffledWords.slice(0, TOTAL_QUESTIONS);
  
  return selectedWords.map(word => {
    const correctAnswer = word.french_word;
    
    // Get wrong answers from other words
    const otherWords = availableWords.filter(w => w.id !== word.id && w.french_word !== correctAnswer);
    const shuffledOthers = shuffleArray(otherWords);
    const wrongAnswers = shuffledOthers.slice(0, OPTIONS_COUNT - 1).map(w => w.french_word);
    
    // Combine and shuffle options
    const options = shuffleArray([correctAnswer, ...wrongAnswers]);
    
    return {
      word,
      options,
      correctAnswer
    };
  });
};

type GameState = "playing" | "answered" | "finished";

const Quiz = () => {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [gameState, setGameState] = useState<GameState>("playing");

  useEffect(() => {
    setQuestions(generateQuestions());
  }, []);

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex) / TOTAL_QUESTIONS) * 100;
  const isCorrect = selectedAnswer === currentQuestion?.correctAnswer;

  const handleAnswer = useCallback((answer: string) => {
    if (gameState !== "playing") return;
    
    setSelectedAnswer(answer);
    setGameState("answered");
    
    if (answer === currentQuestion.correctAnswer) {
      setScore(prev => prev + 1);
    }
  }, [gameState, currentQuestion]);

  const handleNext = useCallback(() => {
    if (currentIndex + 1 >= TOTAL_QUESTIONS) {
      setGameState("finished");
    } else {
      setCurrentIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setGameState("playing");
    }
  }, [currentIndex]);

  const handleRestart = useCallback(() => {
    setQuestions(generateQuestions());
    setCurrentIndex(0);
    setScore(0);
    setSelectedAnswer(null);
    setGameState("playing");
  }, []);

  const getOptionStyle = (option: string) => {
    if (gameState !== "answered") {
      return "border-border hover:border-primary hover:bg-primary/5";
    }
    
    if (option === currentQuestion.correctAnswer) {
      return "border-green-500 bg-green-500/10 text-green-700 dark:text-green-400";
    }
    
    if (option === selectedAnswer && !isCorrect) {
      return "border-red-500 bg-red-500/10 text-red-700 dark:text-red-400";
    }
    
    return "border-border opacity-50";
  };

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Chargement...</div>
      </div>
    );
  }

  if (gameState === "finished") {
    const percentage = Math.round((score / TOTAL_QUESTIONS) * 100);
    const getMessage = () => {
      if (percentage === 100) return "Parfait ! Vous êtes un expert !";
      if (percentage >= 80) return "Excellent travail !";
      if (percentage >= 60) return "Bien joué !";
      if (percentage >= 40) return "Continuez à pratiquer !";
      return "Ne vous découragez pas, réessayez !";
    };

    return (
      <div className="min-h-screen bg-background">
        <header className="gradient-warm py-6 px-4">
          <div className="max-w-2xl mx-auto flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 text-primary-foreground hover:opacity-80 transition-opacity">
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm font-medium">Retour</span>
            </Link>
            <h1 className="text-xl font-bold text-primary-foreground">Quiz Nzébi</h1>
            <ThemeToggle />
          </div>
        </header>

        <main className="px-4 py-8">
          <Card className="max-w-2xl mx-auto shadow-soft">
            <CardContent className="p-8 text-center space-y-6">
              <div className="w-20 h-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                <Trophy className="w-10 h-10 text-primary" />
              </div>
              
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-2">Quiz terminé !</h2>
                <p className="text-muted-foreground">{getMessage()}</p>
              </div>

              <div className="py-4">
                <div className="text-5xl font-bold text-primary mb-2">
                  {score}/{TOTAL_QUESTIONS}
                </div>
                <div className="text-sm text-muted-foreground">
                  {percentage}% de bonnes réponses
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button onClick={handleRestart} className="gap-2">
                  <RotateCcw className="w-4 h-4" />
                  Rejouer
                </Button>
                <Button variant="outline" asChild>
                  <Link to="/">Retour au dictionnaire</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
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
          <h1 className="text-xl font-bold text-primary-foreground">Quiz Nzébi</h1>
          <ThemeToggle />
        </div>
      </header>

      <main className="px-4 py-6">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Progress & Score */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                Question {currentIndex + 1}/{TOTAL_QUESTIONS}
              </span>
              <span className="font-medium text-primary">
                Score: {score}
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Question Card */}
          <Card className="shadow-soft">
            <CardHeader className="text-center pb-2">
              <p className="text-sm text-muted-foreground mb-2">
                Quelle est la traduction de :
              </p>
              <CardTitle className="text-3xl font-bold text-primary">
                {currentQuestion.word.nzebi_word}
              </CardTitle>
              {currentQuestion.word.part_of_speech && (
                <p className="text-xs text-muted-foreground italic mt-1">
                  ({currentQuestion.word.part_of_speech})
                </p>
              )}
            </CardHeader>

            <CardContent className="space-y-3 pt-4">
              {currentQuestion.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswer(option)}
                  disabled={gameState === "answered"}
                  className={cn(
                    "w-full p-4 rounded-lg border-2 text-left transition-all duration-200",
                    "flex items-center justify-between",
                    "disabled:cursor-default",
                    getOptionStyle(option)
                  )}
                >
                  <span className="font-medium">{option}</span>
                  {gameState === "answered" && option === currentQuestion.correctAnswer && (
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  )}
                  {gameState === "answered" && option === selectedAnswer && !isCorrect && option !== currentQuestion.correctAnswer && (
                    <XCircle className="w-5 h-5 text-red-500" />
                  )}
                </button>
              ))}
            </CardContent>
          </Card>

          {/* Next Button */}
          {gameState === "answered" && (
            <div className="flex justify-center animate-fade-in">
              <Button onClick={handleNext} size="lg" className="px-8">
                {currentIndex + 1 >= TOTAL_QUESTIONS ? "Voir les résultats" : "Question suivante"}
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Quiz;
