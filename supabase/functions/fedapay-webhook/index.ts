import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-fedapay-signature",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const PLAN_DAYS: Record<string, number> = { monthly: 30, quarterly: 90, yearly: 365 };

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-fedapay-signature") ?? "";
    const webhookSecret = Deno.env.get("FEDAPAY_WEBHOOK_SECRET");

    // Vérification de signature HMAC-SHA256 si secret défini
    if (webhookSecret) {
      const valid = await verifySignature(rawBody, signature, webhookSecret);
      if (!valid) {
        console.warn("Invalid webhook signature");
        return new Response("Invalid signature", { status: 401, headers: corsHeaders });
      }
    }

    const event = JSON.parse(rawBody);
    const eventName: string = event?.name ?? event?.event ?? "";
    const tx = event?.entity ?? event?.data ?? event?.transaction ?? {};
    const transactionId = String(tx?.id ?? "");
    const status = tx?.status as string;
    const metadata = tx?.custom_metadata ?? {};
    const plan = metadata?.plan as string | undefined;
    const userId = metadata?.user_id as string | undefined;

    console.log("FedaPay webhook", { eventName, transactionId, status, userId, plan });

    if (!transactionId) return new Response("ok", { headers: corsHeaders });

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const isApproved = status === "approved" || eventName === "transaction.approved";
    const isFailed = ["declined", "canceled", "failed"].includes(status) ||
      ["transaction.declined", "transaction.canceled"].includes(eventName);

    if (isApproved) {
      const days = PLAN_DAYS[plan ?? ""] ?? 30;
      const now = new Date();
      const expires = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

      const { error } = await admin
        .from("subscriptions")
        .update({
          status: "active",
          starts_at: now.toISOString(),
          expires_at: expires.toISOString(),
        })
        .eq("fedapay_transaction_id", transactionId);
      if (error) console.error("Update active error", error);
    } else if (isFailed) {
      await admin
        .from("subscriptions")
        .update({ status: "failed" })
        .eq("fedapay_transaction_id", transactionId);
    }

    return new Response("ok", { headers: corsHeaders });
  } catch (e) {
    console.error("Webhook error", e);
    return new Response("error", { status: 500, headers: corsHeaders });
  }
});

async function verifySignature(payload: string, signature: string, secret: string): Promise<boolean> {
  if (!signature) return false;
  try {
    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"],
    );
    const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
    const hex = Array.from(new Uint8Array(sig)).map((b) => b.toString(16).padStart(2, "0")).join("");
    // FedaPay envoie parfois "t=...,s=..." — extraire s=
    const provided = signature.includes("s=") ? signature.split("s=")[1]?.split(",")[0] : signature;
    return provided?.toLowerCase() === hex.toLowerCase();
  } catch {
    return false;
  }
}
