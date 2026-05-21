import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  loading: boolean;
  hasActiveSubscription: boolean;
  subscriptionLoading: boolean;
  refreshSubscription: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);
  const [subscriptionLoading, setSubscriptionLoading] = useState(false);

  const fetchSubscription = async (uid: string | undefined) => {
    if (!uid) {
      setHasActiveSubscription(false);
      return;
    }
    setSubscriptionLoading(true);
    try {
      const { data, error } = await supabase
        .from("subscriptions")
        .select("id, expires_at")
        .eq("user_id", uid)
        .eq("status", "active")
        .gt("expires_at", new Date().toISOString())
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      setHasActiveSubscription(!!data);
    } catch (e) {
      console.error("Subscription check failed", e);
      setHasActiveSubscription(false);
    } finally {
      setSubscriptionLoading(false);
    }
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, sess) => {
      setSession(sess);
      setUser(sess?.user ?? null);
      setTimeout(() => fetchSubscription(sess?.user?.id), 0);
    });

    supabase.auth.getSession().then(({ data: { session: sess } }) => {
      setSession(sess);
      setUser(sess?.user ?? null);
      setLoading(false);
      fetchSubscription(sess?.user?.id);
    });

    return () => subscription.unsubscribe();
  }, []);

  const refreshSubscription = async () => fetchSubscription(user?.id);
  const signOut = async () => {
    await supabase.auth.signOut();
    setHasActiveSubscription(false);
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, hasActiveSubscription, subscriptionLoading, refreshSubscription, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
