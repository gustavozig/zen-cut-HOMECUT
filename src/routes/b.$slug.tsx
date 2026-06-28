import { createFileRoute, notFound } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { formatBRL } from "@/lib/slug";
import { Clock, MapPin, CheckCircle2, ArrowLeft, X } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/b/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: `Agendar com ${params.slug} — HomeCUT` },
      { name: "description", content: `Agende seu horário online com ${params.slug}.` },
      { property: "og:title", content: `Agendar com ${params.slug}` },
      { property: "og:description", content: "Escolha seu horário em segundos." },
    ],
  }),
  loader: async ({ params }) => {
    const { data } = await supabase.rpc("get_barbeiro_publico", { p_slug: params.slug });
    const b = Array.isArray(data) ? data[0] : null;
    if (!b) throw notFound();
    return { barbeiro: b };
  },
  errorComponent: () => <div className="p-10 text-center" style={{ color: "#ADB5BD" }}>Erro ao carregar barbeiro.</div>,
  notFoundComponent: () => <div className="p-10 text-center" style={{ color: "#ADB5BD" }}>Barbeiro não encontrado.</div>,
  component: PublicBooking,
});

type Servico = { id: string; nome: string; duracao_minutos: number; preco: number; ativo: boolean };
type Horario = { dia_semana: number; hora_inicio: string; hora_fim: string; intervalo_inicio: string | null; intervalo_fim: string | null; ativo: boolean };

const MIN_ADVANCE_MS = 30 * 60 * 1000;
const MAX_DAYS_AHEAD = 30;

