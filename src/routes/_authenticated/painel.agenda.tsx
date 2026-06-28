import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState, useCallback, memo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useBarbeiro } from "@/hooks/use-barbeiro";
import { formatBRL } from "@/lib/slug";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/painel/agenda")({
  component: AgendaMobile,
});

type Ag = {
  id: string;
  cliente_nome: string;
  cliente_whatsapp: string;
  data_hora: string;
  preco: number;
  status: string;
  servicos: { nome: string; preco: number; duracao_minutos: number } | null;
};

const WEEKDAYS_SHORT = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const WEEKDAYS_LONG = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
const MONTHS = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

function ymd(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function AgendaMobile() {
  const { barbeiro } = useBarbeiro();
  const today = useMemo(() => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; }, []);
  const [cursor, setCursor] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const [selected, setSelected] = useState<Date>(today);
  const [items, setItems] = useState<Ag[]>([]);
  const [daysWithAg, setDaysWithAg] = useState<Set<string>>(new Set());
  const [detail, setDetail] = useState<Ag | null>(null);
  const stripRef = useRef<HTMLDivElement>(null);

  const monthDays = useMemo(() => {
    const y = cursor.getFullYear();
    const m = cursor.getMonth();
    const last = new Date(y, m + 1, 0).getDate();
    return Array.from({ length: last }, (_, i) => new Date(y, m, i + 1));
  }, [cursor]);

  const loadMonth = useCallback(async () => {
    if (!barbeiro) return;
    const start = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
    const end = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1);
    const { data, error } = await supabase
      .from("agendamentos")
      .select("data_hora")
      .eq("barbeiro_id", barbeiro.id)
      .neq("status", "cancelado")
      .gte("data_hora", start.toISOString())
      .lt("data_hora", end.toISOString());
    if (error) { console.error("[agenda] loadMonth error:", error); return; }
    const s = new Set<string>();
    (data ?? []).forEach((r: { data_hora: string }) => {
      const d = new Date(r.data_hora);
      s.add(ymd(d));
    });
    setDaysWithAg(s);
  }, [barbeiro?.id, cursor]);

  const loadDay = useCallback(async () => {
    if (!barbeiro) return;
    const start = new Date(selected); start.setHours(0, 0, 0, 0);
    const end = new Date(start); end.setDate(end.getDate() + 1);
    const { data, error } = await supabase
      .from("agendamentos")
      .select("*, servicos(nome, preco, duracao_minutos)")
      .eq("barbeiro_id", barbeiro.id)
      .gte("data_hora", start.toISOString())
      .lt("data_hora", end.toISOString())
      .order("data_hora", { ascending: true });
    if (error) { console.error("[agenda] loadDay error:", error); return; }
    setItems((data as unknown as Ag[]) ?? []);
  }, [barbeiro?.id, selected]);

  useEffect(() => {
    let cancelled = false;
    loadMonth().then(() => { if (cancelled) return; });
    return () => { cancelled = true; };
  }, [loadMonth]);

  useEffect(() => {
    let cancelled = false;
    loadDay().then(() => { if (cancelled) return; });
    return () => { cancelled = true; };
  }, [loadDay]);

  // Centraliza o dia selecionado na régua
  useEffect(() => {
    const el = stripRef.current;
    if (!el) return;
    const target = el.querySelector<HTMLElement>(`[data-day="${ymd(selected)}"]`);
    if (target) {
      const offset = target.offsetLeft - el.clientWidth / 2 + target.clientWidth / 2;
      el.scrollTo({ left: offset, behavior: "smooth" });
    }
  }, [cursor, selected]);

  const goPrevMonth = useCallback(() => {
    setCursor((c) => {
      const n = new Date(c.getFullYear(), c.getMonth() - 1, 1);
      const isCurrent = n.getFullYear() === today.getFullYear() && n.getMonth() === today.getMonth();
      setSelected(isCurrent ? today : n);
      return n;
    });
  }, [today]);

  const goNextMonth = useCallback(() => {
    setCursor((c) => {
      const n = new Date(c.getFullYear(), c.getMonth() + 1, 1);
      const isCurrent = n.getFullYear() === today.getFullYear() && n.getMonth() === today.getMonth();
      setSelected(isCurrent ? today : n);
      return n;
    });
  }, [today]);

  const visibleItems = useMemo(() => items.filter((i) => i.status !== "cancelado"), [items]);

  async function updateStatus(id: string, novoStatus: "concluido" | "falta" | "cancelado", label: string) {
    const { data, error } = await supabase
      .from("agendamentos")
      .update({ status: novoStatus })
      .eq("id", id)
      .select("id");

    if (error) {
      console.error("[agenda] updateStatus error:", error);
      toast.error("Erro ao atualizar: " + error.message);
      return;
    }
    if (!data || data.length === 0) {
      toast.error("Não foi possível atualizar. Verifique as permissões.");
      return;
    }
    setDetail(null);
    toast.success(label);
    await Promise.all([loadDay(), loadMonth()]);
  }

  return (
    <div>
      {/* Header mês/ano */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="font-display" style={{ color: "#F8F9FA", fontSize: 26, lineHeight: 1.1 }}>
          {MONTHS[cursor.getMonth()]} <span style={{ color: "#ADB5BD" }}>{cursor.getFullYear()}</span>
        </h1>
        <div className="flex gap-2">
          <button onClick={goPrevMonth} aria-label="Mês anterior"
            style={{ background: "#2B2D42", border: 0, color: "#F8F9FA", width: 40, height: 40, borderRadius: 10, display: "grid", placeItems: "center", cursor: "pointer" }}>
            <ChevronLeft size={20} />
          </button>
          <button onClick={goNextMonth} aria-label="Próximo mês"
            style={{ background: "#2B2D42", border: 0, color: "#F8F9FA", width: 40, height: 40, borderRadius: 10, display: "grid", placeItems: "center", cursor: "pointer" }}>
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Régua de dias */}
      <div
        ref={stripRef}
        className="flex gap-2 overflow-x-auto pb-3 mb-5"
        style={{
          scrollSnapType: "x proximity",
          WebkitOverflowScrolling: "touch",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        <style>{`div::-webkit-scrollbar{display:none}`}</style>
        {monthDays.map((d) => (
          <DayChip
            key={d.getTime()}
            date={d}
            isSelected={ymd(d) === ymd(selected)}
            hasAg={daysWithAg.has(ymd(d))}
            onClick={() => setSelected(d)}
          />
        ))}
      </div>

      {/* Cabeçalho do dia */}
      <div className="mb-3">
        <div style={{ color: "#F8F9FA", fontSize: 16, fontWeight: 600 }}>
          {WEEKDAYS_LONG[selected.getDay()]}, {selected.getDate()} de {MONTHS[selected.getMonth()].toLowerCase()}
        </div>
        <div style={{ color: "#ADB5BD", fontSize: 13, marginTop: 2 }}>
          {visibleItems.length === 0 ? "Sem agendamentos" : `${visibleItems.length} agendamento${visibleItems.length > 1 ? "s" : ""}`}
        </div>
      </div>

      {/* Lista */}
      {visibleItems.length === 0 ? (
        <div className="card-hc" style={{ padding: 32, textAlign: "center" }}>
          <p style={{ color: "#ADB5BD", fontSize: 14 }}>Nenhum agendamento para esse dia.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {visibleItems.map((a) => (
            <AgCard key={a.id} ag={a} onClick={() => setDetail(a)} />
          ))}
        </div>
      )}

      {detail && (
        <DetailModal
          ag={detail}
          onClose={() => setDetail(null)}
          onConcluir={() => updateStatus(detail.id, "concluido", "Marcado como concluído")}
          onFalta={() => updateStatus(detail.id, "falta", "Marcado como falta")}
          onCancelar={() => {
            if (!confirm("Cancelar este agendamento? O horário ficará disponível novamente.")) return;
            updateStatus(detail.id, "cancelado", "Agendamento cancelado");
          }}
        />
      )}
    </div>
  );
}

const DayChip = memo(function DayChip({
  date, isSelected, hasAg, onClick,
}: { date: Date; isSelected: boolean; hasAg: boolean; onClick: () => void }) {
  return (
    <button
      data-day={ymd(date)}
      onClick={onClick}
      style={{
        scrollSnapAlign: "center",
        flex: "0 0 auto",
        width: 56,
        padding: "10px 0 8px",
        borderRadius: 12,
        border: 0,
        background: isSelected ? "#C1121F" : "#2B2D42",
        color: "#F8F9FA",
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 4,
        transition: "transform 0.15s ease",
        willChange: "transform",
      }}
    >
      <span style={{ fontSize: 11, opacity: 0.85, textTransform: "uppercase", letterSpacing: 0.5 }}>
        {WEEKDAYS_SHORT[date.getDay()]}
      </span>
      <span style={{ fontSize: 20, fontWeight: 700, lineHeight: 1 }}>{date.getDate()}</span>
      <span
        style={{
          width: 5, height: 5, borderRadius: "50%",
          background: hasAg ? (isSelected ? "#F8F9FA" : "#C1121F") : "transparent",
          marginTop: 2,
        }}
      />
    </button>
  );
});

const AgCard = memo(function AgCard({ ag, onClick }: { ag: Ag; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="text-left"
      style={{
        background: "#0a0a0a",
        border: "1px solid #1a1a2e",
        borderLeft: "3px solid #C1121F",
        borderRadius: 10,
        padding: 14,
        display: "flex",
        alignItems: "center",
        gap: 14,
        cursor: "pointer",
      }}
    >
      <div style={{ minWidth: 60 }}>
        <div className="font-display" style={{ color: "#C1121F", fontSize: 18, lineHeight: 1 }}>
          {new Date(ag.data_hora).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
        </div>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ color: "#F8F9FA", fontSize: 14, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {ag.cliente_nome}
        </div>
        <div style={{ color: "#ADB5BD", fontSize: 12, marginTop: 2 }}>
          {ag.servicos?.nome ?? "—"} · {formatBRL(ag.preco)}
        </div>
      </div>
      {ag.status !== "confirmado" && (
        <span style={{ fontSize: 10, padding: "3px 8px", borderRadius: 999, background: "#2B2D42", color: "#ADB5BD", textTransform: "uppercase" }}>
          {ag.status}
        </span>
      )}
    </button>
  );
});

function DetailModal({
  ag, onClose, onConcluir, onFalta, onCancelar,
}: { ag: Ag; onClose: () => void; onConcluir: () => void; onFalta: () => void; onCancelar: () => void }) {
  return (
    <div onClick={onClose}
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 60 }}>
      <div onClick={(e) => e.stopPropagation()} className="card-hc"
        style={{ maxWidth: 480, width: "100%", padding: 24, position: "relative", borderRadius: "16px 16px 0 0" }}>
        <button onClick={onClose} aria-label="Fechar"
          style={{ position: "absolute", top: 14, right: 14, background: "none", border: 0, color: "#ADB5BD", cursor: "pointer" }}>
          <X size={20} />
        </button>
        <h3 className="font-display" style={{ color: "#F8F9FA", fontSize: 22 }}>Agendamento</h3>
        <div className="mt-4 flex flex-col gap-2">
          <Row k="Cliente" v={ag.cliente_nome} />
          <Row k="WhatsApp" v={ag.cliente_whatsapp} />
          <Row k="Serviço" v={ag.servicos?.nome ?? "—"} />
          <Row k="Valor" v={formatBRL(ag.preco)} />
          <Row k="Quando" v={new Date(ag.data_hora).toLocaleString("pt-BR")} />
          <Row k="Status" v={ag.status} />
        </div>
        {ag.status === "confirmado" && (
          <div className="mt-5 flex flex-col gap-2">
            <button onClick={onConcluir}
              style={{ background: "#C1121F", color: "#F8F9FA", border: 0, padding: "12px", borderRadius: 10, fontWeight: 600, cursor: "pointer" }}>
              Marcar como concluído
            </button>
            <div className="flex gap-2">
              <button onClick={onFalta}
                style={{ flex: 1, background: "#2B2D42", color: "#F8F9FA", border: 0, padding: "10px", borderRadius: 10, cursor: "pointer" }}>
                Marcar falta
              </button>
              <button onClick={onCancelar}
                style={{ flex: 1, background: "transparent", color: "#ADB5BD", border: "1px solid #2B2D42", padding: "10px", borderRadius: 10, cursor: "pointer" }}>
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>
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
