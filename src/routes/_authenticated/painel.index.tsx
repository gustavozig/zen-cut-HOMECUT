import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useBarbeiro } from "@/hooks/use-barbeiro";
import { formatBRL } from "@/lib/slug";
import { Copy, Calendar, Settings as SettingsIcon, ChevronRight, Ban } from "lucide-react";
import { toast } from "sonner";

type Agendamento = {
  id: string;
  cliente_nome: string;
  cliente_whatsapp: string;
  data_hora: string;
  preco: number;
  status: "confirmado" | "concluido" | "falta" | "cancelado";
  servicos: { nome: string } | null;
};

export const Route = createFileRoute("/_authenticated/painel/")({
  component: PainelHome,
});

function PainelHome() {
  const { barbeiro, loading } = useBarbeiro();
  const [items, setItems] = useState<Agendamento[]>([]);

  async function load() {
    if (!barbeiro) return;
    const start = new Date(); start.setHours(0,0,0,0);
    const end = new Date(); end.setHours(23,59,59,999);
    const { data } = await supabase
      .from("agendamentos")
      .select("id, cliente_nome, cliente_whatsapp, data_hora, preco, status, servicos(nome)")
      .eq("barbeiro_id", barbeiro.id)
      .gte("data_hora", start.toISOString())
      .lte("data_hora", end.toISOString())
      .order("data_hora");
    setItems((data as unknown as Agendamento[]) ?? []);
  }

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [barbeiro?.id]);

  async function update(id: string, status: "concluido" | "falta") {
    await supabase.from("agendamentos").update({ status }).eq("id", id);
    toast.success(status === "concluido" ? "Marcado como concluído" : "Marcado como falta");
    load();
  }

  if (loading) return <p style={{ color: "#ADB5BD" }}>Carregando...</p>;
  if (!barbeiro) return <p style={{ color: "#ADB5BD" }}>Perfil não encontrado.</p>;

  const confirmados = items.filter((i) => i.status === "confirmado" || i.status === "concluido");
  const proximo = items.find((i) => i.status === "confirmado" && new Date(i.data_hora) > new Date());
  const totalDia = items.filter((i) => i.status === "concluido").reduce((s, i) => s + Number(i.preco || 0), 0);
  const link = `${typeof window !== "undefined" ? window.location.origin : ""}/b/${barbeiro.slug}`;

  return (
    <div>
      <h1 className="font-display" style={{ color: "#F8F9FA", fontSize: 32 }}>
        Olá, {barbeiro.nome_profissional} <span>✂️</span>
      </h1>
      <p style={{ color: "#ADB5BD", marginTop: 4 }}>Aqui está o seu dia.</p>

      {/* Resumo */}
      <div className="grid gap-4 mt-6" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
        <SummaryCard label="Agendamentos hoje" value={String(confirmados.length)} />
        <SummaryCard
          label="Próximo cliente"
          value={proximo ? proximo.cliente_nome : "—"}
          sub={proximo ? new Date(proximo.data_hora).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) : "Nada agendado"}
        />
        <SummaryCard label="Total do dia" value={formatBRL(totalDia)} highlight />
      </div>

      {/* Agenda do dia */}
      <h2 className="font-display mt-10" style={{ color: "#F8F9FA", fontSize: 22, letterSpacing: 1 }}>
        AGENDA DE HOJE
      </h2>
      <div className="flex flex-col gap-3 mt-4">
        {items.length === 0 && (
          <div className="card-hc text-center" style={{ color: "#ADB5BD" }}>
            Nenhum agendamento hoje. Compartilhe seu link!
          </div>
        )}
        {items.map((a) => {
          const isConfirmed = a.status === "confirmado";
          return (
            <div
              key={a.id}
              className={isConfirmed ? "booking-card" : "card-hc"}
              style={{ display: "grid", gridTemplateColumns: "auto 1fr auto", gap: 16, alignItems: "center" }}
            >
              <div className="font-display" style={{ color: "#C1121F", fontSize: 26, minWidth: 70 }}>
                {new Date(a.data_hora).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
              </div>
              <div>
                <div style={{ color: "#F8F9FA", fontWeight: 600 }}>{a.cliente_nome}</div>
                <div style={{ color: "#ADB5BD", fontSize: 12 }}>
                  {a.servicos?.nome ?? "—"} · {formatBRL(a.preco)}
                </div>
                <StatusTag status={a.status} />
              </div>
              {isConfirmed && (
                <div className="flex gap-2">
                  <button onClick={() => update(a.id, "concluido")} className="btn-primary" style={{ padding: "8px 12px", fontSize: 12 }}>Concluído</button>
                  <button onClick={() => update(a.id, "falta")} className="btn-secondary" style={{ padding: "8px 12px", fontSize: 12 }}>Falta</button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Atalhos */}
      <h2 className="font-display mt-10" style={{ color: "#F8F9FA", fontSize: 22, letterSpacing: 1 }}>ATALHOS</h2>
      <div className="grid gap-4 mt-4" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
        <Link to="/painel/agenda" className="card-hc flex items-center justify-between" style={{ textDecoration: "none" }}>
          <span style={{ color: "#F8F9FA", display: "inline-flex", alignItems: "center", gap: 10 }}><Calendar size={18} color="#C1121F" />Ver agenda da semana</span>
          <ChevronRight size={16} color="#ADB5BD" />
        </Link>
        <button
          onClick={() => { navigator.clipboard.writeText(link); toast.success("Link copiado!"); }}
          className="card-hc flex items-center justify-between"
          style={{ textAlign: "left" }}
        >
          <span style={{ color: "#F8F9FA", display: "inline-flex", alignItems: "center", gap: 10 }}><Copy size={18} color="#C1121F" />Copiar meu link</span>
          <ChevronRight size={16} color="#ADB5BD" />
        </button>
        <Link to="/painel/bloquear" className="card-hc flex items-center justify-between" style={{ textDecoration: "none" }}>
          <span style={{ color: "#F8F9FA", display: "inline-flex", alignItems: "center", gap: 10 }}>
            <Ban size={18} color="#C1121F" />
            <span>
              <div>🚫 Bloquear dia</div>
              <div style={{ color: "#ADB5BD", fontSize: 11, fontWeight: 400 }}>folga / ausência</div>
            </span>
          </span>
          <ChevronRight size={16} color="#ADB5BD" />
        </Link>
        <Link to="/painel/configuracoes" className="card-hc flex items-center justify-between" style={{ textDecoration: "none" }}>
          <span style={{ color: "#F8F9FA", display: "inline-flex", alignItems: "center", gap: 10 }}><SettingsIcon size={18} color="#C1121F" />Configurações</span>
          <ChevronRight size={16} color="#ADB5BD" />
        </Link>
      </div>
    </div>
  );
}

function SummaryCard({ label, value, sub, highlight }: { label: string; value: string; sub?: string; highlight?: boolean }) {
  return (
    <div className="card-hc">
      <div style={{ color: "#ADB5BD", fontSize: 12, textTransform: "uppercase", letterSpacing: 1 }}>{label}</div>
      <div className="font-display mt-1" style={{ color: highlight ? "#C1121F" : "#F8F9FA", fontSize: 30 }}>{value}</div>
      {sub && <div style={{ color: "#ADB5BD", fontSize: 12 }}>{sub}</div>}
    </div>
  );
}

function StatusTag({ status }: { status: string }) {
  const map: Record<string, { c: string; l: string }> = {
    confirmado: { c: "#FFC107", l: "Confirmado" },
    concluido: { c: "#22c55e", l: "Concluído" },
    falta: { c: "#ef4444", l: "Falta" },
    cancelado: { c: "#6b7280", l: "Cancelado" },
  };
  const s = map[status] ?? map.confirmado;
  return (
    <span style={{ color: s.c, fontSize: 11, fontWeight: 600, marginTop: 4, display: "inline-block", textTransform: "uppercase", letterSpacing: 1 }}>
      ● {s.l}
    </span>
  );
}