// Helper compartilhado para envio via Z-API.
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
      return { ok: false as const, status: r.status, body };
    }
    return { ok: true as const };
  } catch (e) {
    console.error("zapi_fetch_error", e);
    return { ok: false as const, error: String(e) };
  }
}
