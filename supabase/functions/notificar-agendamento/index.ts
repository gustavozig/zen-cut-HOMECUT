// Edge function pública: avisa barbeiro via Z-API quando o agendamento é em cima da hora (<1h).
// Falhas são silenciosas — nunca quebra o fluxo de agendamento.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { agendamento_id } = await req.json();
    if (!agendamento_id) return json({ ok: false, reason: "missing_id" });

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: ag } = await supabase
      .from("agendamentos")
      .select("id, data_hora, cliente_nome, cliente_whatsapp, barbeiro_id, servicos(nome)")
      .eq("id", agendamento_id)
      .maybeSingle();
    if (!ag) return json({ ok: false, reason: "not_found" });

    const dataHora = new Date(ag.data_hora as string);
    const diffMin = (dataHora.getTime() - Date.now()) / 60000;
    if (diffMin >= 60 || diffMin < 0) return json({ ok: true, skipped: true });

    const { data: b } = await supabase
      .from("barbeiros")
      .select("whatsapp, zapi_instance_id, zapi_token, zapi_client_token")
      .eq("id", ag.barbeiro_id as string)
      .maybeSingle();

    if (!b?.zapi_instance_id || !b?.zapi_token || !b?.whatsapp) {
      return json({ ok: true, skipped: true, reason: "zapi_not_configured" });
    }

    const horario = dataHora.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", timeZone: "America/Sao_Paulo" });
    const servicoNome = (ag as { servicos?: { nome?: string } | null }).servicos?.nome ?? "serviço";
    const phone = String(b.whatsapp).replace(/\D/g, "");
    const phoneFull = phone.startsWith("55") ? phone : `55${phone}`;
    const message = `⚡ Agendamento em cima da hora! ${ag.cliente_nome} (WhatsApp: ${ag.cliente_whatsapp}) marcou ${servicoNome} hoje às ${horario}`;

    const url = `https://api.z-api.io/instances/${b.zapi_instance_id}/token/${b.zapi_token}/send-text`;
    try {
      const r = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(b.zapi_client_token ? { "Client-Token": b.zapi_client_token } : {}),
        },
        body: JSON.stringify({ phone: phoneFull, message }),
      });
      const body = await r.text();
      if (!r.ok) console.error("zapi_error", r.status, body);
      return json({ ok: true, sent: r.ok });
    } catch (e) {
      console.error("zapi_fetch_error", e);
      return json({ ok: true, sent: false });
    }
  } catch (e) {
    console.error("notificar-agendamento error", e);
    return json({ ok: false, error: String(e) });
  }
});

function json(body: unknown) {
  return new Response(JSON.stringify(body), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
