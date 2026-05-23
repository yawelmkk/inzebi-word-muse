import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const PLANS = {
  monthly: { amount: 4000, label: "Abonnement mensuel inzèbi", days: 30 },
  quarterly: { amount: 11000, label: "Abonnement trimestriel inzèbi", days: 90 },
  yearly: { amount: 45000, label: "Abonnement annuel inzèbi", days: 365 },
} as const;

type PlanId = keyof typeof PLANS;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Non authentifié" }, 401);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnon = Deno.env.get("SUPABASE_PUBLISHABLE_KEY") ?? Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceRole = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const fedapayKey = Deno.env.get("FEDAPAY_SECRET_KEY");
    if (!fedapayKey) return json({ error: "FEDAPAY_SECRET_KEY manquante" }, 500);

    const userClient = createClient(supabaseUrl, supabaseAnon, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData.user) return json({ error: "Utilisateur invalide" }, 401);
    const user = userData.user;

    const body = await req.json().catch(() => ({}));
    const plan = body?.plan as PlanId;
    if (!plan || !(plan in PLANS)) return json({ error: "Plan invalide" }, 400);
    const planCfg = PLANS[plan];

    const admin = createClient(supabaseUrl, serviceRole);

    // Détection environnement FedaPay (clé sk_sandbox_ vs sk_live_)
    const isTest = fedapayKey.startsWith("sk_sandbox_") || fedapayKey.startsWith("sk_test_") || fedapayKey.toLowerCase().includes("sandbox");
    const fedapayBase = isTest ? "https://sandbox-api.fedapay.com" : "https://api.fedapay.com";

    // 1. Créer la transaction FedaPay
    const txResp = await fetch(`${fedapayBase}/v1/transactions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${fedapayKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        description: planCfg.label,
        amount: planCfg.amount,
        currency: { iso: "XAF" },
        callback_url: `${new URL(req.url).origin.replace("/functions/v1", "")}`,
        customer: {
          email: user.email,
          firstname: user.user_metadata?.display_name || user.email?.split("@")[0] || "Client",
          lastname: "inzebi",
        },
        custom_metadata: { user_id: user.id, plan },
      }),
    });

    const txData = await txResp.json();
    if (!txResp.ok) {
      console.error("FedaPay create error", txData);
      return json({ error: "Création FedaPay échouée", details: txData }, 500);
    }

    const transactionId = txData?.["v1/transaction"]?.id ?? txData?.transaction?.id ?? txData?.id;
    const reference = txData?.["v1/transaction"]?.reference ?? txData?.transaction?.reference;
    if (!transactionId) return json({ error: "ID transaction manquant", details: txData }, 500);

    // 2. Générer le token de paiement
    const tokenResp = await fetch(`${fedapayBase}/v1/transactions/${transactionId}/token`, {
      method: "POST",
      headers: { Authorization: `Bearer ${fedapayKey}`, "Content-Type": "application/json" },
    });
    const tokenData = await tokenResp.json();
    if (!tokenResp.ok) {
      console.error("FedaPay token error", tokenData);
      return json({ error: "Token FedaPay échoué", details: tokenData }, 500);
    }
    const paymentUrl = tokenData?.url;

    // 3. Sauvegarder en base
    const { error: insertErr } = await admin.from("subscriptions").insert({
      user_id: user.id,
      plan,
      status: "pending",
      amount: planCfg.amount,
      currency: "XAF",
      fedapay_transaction_id: String(transactionId),
      fedapay_reference: reference ? String(reference) : null,
    });
    if (insertErr) console.error("Insert subscription error", insertErr);

    return json({ payment_url: paymentUrl, transaction_id: transactionId });
  } catch (e) {
    console.error("Unexpected error", e);
    return json({ error: e instanceof Error ? e.message : "Erreur inconnue" }, 500);
  }
});

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
