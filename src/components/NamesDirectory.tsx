import { useMemo, useState } from "react";
import { Search, User2, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { nzebiNames, type NzebiName } from "@/data/nzebiNames";
import { cn } from "@/lib/utils";

const genderLabel = (g?: NzebiName["gender"]) => {
  if (g === "M") return "Masculin";
  if (g === "F") return "Féminin";
  if (g === "M/F") return "Mixte";
  return null;
};

export const NamesDirectory = () => {
  const [query, setQuery] = useState("");

  const grouped = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = nzebiNames
      .filter((n) => {
        if (!q) return true;
        return (
          n.name.toLowerCase().includes(q) ||
          (n.meaning?.toLowerCase().includes(q) ?? false) ||
          (n.context?.toLowerCase().includes(q) ?? false)
        );
      })
      .sort((a, b) => a.name.localeCompare(b.name, "fr"));

    const map = new Map<string, NzebiName[]>();
    for (const n of filtered) {
      const letter = n.name.charAt(0).toUpperCase();
      if (!map.has(letter)) map.set(letter, []);
      map.get(letter)!.push(n);
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b, "fr"));
  }, [query]);

  const total = useMemo(
    () => grouped.reduce((acc, [, list]) => acc + list.length, 0),
    [grouped]
  );

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher un nom, une signification…"
          className="pl-9 pr-9 h-11 rounded-xl"
        />
        {query && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setQuery("")}
            className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
            aria-label="Effacer la recherche"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
        <span>
          {total} nom{total > 1 ? "s" : ""} trouvé{total > 1 ? "s" : ""}
        </span>
        <span className="hidden sm:inline">Cliquez pour voir le contexte</span>
      </div>

      {/* Alphabet quick nav */}
      {grouped.length > 1 && (
        <div className="flex flex-wrap gap-1.5 px-1">
          {grouped.map(([letter]) => (
            <a
              key={letter}
              href={`#letter-${letter}`}
              className="w-7 h-7 rounded-md bg-muted hover:bg-primary hover:text-primary-foreground text-xs font-semibold flex items-center justify-center transition-colors"
            >
              {letter}
            </a>
          ))}
        </div>
      )}

      {/* List */}
      {total === 0 ? (
        <div className="text-center py-12 text-muted-foreground text-sm">
          Aucun nom ne correspond à votre recherche.
        </div>
      ) : (
        <div className="space-y-5">
          {grouped.map(([letter, list]) => (
            <section key={letter} id={`letter-${letter}`} className="scroll-mt-20">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary font-bold flex items-center justify-center">
                  {letter}
                </div>
                <div className="h-px flex-1 bg-border" />
              </div>
              <ul className="grid gap-2 sm:grid-cols-2">
                {list.map((n) => {
                  const gLabel = genderLabel(n.gender);
                  return (
                    <li
                      key={n.name}
                      className={cn(
                        "rounded-xl border bg-card p-3 transition-colors",
                        "hover:border-primary/40 hover:shadow-sm"
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-lg bg-accent/10 text-accent flex items-center justify-center flex-shrink-0">
                          <User2 className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-semibold text-foreground">{n.name}</h4>
                            {gLabel && (
                              <Badge variant="secondary" className="text-[10px] py-0 h-4">
                                {gLabel}
                              </Badge>
                            )}
                          </div>
                          {n.meaning ? (
                            <p className="text-sm text-foreground/80 mt-0.5">
                              {n.meaning}
                            </p>
                          ) : (
                            <p className="text-xs text-muted-foreground italic mt-0.5">
                              Signification à compléter
                            </p>
                          )}
                          {n.context && (
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                              {n.context}
                            </p>
                          )}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
};
