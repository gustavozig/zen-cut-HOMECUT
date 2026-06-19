import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useBarbeiro } from "@/hooks/use-barbeiro";
import { formatBRL } from "@/lib/slug";

export const Route = createFileRoute("/_authenticated/painel/financeiro")({
  component: Financeiro,
});

type Ag = { id: string; cliente_nome: string; data_hora: string; preco: number; servicos: { nome: string } | null };

function Financeiro() {
  const { barbeiro } = useBarbeiro();
  const [items, setItems] = useState<Ag[]>([]);

  useEffect(() => {
    (async () => {
      if (!barbeiro) return;
      const mes = new Date(); mes.setDate(1); mes.setHours(0,0,0,0);
      const { data } = await supabase
        .from("agendamentos")
        .select("id, cliente_nome, data_hora, preco, servicos(nome)")
        .eq("barbeiro_id", barbeiro.id)
        .eq("status", "concluido")
        .gte("data_hora", mes.toISOString())
        .order("data_hora", { ascending: false });
      setItems((data as unknown as Ag[]) ?? []);
    })();
  }, [barbeiro?.id]);

  const now = new Date();
  const hojeStart = new Date(); hojeStart.setHours(0,0,0,0);
  const semStart = new Date(); semStart.setDate(now.getDate() - 7);

  const total = (since: Date) => items.filter((i) => new Date(i.data_hora) >= since).reduce((s, i) => s + Number(i.preco || 0), 0);
  const ticketSem = (() => {
    const arr = items.filter((i) => new Date(i.data_hora) >= semStart);
    return arr.length ? arr.reduce((s, i) => s + Number(i.preco || 0), 0) / arr.length : 0;
  })();

  const counts: Record<string, number> = {};
  items.forEach((i) => { const n = i.servicos?.nome ?? "—"; counts[n] = (counts[n] ?? 0) + 1; });
  const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];

  return (
    <div>
      <h1 className="font-display" style={{ color: "#F8F9FA", fontSize: 28 }}>FINANCEIRO</h1>
      <div className="grid gap-4 mt-6" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
        <Stat label="Hoje" value={formatBRL(total(hojeStart))} />
        <Stat label="Últimos 7 dias" value={formatBRL(total(semStart))} highlight />
        <Stat label="Mês atual" value={formatBRL(total(new Date(now.getFullYear(), now.getMonth(), 1)))} />
        <Stat label="Ticket médio (semana)" value={formatBRL(ticketSem)} />
        <Stat label="Mais vendido no mês" value={top ? `${top[0]} (${top[1]}x)` : "—"} />
      </div>

      <h2 className="font-display mt-10" style={{ color: "#F8F9FA", fontSize: 22, letterSpacing: 1 }}>HISTÓRICO DO MÊS</h2>
      <div className="flex flex-col gap-2 mt-4">
        {items.length === 0 && <p style={{ color: "#ADB5BD" }}>Sem entradas ainda.</p>}
        {items.map((i) => (
          <div key={i.id} className="card-hc flex items-center justify-between" style={{ padding: 14 }}>
            <div>
              <div style={{ color: "#F8F9FA", fontWeight: 600 }}>{i.cliente_nome}</div>
              <div style={{ color: "#ADB5BD", fontSize: 12 }}>{i.servicos?.nome ?? "—"} · {new Date(i.data_hora).toLocaleDateString("pt-BR")}</div>
            </div>
            <div className="font-display" style={{ color: "#C1121F", fontSize: 20 }}>{formatBRL(i.preco)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="card-hc">
      <div style={{ color: "#ADB5BD", fontSize: 12, textTransform: "uppercase", letterSpacing: 1 }}>{label}</div>
      <div className="font-display mt-1" style={{ color: highlight ? "#C1121F" : "#F8F9FA", fontSize: 28 }}>{value}</div>
    </div>
  );
}