import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

const CATEGORIES = [
  { value: "", label: "Tous" },
  { value: "verbe", label: "Verbe" },
  { value: "pronom personnel", label: "Pronom Personnel" },
  { value: "pronom", label: "Pronom" },
  { value: "adjectif", label: "Adjectif" },
  { value: "adverbe", label: "Adverbe" },
  { value: "assertion", label: "Assertion" },
  { value: "conjonction", label: "Conjonction" },
  { value: "article", label: "Article" },
  { value: "déterminant", label: "Déterminant" },
  { value: "interjection", label: "Interjection" },
  { value: "locution prépositive", label: "Locution Prépositive" },
  { value: "négation", label: "Négation" },
  { value: "nom propre", label: "Nom Propre" },
  { value: "nom commun", label: "Nom Commun" },
  { value: "préposition", label: "Préposition" },
];

interface CategoryFilterProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

export const CategoryFilter = ({ selectedCategory, onCategoryChange }: CategoryFilterProps) => {
  return (
    <ScrollArea className="w-full whitespace-nowrap">
      <div className="flex gap-2 pb-3">
        {CATEGORIES.map((category) => (
          <button
            key={category.value}
            onClick={() => onCategoryChange(category.value)}
            className={cn(
              "inline-flex items-center px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 shrink-0",
              "border-2 hover:scale-105",
              selectedCategory === category.value
                ? "bg-primary text-primary-foreground border-primary shadow-md"
                : "bg-card text-foreground border-border hover:border-primary/50 hover:bg-muted"
            )}
          >
            {category.label}
          </button>
        ))}
      </div>
      <ScrollBar orientation="horizontal" className="h-2" />
    </ScrollArea>
  );
};
