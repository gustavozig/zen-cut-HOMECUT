// Envia mensagem WhatsApp via Z-API (credenciais centrais nos secrets).
import { sendWhatsapp } from "../_shared/zapi.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { phone, message } = await req.json();
    if (!phone || !message) return json({ ok: false, reason: "missing_params" });
    const result = await sendWhatsapp(phone, message);
    return json(result);
  } catch (e) {
    console.error("send-whatsapp error", e);
    return json({ ok: false, error: String(e) });
  }
});

function json(body: unknown) {
  return new Response(JSON.stringify(body), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
