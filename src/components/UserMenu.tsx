import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { User, LogOut, Crown, LogIn } from "lucide-react";

export const UserMenu = () => {
  const navigate = useNavigate();
  const { user, hasActiveSubscription, signOut } = useAuth();

  if (!user) {
    return (
      <Button variant="ghost" size="sm" onClick={() => navigate("/auth")} className="text-primary-foreground hover:bg-white/20">
        <LogIn className="h-4 w-4 mr-1" /> Connexion
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-white/20 relative">
          <User className="h-5 w-5" />
          {hasActiveSubscription && (
            <span className="absolute -top-1 -right-1 bg-yellow-400 rounded-full p-0.5">
              <Crown className="h-3 w-3 text-yellow-900" />
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="px-2 py-1.5 text-sm">
          <p className="font-medium truncate">{user.email}</p>
          <p className="text-xs text-muted-foreground">
            {hasActiveSubscription ? "✓ Abonnement actif" : "Aucun abonnement"}
          </p>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => navigate("/subscription")}>
          <Crown className="h-4 w-4 mr-2" /> {hasActiveSubscription ? "Mon abonnement" : "S'abonner"}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={signOut}>
          <LogOut className="h-4 w-4 mr-2" /> Déconnexion
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
