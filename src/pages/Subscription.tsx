import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Check, Crown, Loader2 } from "lucide-react";

type Plan = { id: "monthly" | "quarterly" | "yearly"; name: string; price: number; period: string; popular?: boolean; savings?: string };

const PLANS: Plan[] = [
  { id: "monthly", name: "Mensuel", price: 4000, period: "1 mois" },
  { id: "quarterly", name: "Trimestriel", price: 11000, period: "3 mois", popular: true, savings: "Économise 1000 FCFA" },
  { id: "yearly", name: "Annuel", price: 45000, period: "12 mois", savings: "Économise 3000 FCFA" },
];

const Subscription = () => {
  const navigate = useNavigate();
  const { user, loading, hasActiveSubscription } = useAuth();
  const { toast } = useToast();
  const [processing, setProcessing] = useState<string | null>(null);

  const handleSubscribe = async (plan: Plan) => {
    if (!user) {
      navigate("/auth");
      return;
    }
    setProcessing(plan.id);
    try {
      const { data, error } = await supabase.functions.invoke("fedapay-create-transaction", {
        body: { plan: plan.id },
      });
      if (error) throw error;
      if (data?.payment_url) {
        window.location.href = data.payment_url;
      } else {
        throw new Error("URL de paiement manquante");
      }
    } catch (e: any) {
      toast({ title: "Erreur", description: e.message || "Impossible de démarrer le paiement", variant: "destructive" });
      setProcessing(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="p-4 max-w-5xl mx-auto">
        <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Retour
        </Button>
      </div>

      <div className="max-w-5xl mx-auto px-4 pb-12 space-y-8">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10">
            <Crown className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold">Choisis ton abonnement</h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Accède aux audios, aux jeux éducatifs, à toutes les activités et à l'intégralité du dictionnaire inzèbi.
          </p>
        </div>

        {hasActiveSubscription && (
          <Card className="p-4 bg-primary/10 border-primary text-center">
            <p className="font-semibold">✓ Tu as déjà un abonnement actif.</p>
          </Card>
        )}

        <div className="grid md:grid-cols-3 gap-4">
          {PLANS.map((plan) => (
            <Card key={plan.id} className={`p-6 relative flex flex-col ${plan.popular ? "border-primary border-2 shadow-lg" : ""}`}>
              {plan.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs px-3 py-1 rounded-full font-semibold">
                  Populaire
                </span>
              )}
              <h3 className="text-xl font-bold">{plan.name}</h3>
              <div className="my-4">
                <span className="text-4xl font-bold">{plan.price.toLocaleString()}</span>
                <span className="text-muted-foreground"> FCFA</span>
                <p className="text-sm text-muted-foreground mt-1">{plan.period}</p>
                {plan.savings && <p className="text-xs text-primary font-medium mt-1">{plan.savings}</p>}
              </div>
              <ul className="space-y-2 text-sm mb-6 flex-1">
                <li className="flex gap-2"><Check className="h-4 w-4 text-primary shrink-0 mt-0.5" /> Tous les audios</li>
                <li className="flex gap-2"><Check className="h-4 w-4 text-primary shrink-0 mt-0.5" /> Tous les jeux éducatifs</li>
                <li className="flex gap-2"><Check className="h-4 w-4 text-primary shrink-0 mt-0.5" /> Toutes les activités</li>
                <li className="flex gap-2"><Check className="h-4 w-4 text-primary shrink-0 mt-0.5" /> Dictionnaire complet</li>
              </ul>
              <Button
                onClick={() => handleSubscribe(plan)}
                disabled={processing !== null || loading}
                className="w-full"
                variant={plan.popular ? "default" : "outline"}
              >
                {processing === plan.id ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Redirection...</> : "S'abonner"}
              </Button>
            </Card>
          ))}
        </div>

        <p className="text-center text-xs text-muted-foreground">
          Paiement sécurisé via FedaPay (Mobile Money, carte bancaire).
        </p>
      </div>
    </div>
  );
};

export default Subscription;
