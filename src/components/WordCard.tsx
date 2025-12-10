import { Heart } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface WordCardProps {
  word: string;
  translation: string;
  partOfSpeech?: string;
  onClick?: () => void;
}

export const WordCard = ({ word, translation, partOfSpeech, onClick }: WordCardProps) => {
  const [isFavorite, setIsFavorite] = useState(false);

  return (
    <Card 
      className="p-4 shadow-soft hover:scale-[1.02] transition-all duration-300 cursor-pointer border-2 animate-fade-in"
      onClick={onClick}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h3 className="text-2xl font-bold text-foreground mb-1">{word}</h3>
          {partOfSpeech && (
            <span className="text-xs bg-secondary px-2 py-1 rounded-full text-secondary-foreground">
              {partOfSpeech}
            </span>
          )}
          <p className="text-muted-foreground mt-2">{translation}</p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            setIsFavorite(!isFavorite);
          }}
          className="hover:scale-110 transition-transform"
        >
          <Heart className={isFavorite ? "fill-primary text-primary" : "text-muted-foreground"} />
        </Button>
      </div>
    </Card>
  );
};
