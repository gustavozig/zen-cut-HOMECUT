import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useBarbeiro } from "@/hooks/use-barbeiro";
import { formatBRL } from "@/lib/slug";
import { X } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/painel/agenda")({
  component: AgendaSemana,
});

type Ag = {
  id: string;
  cliente_nome: string;
  cliente_whatsapp: string;
  data_hora: string;
  preco: number;
  status: string;
  servicos: { nome: string } | null;
};

function startOfWeek(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  const day = x.getDay();
  x.setDate(x.getDate() - day);
  return x;
}

function AgendaSemana() {
  const { barbeiro } = useBarbeiro();
  const [week, setWeek] = useState(startOfWeek(new Date()));
  const [items, setItems] = useState<Ag[]>([]);
  const [selected, setSelected] = useState<Ag | null>(null);

  const days = useMemo(() => Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(week); d.setDate(d.getDate() + i); return d;
  }), [week]);

  async function load() {
    if (!barbeiro) return;
    const start = new Date(week);
    const end = new Date(week); end.setDate(end.getDate() + 7);
    const { data } = await supabase
      .from("agendamentos")
      .select("id, cliente_nome, cliente_whatsapp, data_hora, preco, status, servicos(nome)")
      .eq("barbeiro_id", barbeiro.id)
      .gte("data_hora", start.toISOString())
      .lt("data_hora", end.toISOString())
      .order("data_hora");
    setItems((data as unknown as Ag[]) ?? []);
  }

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [barbeiro?.id, week.getTime()]);

  async function cancelar(id: string) {
    if (!confirm("Cancelar este agendamento?")) return;
    await supabase.from("agendamentos").update({ status: "cancelado" }).eq("id", id);
    toast.success("Agendamento cancelado");
    setSelected(null); load();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="font-display" style={{ color: "#F8F9FA", fontSize: 28 }}>AGENDA DA SEMANA</h1>
        <div className="flex gap-2">
          <button className="btn-secondary" style={{ padding: "8px 14px", fontSize: 13 }} onClick={() => { const n = new Date(week); n.setDate(n.getDate() - 7); setWeek(n); }}>← Anterior</button>
          <button className="btn-secondary" style={{ padding: "8px 14px", fontSize: 13 }} onClick={() => setWeek(startOfWeek(new Date()))}>Hoje</button>
          <button className="btn-secondary" style={{ padding: "8px 14px", fontSize: 13 }} onClick={() => { const n = new Date(week); n.setDate(n.getDate() + 7); setWeek(n); }}>Próxima →</button>
        </div>
      </div>

      <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))" }}>
        {days.map((d) => {
          const dayItems = items.filter((i) => {
            const di = new Date(i.data_hora);
            return di.toDateString() === d.toDateString() && i.status !== "cancelado";
          });
          return (
            <div key={d.toISOString()} className="card-hc" style={{ minHeight: 200, padding: 12 }}>
              <div style={{ borderBottom: "1px solid #1a1a2e", paddingBottom: 8, marginBottom: 8 }}>
                <div style={{ color: "#ADB5BD", fontSize: 11, textTransform: "uppercase" }}>
                  {d.toLocaleDateString("pt-BR", { weekday: "short" })}
                </div>
                <div className="font-display" style={{ color: "#F8F9FA", fontSize: 22 }}>{d.getDate()}</div>
              </div>
              <div className="flex flex-col gap-2">
                {dayItems.length === 0 && <p style={{ color: "#6c757d", fontSize: 12 }}>—</p>}
                {dayItems.map((a) => (
                  <button
                    key={a.id}
                    onClick={() => setSelected(a)}
                    className="text-left"
                    style={{ background: "#000", border: "1px solid #1a1a2e", borderLeft: "3px solid #C1121F", padding: 8, borderRadius: 8 }}
                  >
                    <div className="font-display" style={{ color: "#C1121F", fontSize: 14 }}>
                      {new Date(a.data_hora).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                    </div>
                    <div style={{ color: "#F8F9FA", fontSize: 12, marginTop: 2 }}>{a.cliente_nome}</div>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal detalhe */}
      {selected && (
        <div onClick={() => setSelected(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 60, padding: 16 }}>
          <div onClick={(e) => e.stopPropagation()} className="card-hc" style={{ maxWidth: 420, width: "100%", padding: 24, position: "relative" }}>
            <button onClick={() => setSelected(null)} style={{ position: "absolute", top: 12, right: 12, background: "none", border: 0, color: "#ADB5BD", cursor: "pointer" }}><X size={20} /></button>
            <h3 className="font-display" style={{ color: "#F8F9FA", fontSize: 22 }}>Agendamento</h3>
            <div className="mt-4 flex flex-col gap-2" style={{ color: "#F8F9FA" }}>
              <Row k="Cliente" v={selected.cliente_nome} />
              <Row k="WhatsApp" v={selected.cliente_whatsapp} />
              <Row k="Serviço" v={selected.servicos?.nome ?? "—"} />
              <Row k="Valor" v={formatBRL(selected.preco)} />
              <Row k="Quando" v={new Date(selected.data_hora).toLocaleString("pt-BR")} />
              <Row k="Status" v={selected.status} />
            </div>
            {selected.status === "confirmado" && (
              <button onClick={() => cancelar(selected.id)} className="btn-secondary mt-6 w-full">Cancelar agendamento</button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-3" style={{ borderBottom: "1px solid #1a1a2e", paddingBottom: 6 }}>
      <span style={{ color: "#ADB5BD", fontSize: 13 }}>{k}</span>
      <span style={{ color: "#F8F9FA", fontSize: 13, textAlign: "right" }}>{v}</span>
    </div>
  );
}