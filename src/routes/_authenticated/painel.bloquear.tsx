import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useBarbeiro } from "@/hooks/use-barbeiro";
import { ChevronLeft, ChevronRight, Ban } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/painel/bloquear")({
  component: BloquearDias,
});

const MONTHS = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
const WD = ["D","S","T","Q","Q","S","S"];

function fmt(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}

function BloquearDias() {
  const { barbeiro } = useBarbeiro();
  const navigate = useNavigate();
  const [cursor, setCursor] = useState(() => { const d = new Date(); d.setDate(1); return d; });
  const [blocked, setBlocked] = useState<Map<string, string>>(new Map()); // date -> id

  async function load() {
    if (!barbeiro) return;
    const start = new Date(cursor); start.setDate(1);
    const end = new Date(cursor); end.setMonth(end.getMonth()+1); end.setDate(0);
    const { data } = await supabase
      .from("dias_bloqueados")
      .select("id, data")
      .eq("barbeiro_id", barbeiro.id)
      .gte("data", fmt(start))
      .lte("data", fmt(end));
    const m = new Map<string,string>();
    (data as { id: string; data: string }[] | null)?.forEach((r) => m.set(r.data, r.id));
    setBlocked(m);
  }
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [barbeiro?.id, cursor]);

  const days = useMemo(() => {
    const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
    const lastDay = new Date(cursor.getFullYear(), cursor.getMonth()+1, 0).getDate();
    const startWd = first.getDay();
    const cells: (Date | null)[] = [];
    for (let i = 0; i < startWd; i++) cells.push(null);
    for (let i = 1; i <= lastDay; i++) cells.push(new Date(cursor.getFullYear(), cursor.getMonth(), i));
    return cells;
  }, [cursor]);

  const today = new Date(); today.setHours(0,0,0,0);

  async function toggle(d: Date) {
    if (!barbeiro) return;
    if (d < today) return toast.error("Não pode bloquear dias passados.");
    const key = fmt(d);
    const existing = blocked.get(key);
    if (existing) {
      const { error } = await supabase.from("dias_bloqueados").delete().eq("id", existing);
      if (error) return toast.error(error.message);
      const m = new Map(blocked); m.delete(key); setBlocked(m);
    } else {
      const { data, error } = await supabase.from("dias_bloqueados").insert({ barbeiro_id: barbeiro.id, data: key }).select("id").single();
      if (error) return toast.error(error.message);
      const m = new Map(blocked); m.set(key, data!.id); setBlocked(m);
    }
  }

  if (!barbeiro) return <p style={{ color: "#ADB5BD" }}>Carregando...</p>;

  return (
    <div>
      <button onClick={() => navigate({ to: "/painel" })}
        style={{ background: "none", border: 0, color: "#ADB5BD", fontSize: 13, cursor: "pointer", marginBottom: 8 }}>
        ← Voltar
      </button>
      <h1 className="font-display" style={{ color: "#F8F9FA", fontSize: 26 }}>Marcar dias que não vou trabalhar</h1>
      <p style={{ color: "#ADB5BD", marginTop: 4, fontSize: 13 }}>Toque num dia para bloquear ou liberar.</p>

      <div className="flex items-center justify-between mt-6">
        <button onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth()-1, 1))}
          style={{ background: "#2B2D42", border: 0, color: "#F8F9FA", padding: 8, borderRadius: 8, cursor: "pointer" }}>
          <ChevronLeft size={20} />
        </button>
        <div className="font-display" style={{ color: "#F8F9FA", fontSize: 22 }}>
          {MONTHS[cursor.getMonth()]} {cursor.getFullYear()}
        </div>
        <button onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth()+1, 1))}
          style={{ background: "#2B2D42", border: 0, color: "#F8F9FA", padding: 8, borderRadius: 8, cursor: "pointer" }}>
          <ChevronRight size={20} />
        </button>
      </div>

      <div className="grid mt-6" style={{ gridTemplateColumns: "repeat(7, 1fr)", gap: 6 }}>
        {WD.map((w, i) => (
          <div key={i} style={{ color: "#ADB5BD", textAlign: "center", fontSize: 11, textTransform: "uppercase" }}>{w}</div>
        ))}
        {days.map((d, i) => {
          if (!d) return <div key={i} />;
          const key = fmt(d);
          const isBlocked = blocked.has(key);
          const isPast = d < today;
          const isToday = d.getTime() === today.getTime();
          return (
            <button key={i} onClick={() => toggle(d)} disabled={isPast}
              style={{
                aspectRatio: "1/1",
                background: isBlocked ? "#C1121F" : "#2B2D42",
                color: isPast ? "#6b7280" : "#F8F9FA",
                border: isToday ? "2px solid #C1121F" : 0,
                borderRadius: 10,
                cursor: isPast ? "not-allowed" : "pointer",
                opacity: isPast ? 0.4 : 1,
                fontWeight: 600,
                display: "flex", alignItems: "center", justifyContent: "center",
                position: "relative",
              }}>
              {d.getDate()}
              {isBlocked && <span style={{ position: "absolute", top: 4, right: 6, fontSize: 10 }}>✕</span>}
            </button>
          );
        })}
      </div>

      <div className="mt-6 flex flex-wrap gap-4" style={{ fontSize: 12, color: "#ADB5BD" }}>
        <span className="inline-flex items-center gap-2"><span style={{ width: 14, height: 14, background: "#2B2D42", borderRadius: 4 }} /> Disponível</span>
        <span className="inline-flex items-center gap-2"><span style={{ width: 14, height: 14, background: "#C1121F", borderRadius: 4 }} /> Bloqueado</span>
        <span className="inline-flex items-center gap-2"><span style={{ width: 14, height: 14, border: "2px solid #C1121F", borderRadius: 4 }} /> Hoje</span>
      </div>

      <div className="mt-8 card-hc" style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <Ban size={18} color="#C1121F" />
        <span style={{ color: "#ADB5BD", fontSize: 13 }}>
          Nos dias bloqueados, o cliente não vê nenhum horário disponível.
        </span>
      </div>

      <div className="mt-4">
        <Link to="/painel" className="btn-secondary" style={{ textDecoration: "none", display: "inline-block" }}>Concluir</Link>
      </div>
    </div>
  );
}
