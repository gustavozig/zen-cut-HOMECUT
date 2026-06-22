// Roda 1x ao dia (10h) via pg_cron. Envia mensagem para clientes inativos há 20+ dias.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { sendWhatsapp } from "../_shared/zapi.ts";

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
    const publicBase = Deno.env.get("PUBLIC_SITE_URL") || "https://zen-cut-harmony.lovable.app";
    const cutoff = new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString();

    const { data: clientes, error } = await supabase
      .from("clientes")
      .select("id, nome, whatsapp, barbeiro_id, ultimo_agendamento, reativacao_enviada_em")
      .lte("ultimo_agendamento", cutoff)
      .or(`reativacao_enviada_em.is.null,reativacao_enviada_em.lte.${cutoff}`);
    if (error) throw error;

    let sent = 0;
    for (const c of clientes ?? []) {
      const { data: b } = await supabase
        .from("barbeiros")
        .select("nome_profissional, nome, slug")
        .eq("id", c.barbeiro_id as string)
        .maybeSingle();
      const nomeBarbeiro = b?.nome_profissional || b?.nome || "seu barbeiro";
      const link = b?.slug ? `${publicBase}/b/${b.slug}` : publicBase;
      const message = `E aí ${c.nome}! Faz um tempo que você não passa com o ${nomeBarbeiro}. Tá precisando dar aquele tapa no visual? Bora marcar: ${link} ✂️`;
      const r = await sendWhatsapp(String(c.whatsapp), message);
      if (r.ok) {
        await supabase.from("clientes").update({ reativacao_enviada_em: new Date().toISOString() }).eq("id", c.id as string);
        sent++;
      }
    }
    return json({ ok: true, processed: clientes?.length ?? 0, sent });
  } catch (e) {
    console.error("check-reactivation error", e);
    return json({ ok: false, error: String(e) });
  }
});

function json(body: unknown) {
  return new Response(JSON.stringify(body), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
