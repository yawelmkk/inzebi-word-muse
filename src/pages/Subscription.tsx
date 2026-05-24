import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Crown } from "lucide-react";

const Subscription = () => {
  const navigate = useNavigate();
  const { hasActiveSubscription } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <div className="p-4 max-w-3xl mx-auto">
        <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Retour
        </Button>
      </div>

      <div className="max-w-3xl mx-auto px-4 pb-12 space-y-8">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10">
            <Crown className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold">Abonnements</h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Le système de paiement est temporairement indisponible. Reviens bientôt !
          </p>
        </div>

        {hasActiveSubscription && (
          <Card className="p-4 bg-primary/10 border-primary text-center">
            <p className="font-semibold">✓ Tu as déjà un abonnement actif.</p>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Subscription;
