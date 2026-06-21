import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useBarbeiro } from "@/hooks/use-barbeiro";
import { Copy, Plus, Trash2, Share2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/painel/configuracoes")({
  component: Configuracoes,
});

type Servico = { id: string; nome: string; duracao_minutos: number; preco: number; ativo: boolean };
type Horario = { id: string; dia_semana: number; hora_inicio: string; hora_fim: string; intervalo_inicio: string | null; intervalo_fim: string | null; ativo: boolean };

const DIAS = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

function Configuracoes() {
  const { barbeiro, reload } = useBarbeiro();
  const [perfil, setPerfil] = useState({ nome: "", nome_profissional: "", whatsapp: "", cidade: "", foto_url: "", zapi_instance_id: "", zapi_token: "", zapi_client_token: "" });
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [novo, setNovo] = useState({ nome: "", duracao_minutos: 30, preco: 0 });
  const [horarios, setHorarios] = useState<Horario[]>([]);

  useEffect(() => {
    if (!barbeiro) return;
    const b = barbeiro as typeof barbeiro & { zapi_instance_id?: string | null; zapi_token?: string | null; zapi_client_token?: string | null };
    setPerfil({
      nome: barbeiro.nome,
      nome_profissional: barbeiro.nome_profissional,
      whatsapp: barbeiro.whatsapp ?? "",
      cidade: barbeiro.cidade ?? "",
      foto_url: barbeiro.foto_url ?? "",
      zapi_instance_id: b.zapi_instance_id ?? "",
      zapi_token: b.zapi_token ?? "",
      zapi_client_token: b.zapi_client_token ?? "",
    });
    (async () => {
      const { data: s } = await supabase.from("servicos").select("*").eq("barbeiro_id", barbeiro.id).order("criado_em");
      setServicos((s as Servico[]) ?? []);
      const { data: h } = await supabase.from("horarios_trabalho").select("*").eq("barbeiro_id", barbeiro.id).order("dia_semana");
      setHorarios((h as Horario[]) ?? []);
    })();
  }, [barbeiro?.id]);

  if (!barbeiro) return <p style={{ color: "#ADB5BD" }}>Carregando...</p>;

  const link = `${typeof window !== "undefined" ? window.location.origin : ""}/b/${barbeiro.slug}`;

  async function salvarPerfil() {
    const { error } = await supabase.from("barbeiros").update(perfil).eq("id", barbeiro!.id);
    if (error) return toast.error(error.message);
    toast.success("Perfil atualizado");
    reload();
  }

  async function addServico() {
    if (!novo.nome) return toast.error("Nome obrigatório");
    const { data, error } = await supabase.from("servicos").insert({ ...novo, barbeiro_id: barbeiro!.id }).select().single();
    if (error) return toast.error(error.message);
    setServicos([...servicos, data as Servico]);
    setNovo({ nome: "", duracao_minutos: 30, preco: 0 });
  }
  async function delServico(id: string) {
    if (!confirm("Excluir serviço?")) return;
    await supabase.from("servicos").delete().eq("id", id);
    setServicos(servicos.filter((s) => s.id !== id));
  }

  async function toggleDia(diaSemana: number) {
    const existing = horarios.find((h) => h.dia_semana === diaSemana);
    if (existing) {
      await supabase.from("horarios_trabalho").update({ ativo: !existing.ativo }).eq("id", existing.id);
      setHorarios(horarios.map((h) => h.id === existing.id ? { ...h, ativo: !h.ativo } : h));
    } else {
      const { data } = await supabase.from("horarios_trabalho").insert({
        barbeiro_id: barbeiro!.id, dia_semana: diaSemana, hora_inicio: "09:00", hora_fim: "18:00", ativo: true,
      }).select().single();
      if (data) setHorarios([...horarios, data as Horario]);
    }
  }

  async function updHorario(id: string, patch: Partial<Horario>) {
    await supabase.from("horarios_trabalho").update(patch).eq("id", id);
    setHorarios(horarios.map((h) => h.id === id ? { ...h, ...patch } : h));
  }

  return (
    <div className="flex flex-col gap-10">
      {/* Perfil */}
      <Section title="PERFIL">
        <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
          <input className="input-hc" placeholder="Nome completo" value={perfil.nome} onChange={(e) => setPerfil({ ...perfil, nome: e.target.value })} />
          <input className="input-hc" placeholder="Nome profissional" value={perfil.nome_profissional} onChange={(e) => setPerfil({ ...perfil, nome_profissional: e.target.value })} />
          <input className="input-hc" placeholder="WhatsApp" value={perfil.whatsapp} onChange={(e) => setPerfil({ ...perfil, whatsapp: e.target.value })} />
          <input className="input-hc" placeholder="Cidade" value={perfil.cidade} onChange={(e) => setPerfil({ ...perfil, cidade: e.target.value })} />
          <input className="input-hc" placeholder="URL da foto" value={perfil.foto_url} onChange={(e) => setPerfil({ ...perfil, foto_url: e.target.value })} />
        </div>
        <button onClick={salvarPerfil} className="btn-primary mt-4">Salvar perfil</button>
      </Section>

      {/* Serviços */}
      <Section title="SERVIÇOS">
        <div className="flex flex-col gap-2">
          {servicos.map((s) => (
            <div key={s.id} className="card-hc flex flex-wrap items-center justify-between gap-3" style={{ padding: 14 }}>
              <div>
                <div style={{ color: "#F8F9FA", fontWeight: 600 }}>{s.nome}</div>
                <div style={{ color: "#ADB5BD", fontSize: 12 }}>{s.duracao_minutos} min · R$ {Number(s.preco).toFixed(2)}</div>
              </div>
              <button onClick={() => delServico(s.id)} style={{ background: "none", border: 0, color: "#C1121F", cursor: "pointer" }}>
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
        <div className="card-hc mt-4" style={{ padding: 14 }}>
          <div className="grid gap-2" style={{ gridTemplateColumns: "2fr 1fr 1fr auto" }}>
            <input className="input-hc" placeholder="Nome do serviço" value={novo.nome} onChange={(e) => setNovo({ ...novo, nome: e.target.value })} />
            <input className="input-hc" type="number" placeholder="Duração (min)" value={novo.duracao_minutos} onChange={(e) => setNovo({ ...novo, duracao_minutos: parseInt(e.target.value) || 0 })} />
            <input className="input-hc" type="number" step="0.01" placeholder="Preço" value={novo.preco} onChange={(e) => setNovo({ ...novo, preco: parseFloat(e.target.value) || 0 })} />
            <button onClick={addServico} className="btn-primary" style={{ padding: "0 16px" }}><Plus size={18} /></button>
          </div>
        </div>
      </Section>

      {/* Horários */}
      <Section title="HORÁRIOS">
        <div className="flex flex-col gap-2">
          {[1,2,3,4,5,6,0].map((d) => {
            const h = horarios.find((x) => x.dia_semana === d);
            const ativo = h?.ativo ?? false;
            return (
              <div key={d} className="card-hc" style={{ padding: 14 }}>
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <label style={{ color: "#F8F9FA", display: "inline-flex", alignItems: "center", gap: 8, fontWeight: 600 }}>
                    <input type="checkbox" checked={ativo} onChange={() => toggleDia(d)} />
                    {DIAS[d]}
                  </label>
                  {h && ativo && (
                    <div className="flex gap-2 items-center flex-wrap">
                      <input className="input-hc" type="time" style={{ width: 110 }} value={h.hora_inicio} onChange={(e) => updHorario(h.id, { hora_inicio: e.target.value })} />
                      <span style={{ color: "#ADB5BD" }}>às</span>
                      <input className="input-hc" type="time" style={{ width: 110 }} value={h.hora_fim} onChange={(e) => updHorario(h.id, { hora_fim: e.target.value })} />
                    </div>
                  )}
                </div>
                {h && ativo && (
                  <div className="flex gap-2 items-center flex-wrap mt-3">
                    <span style={{ color: "#ADB5BD", fontSize: 12 }}>Almoço:</span>
                    <input className="input-hc" type="time" style={{ width: 110 }} value={h.intervalo_inicio ?? ""} onChange={(e) => updHorario(h.id, { intervalo_inicio: e.target.value || null })} />
                    <span style={{ color: "#ADB5BD" }}>às</span>
                    <input className="input-hc" type="time" style={{ width: 110 }} value={h.intervalo_fim ?? ""} onChange={(e) => updHorario(h.id, { intervalo_fim: e.target.value || null })} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Section>

      {/* Meu link */}
      <Section title="MEU LINK">
        <div className="card-hc" style={{ padding: 18 }}>
          <div style={{ color: "#ADB5BD", fontSize: 12 }}>Seu link público</div>
          <div className="mt-2 break-all" style={{ color: "#F8F9FA", fontSize: 16, fontWeight: 600 }}>{link}</div>
          <div className="flex gap-2 mt-4 flex-wrap">
            <button className="btn-primary" onClick={() => { navigator.clipboard.writeText(link); toast.success("Copiado"); }}>
              <Copy size={16} style={{ marginRight: 8 }} /> Copiar
            </button>
            <a className="btn-secondary" href={`https://wa.me/?text=${encodeURIComponent(`Agende seu horário: ${link}`)}`} target="_blank" rel="noreferrer">
              <Share2 size={16} style={{ marginRight: 8 }} /> Compartilhar no WhatsApp
            </a>
          </div>
        </div>
      </Section>

      {/* Z-API */}
      <Section title="NOTIFICAÇÕES (Z-API)">
        <p style={{ color: "#ADB5BD", fontSize: 13, marginBottom: 12 }}>
          Receba aviso no seu WhatsApp quando alguém marcar em cima da hora (menos de 1 hora). Opcional.
        </p>
        <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
          <input className="input-hc" placeholder="Z-API Instance ID" value={perfil.zapi_instance_id} onChange={(e) => setPerfil({ ...perfil, zapi_instance_id: e.target.value })} />
          <input className="input-hc" placeholder="Z-API Token" value={perfil.zapi_token} onChange={(e) => setPerfil({ ...perfil, zapi_token: e.target.value })} />
          <input className="input-hc" placeholder="Client-Token (opcional)" value={perfil.zapi_client_token} onChange={(e) => setPerfil({ ...perfil, zapi_client_token: e.target.value })} />
        </div>
        <button onClick={salvarPerfil} className="btn-primary mt-4">Salvar credenciais</button>
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="font-display" style={{ color: "#F8F9FA", fontSize: 22, letterSpacing: 1 }}>{title}</h2>
      <div style={{ height: 2, width: 40, background: "#C1121F", marginTop: 6, marginBottom: 16 }} />
      {children}
    </section>
  );
}