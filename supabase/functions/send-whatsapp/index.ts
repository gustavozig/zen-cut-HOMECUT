// Envia mensagem WhatsApp via Z-API (credenciais centrais nos secrets).
// Falhas nunca quebram o sistema — sempre retorna 200 com {ok:false} em caso de erro.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

export async function sendWhatsapp(phone: string, message: string) {
  const instance = Deno.env.get("ZAPI_INSTANCE_ID");
  const token = Deno.env.get("ZAPI_TOKEN");
  const clientToken = Deno.env.get("ZAPI_CLIENT_TOKEN");
  if (!instance || !token) {
    return { ok: false, reason: "zapi_not_configured" as const };
  }
  const digits = String(phone || "").replace(/\D/g, "");
  if (!digits) return { ok: false, reason: "invalid_phone" as const };
  const phoneFull = digits.startsWith("55") ? digits : `55${digits}`;
  const url = `https://api.z-api.io/instances/${instance}/token/${token}/send-text`;
  try {
    const r = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(clientToken ? { "Client-Token": clientToken } : {}),
      },
      body: JSON.stringify({ phone: phoneFull, message }),
    });
    const body = await r.text();
    if (!r.ok) {
      console.error("zapi_error", r.status, body);
      return { ok: false, status: r.status, body };
    }
    return { ok: true };
  } catch (e) {
    console.error("zapi_fetch_error", e);
    return { ok: false, error: String(e) };
  }
}

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
