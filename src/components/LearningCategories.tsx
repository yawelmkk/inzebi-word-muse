import { useState } from "react";
import {
  BookOpen,
  Hash,
  HandHeart,
  Users,
  Sun,
  HeartPulse,
  Leaf,
  ChevronRight,
  LucideIcon,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Lesson {
  title: string;
}

interface Category {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  accent: string; // tailwind classes for icon bg
  lessons: Lesson[];
}

const CATEGORIES: Category[] = [
  {
    id: "fondations",
    title: "Les Fondations",
    description: "Les bases pour bien démarrer en Inzèbi",
    icon: BookOpen,
    accent: "bg-primary/10 text-primary",
    lessons: [
      { title: "L'Alphabet et les Sons" },
      { title: "Lire et Écrire le Inzèbi" },
      { title: "Les Tons et la Prononciation" },
    ],
  },
  {
    id: "nombres",
    title: "Les Nombres",
    description: "Compter et exprimer les quantités",
    icon: Hash,
    accent: "bg-accent/10 text-accent",
    lessons: [
      { title: "Compter de 1 à 10" },
      { title: "Les Dizaines et les Grands Nombres" },
      { title: "Exprimer les Quantités" },
    ],
  },
  {
    id: "salutations",
    title: "Les Salutations",
    description: "Engager une conversation poliment",
    icon: HandHeart,
    accent: "bg-primary/10 text-primary",
    lessons: [
      { title: "Dire Bonjour et Au Revoir" },
      { title: "Demander des Nouvelles" },
      { title: "Remercier et Formules de Politesse" },
    ],
  },
  {
    id: "famille",
    title: "La Famille",
    description: "Le vocabulaire des liens familiaux",
    icon: Users,
    accent: "bg-accent/10 text-accent",
    lessons: [
      { title: "Les Parents et la Fratrie" },
      { title: "Les Grands-Parents et les Ancêtres" },
      { title: "Les Liens de Parenté Élargis" },
    ],
  },
  {
    id: "quotidien",
    title: "La Vie Quotidienne",
    description: "Les mots et phrases du quotidien",
    icon: Sun,
    accent: "bg-primary/10 text-primary",
    lessons: [
      { title: "Les Moments de la Journée" },
      { title: "Les Jours et le Temps qui passe" },
      { title: "Les Phrases de Survie" },
    ],
  },
  {
    id: "corps-sante",
    title: "Le Corps et la Santé",
    description: "Parler de son corps et de sa santé",
    icon: HeartPulse,
    accent: "bg-accent/10 text-accent",
    lessons: [
      { title: "Les Parties du Corps" },
      { title: "Exprimer la Douleur et la Maladie" },
    ],
  },
  {
    id: "nature-nourriture",
    title: "Nature et Nourriture",
    description: "Animaux, plantes et plats traditionnels",
    icon: Leaf,
    accent: "bg-primary/10 text-primary",
    lessons: [
      { title: "Les Animaux" },
      { title: "Les Fruits, Légumes et Plats Traditionnels" },
    ],
  },
];

export const LearningCategories = () => {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {CATEGORIES.map((cat) => {
        const Icon = cat.icon;
        const isOpen = openId === cat.id;
        return (
          <div
            key={cat.id}
            className={cn(
              "rounded-2xl border bg-card text-card-foreground shadow-soft overflow-hidden transition-all duration-300",
              isOpen ? "border-primary/40 shadow-md" : "hover:border-primary/30 hover:shadow-md"
            )}
          >
            <button
              type="button"
              onClick={() => setOpenId(isOpen ? null : cat.id)}
              aria-expanded={isOpen}
              className="w-full text-left p-5 flex items-center gap-4"
            >
              <div
                className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0",
                  cat.accent
                )}
              >
                <Icon className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-base text-foreground truncate">
                  {cat.title}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                  {cat.description}
                </p>
                <p className="text-[11px] font-medium text-primary mt-1">
                  {cat.lessons.length} leçon{cat.lessons.length > 1 ? "s" : ""}
                </p>
              </div>
              <ChevronRight
                className={cn(
                  "w-5 h-5 text-muted-foreground transition-transform duration-300 flex-shrink-0",
                  isOpen && "rotate-90 text-primary"
                )}
              />
            </button>

            <div
              className={cn(
                "grid transition-all duration-300 ease-out",
                isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
              )}
            >
              <div className="overflow-hidden">
                <div className="px-5 pb-5 pt-1 border-t border-border/60">
                  <ul className="space-y-2 mt-3">
                    {cat.lessons.map((lesson, i) => (
                      <li
                        key={lesson.title}
                        className="group flex items-center gap-3 rounded-lg border border-border/60 bg-muted/40 px-3 py-2.5 hover:bg-muted hover:border-primary/40 transition-colors cursor-pointer"
                      >
                        <span
                          className={cn(
                            "w-7 h-7 rounded-md flex items-center justify-center text-xs font-semibold flex-shrink-0",
                            cat.accent
                          )}
                        >
                          {i + 1}
                        </span>
                        <span className="text-sm text-foreground flex-1">
                          {lesson.title}
                        </span>
                        <Sparkles className="w-4 h-4 text-muted-foreground/50 group-hover:text-primary transition-colors" />
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