function PublicBooking() {
  const { barbeiro } = Route.useLoaderData();
  const [step, setStep] = useState<"servico" | "dia" | "horario" | "dados" | "sucesso">("servico");
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [horarios, setHorarios] = useState<Horario[]>([]);
  const [ocupados, setOcupados] = useState<{ data_hora: string; duracao_minutos: number }[]>([]);
  const [bloqueados, setBloqueados] = useState<Set<string>>(new Set());
  const [selServico, setSelServico] = useState<Servico | null>(null);
  const [selDia, setSelDia] = useState<Date | null>(null);
  const [selHora, setSelHora] = useState<Date | null>(null);
  const [dados, setDados] = useState({ nome: "", whatsapp: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: s } = await supabase.from("servicos").select("*").eq("barbeiro_id", barbeiro.id).eq("ativo", true);
      setServicos((s as Servico[]) ?? []);
      const { data: h } = await supabase.from("horarios_trabalho").select("*").eq("barbeiro_id", barbeiro.id).eq("ativo", true);
      setHorarios((h as Horario[]) ?? []);
      const { data: b } = await supabase.rpc("get_dias_bloqueados", { p_barbeiro_id: barbeiro.id });
      const set = new Set<string>();
      (b as { data: string }[] | null)?.forEach((d) => set.add(d.data));
      setBloqueados(set);
    })();
  }, [barbeiro.id]);

  useEffect(() => {
    if (!selDia) return;
    (async () => {
      const y = selDia.getFullYear();
      const m = String(selDia.getMonth() + 1).padStart(2, "0");
      const d = String(selDia.getDate()).padStart(2, "0");
      const { data } = await supabase.rpc("get_horarios_ocupados", {
        p_barbeiro_id: barbeiro.id,
        p_data: `${y}-${m}-${d}`,
      });
      setOcupados((data as { data_hora: string; duracao_minutos: number }[]) ?? []);
    })();
  }, [selDia, barbeiro.id]);

  // Próximos 30 dias com horários ativos e não bloqueados
  const dias = useMemo(() => {
    const arr: Date[] = [];
    const today = new Date(); today.setHours(0, 0, 0, 0);
    for (let i = 0; i <= MAX_DAYS_AHEAD; i++) {
      const d = new Date(today); d.setDate(d.getDate() + i);
      const h = horarios.find((x) => x.dia_semana === d.getDay());
      if (!h) continue;
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      if (bloqueados.has(key)) continue;
      arr.push(d);
    }
    return arr;
  }, [horarios, bloqueados]);

  type Slot = { time: Date; ocupado: boolean; available: boolean };
  const slots = useMemo<Slot[]>(() => {
    if (!selDia || !selServico) return [];
    const h = horarios.find((x) => x.dia_semana === selDia.getDay());
    if (!h) return [];
    const [hi, mi] = h.hora_inicio.split(":").map(Number);
    const [hf, mf] = h.hora_fim.split(":").map(Number);
    const start = new Date(selDia); start.setHours(hi, mi, 0, 0);
    const end = new Date(selDia); end.setHours(hf, mf, 0, 0);
    const stepMin = selServico.duracao_minutos;
    const minAllowed = new Date(Date.now() + MIN_ADVANCE_MS);

    let lunchStart: Date | null = null, lunchEnd: Date | null = null;
    if (h.intervalo_inicio && h.intervalo_fim) {
      const [li, lim] = h.intervalo_inicio.split(":").map(Number);
      const [le, lem] = h.intervalo_fim.split(":").map(Number);
      lunchStart = new Date(selDia); lunchStart.setHours(li, lim, 0, 0);
      lunchEnd = new Date(selDia); lunchEnd.setHours(le, lem, 0, 0);
    }

    const out: Slot[] = [];
    for (let t = new Date(start); t.getTime() + stepMin * 60000 <= end.getTime(); t = new Date(t.getTime() + stepMin * 60000)) {
      const tEnd = new Date(t.getTime() + stepMin * 60000);
      if (lunchStart && lunchEnd && tEnd > lunchStart && t < lunchEnd) continue;
      const ocupado = ocupados.some((o) => {
        const os = new Date(o.data_hora);
        const oe = new Date(os.getTime() + (o.duracao_minutos || 30) * 60000);
        return t < oe && tEnd > os;
      });
      const tooSoon = t < minAllowed;
      out.push({ time: new Date(t), ocupado, available: !ocupado && !tooSoon });
    }
    return out;
  }, [selDia, selServico, horarios, ocupados]);

  async function confirmar() {
    if (!selServico || !selHora) return;
    if (dados.nome.trim().length < 2) return toast.error("Informe seu nome");
    if (dados.whatsapp.replace(/\D/g, "").length < 10) return toast.error("WhatsApp inválido");
    if (selHora.getTime() < Date.now() + MIN_ADVANCE_MS) {
      return toast.error("Esse horário não está mais disponível. Escolha um horário com pelo menos 30 minutos de antecedência.");
    }
    setLoading(true);
    const { data: agendamentoId, error } = await supabase.rpc("criar_agendamento", {
      p_barbeiro_id: barbeiro.id,
      p_servico_id: selServico.id,
      p_cliente_nome: dados.nome.trim(),
      p_cliente_whatsapp: dados.whatsapp,
      p_data_hora: selHora.toISOString(),
      p_status: "confirmado",
    });
    setLoading(false);
    if (error) return toast.error(error.message);

    // Dispara aviso "em cima da hora" — falha silenciosa
    if (agendamentoId) {
      supabase.functions.invoke("notificar-agendamento", { body: { agendamento_id: agendamentoId } }).catch(() => {});
    }
    setStep("sucesso");
  }

  return (
    <div style={{ background: "#000", minHeight: "calc(100vh - 64px)", padding: "32px 16px" }}>
      <div className="mx-auto" style={{ maxWidth: 560 }}>
        <div className="flex flex-col items-center text-center">
          <div className="flex items-center justify-center"
            style={{ width: 80, height: 80, borderRadius: "50%", overflow: "hidden", background: "#2B2D42", border: "2px solid #C1121F" }}>
            {barbeiro.foto_url ? (
              <img src={barbeiro.foto_url} alt={barbeiro.nome_profissional} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <span className="font-display" style={{ color: "#C1121F", fontSize: 32 }}>{(barbeiro.nome_profissional || "?")[0]}</span>
            )}
          </div>
          <h1 className="font-display mt-4" style={{ color: "#F8F9FA", fontSize: 30 }}>{barbeiro.nome_profissional}</h1>
          {barbeiro.cidade && (
            <p style={{ color: "#ADB5BD", fontSize: 13, marginTop: 4, display: "inline-flex", alignItems: "center", gap: 4 }}>
              <MapPin size={12} /> {barbeiro.cidade}
            </p>
          )}
        </div>

        {step !== "sucesso" && step !== "servico" && (
          <button onClick={() => setStep(step === "dia" ? "servico" : step === "horario" ? "dia" : "horario")}
            className="flex items-center gap-1 mt-6" style={{ color: "#ADB5BD", fontSize: 13, background: "none", border: 0, cursor: "pointer" }}>
            <ArrowLeft size={14} /> Voltar
          </button>
        )}

        {step === "servico" && (
          <div className="mt-8">
            <h2 className="font-display" style={{ color: "#F8F9FA", fontSize: 20, letterSpacing: 1 }}>ESCOLHA O SERVIÇO</h2>
            <div className="flex flex-col gap-3 mt-4">
              {servicos.length === 0 && <p style={{ color: "#ADB5BD" }}>Sem serviços cadastrados.</p>}
              {servicos.map((s) => (
                <button key={s.id} onClick={() => { setSelServico(s); setStep("dia"); }}
                  className="card-hc text-left" style={{ borderLeft: "3px solid #C1121F", cursor: "pointer" }}>
                  <div className="flex justify-between items-start gap-3">
                    <div>
                      <div style={{ color: "#F8F9FA", fontWeight: 600, fontSize: 16 }}>{s.nome}</div>
                      <div style={{ color: "#ADB5BD", fontSize: 12, marginTop: 4, display: "inline-flex", alignItems: "center", gap: 4 }}>
                        <Clock size={12} /> {s.duracao_minutos} min
                      </div>
                    </div>
                    <div className="font-display" style={{ color: "#C1121F", fontSize: 22 }}>{formatBRL(s.preco)}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === "dia" && (
          <div className="mt-8">
            <h2 className="font-display" style={{ color: "#F8F9FA", fontSize: 20, letterSpacing: 1 }}>ESCOLHA O DIA</h2>
            <p style={{ color: "#ADB5BD", fontSize: 12, marginTop: 4 }}>Disponível nos próximos 30 dias</p>
            <div className="grid gap-2 mt-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(80px, 1fr))" }}>
              {dias.map((d) => (
                <button key={d.toISOString()} onClick={() => { setSelDia(d); setStep("horario"); }}
                  className="card-hc text-center" style={{ padding: 12, cursor: "pointer" }}>
                  <div style={{ color: "#ADB5BD", fontSize: 10, textTransform: "uppercase" }}>
                    {d.toLocaleDateString("pt-BR", { weekday: "short" })}
                  </div>
                  <div className="font-display" style={{ color: "#F8F9FA", fontSize: 22 }}>{d.getDate()}</div>
                  <div style={{ color: "#ADB5BD", fontSize: 10 }}>{d.toLocaleDateString("pt-BR", { month: "short" })}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === "horario" && selDia && (
          <div className="mt-8">
            <h2 className="font-display" style={{ color: "#F8F9FA", fontSize: 20, letterSpacing: 1 }}>HORÁRIOS</h2>
            <p style={{ color: "#ADB5BD", fontSize: 12, marginTop: 4 }}>
              {selDia.toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" })}
            </p>
            <div className="grid gap-2 mt-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(96px, 1fr))" }}>
              {slots.length === 0 && <p style={{ color: "#ADB5BD" }}>Sem horários neste dia.</p>}
              {slots.map((s) => {
                if (s.available) {
                  return (
                    <button key={s.time.toISOString()} onClick={() => { setSelHora(s.time); setStep("dados"); }}
                      className="font-display"
                      style={{ background: "#2B2D42", color: "#F8F9FA", borderRadius: 10, padding: 12, cursor: "pointer", border: 0, fontSize: 16 }}>
                      {s.time.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                    </button>
                  );
                }
                return (
                  <div key={s.time.toISOString()} className="font-display"
                    title={s.ocupado ? "Ocupado" : "Indisponível"}
                    style={{
                      background: "#2B2D42", color: "#ADB5BD", borderRadius: 10, padding: 12,
                      opacity: 0.4, fontSize: 16, textAlign: "center", cursor: "not-allowed",
                      display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6,
                    }}>
                    <span>{s.time.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</span>
                    <X size={12} />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {step === "dados" && selServico && selHora && (
          <div className="mt-8">
            <h2 className="font-display" style={{ color: "#F8F9FA", fontSize: 20, letterSpacing: 1 }}>SEUS DADOS</h2>
            <div className="card-hc mt-4" style={{ borderLeft: "3px solid #C1121F" }}>
              <div style={{ color: "#F8F9FA", fontWeight: 600 }}>{selServico.nome} · {formatBRL(selServico.preco)}</div>
              <div style={{ color: "#ADB5BD", fontSize: 13, marginTop: 4 }}>
                {selHora.toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" })} às {selHora.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
              </div>
            </div>
            <div className="flex flex-col gap-3 mt-4">
              <input className="input-hc" placeholder="Seu nome" value={dados.nome} onChange={(e) => setDados({ ...dados, nome: e.target.value })} maxLength={80} />
              <input className="input-hc" placeholder="WhatsApp (com DDD)" value={dados.whatsapp} onChange={(e) => setDados({ ...dados, whatsapp: e.target.value })} maxLength={20} />
              <button onClick={confirmar} disabled={loading} className="btn-primary mt-2">
                {loading ? "Confirmando..." : "Confirmar agendamento"}
              </button>
            </div>
          </div>
        )}

        {step === "sucesso" && selServico && selHora && (
          <div className="mt-10 text-center">
            <CheckCircle2 size={64} color="#C1121F" style={{ margin: "0 auto" }} />
            <h2 className="font-display mt-4" style={{ color: "#F8F9FA", fontSize: 28, letterSpacing: 1 }}>AGENDAMENTO CONFIRMADO!</h2>
            <div className="card-hc mt-6 text-left" style={{ borderLeft: "3px solid #C1121F" }}>
              <Row k="Serviço" v={selServico.nome} />
              <Row k="Quando" v={`${selHora.toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" })} às ${selHora.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`} />
              <Row k="Valor" v={formatBRL(selServico.preco)} />
              <Row k="Barbeiro" v={barbeiro.nome_profissional} />
            </div>
            <p className="mt-6" style={{ color: "#ADB5BD", fontSize: 13 }}>Você receberá um lembrete no WhatsApp.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-3 py-2" style={{ borderBottom: "1px solid #1a1a2e" }}>
      <span style={{ color: "#ADB5BD", fontSize: 13 }}>{k}</span>
      <span style={{ color: "#F8F9FA", fontSize: 13, textAlign: "right" }}>{v}</span>
    </div>
  );
}
