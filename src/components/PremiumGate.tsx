import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Crown, Lock } from "lucide-react";

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

export const PremiumGate = ({ children, fallbackTitle = "Contenu premium" }: Props) => {
  const { user, loading, hasActiveSubscription, subscriptionLoading } = useAuth();
  const navigate = useNavigate();

  if (loading || subscriptionLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-10 w-10 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
      </div>
    );
  }

  if (user && hasActiveSubscription) return <>{children}</>;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-8 text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mx-auto">
          {user ? <Crown className="h-8 w-8 text-primary" /> : <Lock className="h-8 w-8 text-primary" />}
        </div>
        <h2 className="text-2xl font-bold">{fallbackTitle}</h2>
        <p className="text-muted-foreground">
          {user
            ? "Abonne-toi pour débloquer les audios, jeux, activités et le dictionnaire complet."
            : "Connecte-toi puis abonne-toi pour accéder à ce contenu."}
        </p>
        <div className="space-y-2">
          {user ? (
            <Button className="w-full" onClick={() => navigate("/subscription")}>
              <Crown className="h-4 w-4 mr-2" /> Voir les abonnements
            </Button>
          ) : (
            <Button className="w-full" onClick={() => navigate("/auth")}>Se connecter</Button>
          )}
          <Button variant="ghost" className="w-full" onClick={() => navigate("/")}>Retour à l'accueil</Button>
        </div>
      </Card>
    </div>
  );
};
