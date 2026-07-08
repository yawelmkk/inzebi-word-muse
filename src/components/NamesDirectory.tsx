import { useEffect, useMemo, useState } from "react";
import { Pencil, Plus, Search, Trash2, User2, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

type Gender = "M" | "F" | "M/F";
interface NameRow {
  id: string;
  name: string;
  gender: Gender | null;
  meaning: string | null;
  context: string | null;
}

const genderLabel = (g?: string | null) => {
  if (g === "M") return "Masculin";
  if (g === "F") return "Féminin";
  if (g === "M/F") return "Mixte";
  return null;
};

type FormState = {
  name: string;
  gender: "" | Gender;
  meaning: string;
  context: string;
};

const emptyForm: FormState = { name: "", gender: "", meaning: "", context: "" };

export const NamesDirectory = () => {
  const { isAdmin } = useIsAdmin();
  const [query, setQuery] = useState("");
  const [names, setNames] = useState<NameRow[]>([]);
  const [loading, setLoading] = useState(true);

  // Add/Edit dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<NameRow | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);

  // Delete
  const [toDelete, setToDelete] = useState<NameRow | null>(null);

  const fetchNames = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("nzebi_names")
      .select("id, name, gender, meaning, context")
      .order("name");
    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    } else {
      setNames((data ?? []) as NameRow[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchNames();
  }, []);

  const grouped = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = names
      .filter((n) => {
        if (!q) return true;
        if (isAdmin) {
          return (
            n.name.toLowerCase().includes(q) ||
            (n.meaning?.toLowerCase().includes(q) ?? false) ||
            (n.context?.toLowerCase().includes(q) ?? false)
          );
        }
        return n.name.toLowerCase().includes(q);
      })
      .sort((a, b) => a.name.localeCompare(b.name, "fr"));

    const map = new Map<string, NameRow[]>();
    for (const n of filtered) {
      const letter = n.name.charAt(0).toUpperCase();
      if (!map.has(letter)) map.set(letter, []);
      map.get(letter)!.push(n);
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b, "fr"));
  }, [query, names, isAdmin]);

  const total = useMemo(
    () => grouped.reduce((acc, [, list]) => acc + list.length, 0),
    [grouped]
  );

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (n: NameRow) => {
    setEditing(n);
    setForm({
      name: n.name,
      gender: (n.gender ?? "") as "" | Gender,
      meaning: n.meaning ?? "",
      context: n.context ?? "",
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast({ title: "Le nom est requis", variant: "destructive" });
      return;
    }
    setSaving(true);
    const payload = {
      name: form.name.trim(),
      gender: form.gender || null,
      meaning: form.meaning.trim() || null,
      context: form.context.trim() || null,
    };
    const { error } = editing
      ? await supabase.from("nzebi_names").update(payload).eq("id", editing.id)
      : await supabase.from("nzebi_names").insert(payload);
    setSaving(false);
    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: editing ? "Nom modifié" : "Nom ajouté" });
    setDialogOpen(false);
    setEditing(null);
    setForm(emptyForm);
    fetchNames();
  };

  const handleDelete = async () => {
    if (!toDelete) return;
    const { error } = await supabase.from("nzebi_names").delete().eq("id", toDelete.id);
    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: `« ${toDelete.name} » supprimé` });
    setToDelete(null);
    fetchNames();
  };

  return (
    <div className="space-y-4">
      {/* Search + admin add */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={isAdmin ? "Rechercher un nom, une signification…" : "Rechercher un nom…"}
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

        {isAdmin && (
          <Dialog
            open={dialogOpen}
            onOpenChange={(o) => {
              setDialogOpen(o);
              if (!o) {
                setEditing(null);
                setForm(emptyForm);
              }
            }}
          >
            <DialogTrigger asChild>
              <Button className="h-11 rounded-xl gap-1" onClick={openAdd}>
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Ajouter</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editing ? "Modifier le nom" : "Ajouter un nom"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="name">Nom *</Label>
                  <Input
                    id="name"
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    placeholder="Ex: Mavoungou"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Genre</Label>
                  <Select
                    value={form.gender}
                    onValueChange={(v) => setForm((f) => ({ ...f, gender: v as Gender }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choisir (optionnel)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="M">Masculin</SelectItem>
                      <SelectItem value="F">Féminin</SelectItem>
                      <SelectItem value="M/F">Mixte</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="meaning">Signification</Label>
                  <Input
                    id="meaning"
                    value={form.meaning}
                    onChange={(e) => setForm((f) => ({ ...f, meaning: e.target.value }))}
                    placeholder="Ex: Le souffle, la vie"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="context">Contexte culturel</Label>
                  <Textarea
                    id="context"
                    value={form.context}
                    onChange={(e) => setForm((f) => ({ ...f, context: e.target.value }))}
                    placeholder="Origine, usage, anecdote…"
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setDialogOpen(false)}>Annuler</Button>
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? "Enregistrement…" : editing ? "Enregistrer" : "Ajouter"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
        <span>
          {loading ? "Chargement…" : `${total} nom${total > 1 ? "s" : ""} trouvé${total > 1 ? "s" : ""}`}
        </span>
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
      {!loading && total === 0 ? (
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
                      key={n.id}
                      className={cn(
                        "rounded-xl border bg-card p-3 transition-colors group",
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
                            {isAdmin && gLabel && (
                              <Badge variant="secondary" className="text-[10px] py-0 h-4">
                                {gLabel}
                              </Badge>
                            )}
                          </div>
                          {isAdmin && (
                            <>
                              {n.meaning ? (
                                <p className="text-sm text-foreground/80 mt-0.5">{n.meaning}</p>
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
                            </>
                          )}
                        </div>
                        {isAdmin && (
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-muted-foreground hover:text-primary"
                              onClick={() => openEdit(n)}
                              aria-label={`Modifier ${n.name}`}
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-muted-foreground hover:text-destructive"
                              onClick={() => setToDelete(n)}
                              aria-label={`Supprimer ${n.name}`}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      )}

      <AlertDialog open={!!toDelete} onOpenChange={(o) => !o && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer ce nom ?</AlertDialogTitle>
            <AlertDialogDescription>
              « {toDelete?.name} » sera définitivement supprimé du répertoire.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Supprimer</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
