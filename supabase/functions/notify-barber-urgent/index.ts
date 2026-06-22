// Avisa o barbeiro via WhatsApp quando um agendamento é criado em cima da hora (<1h).
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { sendWhatsapp } from "../_shared/zapi.ts";

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
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
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
      .select("whatsapp")
      .eq("id", ag.barbeiro_id as string)
      .maybeSingle();
    if (!b?.whatsapp) return json({ ok: true, skipped: true, reason: "no_barber_whatsapp" });

    const horario = dataHora.toLocaleTimeString("pt-BR", {
      hour: "2-digit", minute: "2-digit", timeZone: "America/Sao_Paulo",
    });
    const servicoNome = (ag as { servicos?: { nome?: string } | null }).servicos?.nome ?? "serviço";
    const message = `⚡ Agendamento em cima da hora! ${ag.cliente_nome} (WhatsApp: ${ag.cliente_whatsapp}) marcou ${servicoNome} hoje às ${horario}. Se prepara!`;
    const r = await sendWhatsapp(String(b.whatsapp), message);
    return json({ ok: true, sent: r.ok });
  } catch (e) {
    console.error("notify-barber-urgent error", e);
    return json({ ok: false, error: String(e) });
  }
});

function json(body: unknown) {
  return new Response(JSON.stringify(body), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
