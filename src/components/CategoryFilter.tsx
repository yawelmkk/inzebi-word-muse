import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

const CATEGORIES = [
  { value: "", label: "Tous" },
  { value: "verbe", label: "Verbe" },
  { value: "nom commun", label: "Nom Commun" },
  { value: "nom propre", label: "Nom Propre" },
  { value: "adjectif", label: "Adjectif" },
  { value: "adverbe", label: "Adverbe" },
  { value: "pronom personnel", label: "Pronom Personnel" },
  { value: "pronom", label: "Pronom" },
  { value: "interjection", label: "Interjection" },
  { value: "préposition", label: "Préposition" },
  { value: "conjonction", label: "Conjonction" },
  { value: "article", label: "Article" },
  { value: "déterminant", label: "Déterminant" },
  { value: "assertion", label: "Assertion" },
  { value: "négation", label: "Négation" },
  { value: "locution", label: "Locution" },
];

interface CategoryFilterProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

export const CategoryFilter = ({ selectedCategory, onCategoryChange }: CategoryFilterProps) => {
  const handleSelect = (value: string) => {
    // Toggle: si on reclique la même catégorie, on revient à "Tous"
    const next = selectedCategory === value ? "" : value;
    console.log("[CategoryFilter] select", { value, next });
    onCategoryChange(next);
  };

  return (
    <ScrollArea className="w-full whitespace-nowrap">
      <div className="flex gap-2 pb-3">
        {CATEGORIES.map((category) => (
          <button
            key={category.value}
            type="button"
            onClick={() => handleSelect(category.value)}
            aria-pressed={selectedCategory === category.value}
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
