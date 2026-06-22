// Roda a cada 15min via pg_cron. Envia lembretes ~2h antes do corte.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { sendWhatsapp } from "../send-whatsapp/index.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const now = Date.now();
    const from = new Date(now + 1 * 60 * 60 * 1000 + 55 * 60 * 1000).toISOString();
    const to = new Date(now + 2 * 60 * 60 * 1000 + 15 * 60 * 1000).toISOString();

    const { data: ags, error } = await supabase
      .from("agendamentos")
      .select("id, data_hora, cliente_nome, cliente_whatsapp, barbeiro_id")
      .eq("status", "confirmado")
      .eq("lembrete_enviado", false)
      .gte("data_hora", from)
      .lte("data_hora", to);
    if (error) throw error;

    let sent = 0;
    for (const ag of ags ?? []) {
      const { data: b } = await supabase
        .from("barbeiros")
        .select("nome_profissional, nome")
        .eq("id", ag.barbeiro_id as string)
        .maybeSingle();
      const nomeBarbeiro = b?.nome_profissional || b?.nome || "seu barbeiro";
      const horario = new Date(ag.data_hora as string).toLocaleTimeString("pt-BR", {
        hour: "2-digit", minute: "2-digit", timeZone: "America/Sao_Paulo",
      });
      const message = `Olá ${ag.cliente_nome}! Lembrete do seu corte com o ${nomeBarbeiro} às ${horario}. Te espero! ✂️`;
      const r = await sendWhatsapp(String(ag.cliente_whatsapp), message);
      if (r.ok) {
        await supabase.from("agendamentos").update({ lembrete_enviado: true }).eq("id", ag.id as string);
        sent++;
      }
    }
    return json({ ok: true, processed: ags?.length ?? 0, sent });
  } catch (e) {
    console.error("check-reminders error", e);
    return json({ ok: false, error: String(e) });
  }
});

function json(body: unknown) {
  return new Response(JSON.stringify(body), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
