import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { slugify } from "@/lib/slug";
import { toast } from "sonner";

export const Route = createFileRoute("/cadastro")({
  head: () => ({
    meta: [
      { title: "Criar conta grátis — HomeCUT" },
      { name: "description", content: "30 dias grátis. Sem cartão. Cancela quando quiser." },
    ],
  }),
  component: CadastroPage,
});

function CadastroPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    nome: "",
    nome_profissional: "",
    email: "",
    whatsapp: "",
    senha: "",
    confirmar: "",
  });
  const [lgpdAceito, setLgpdAceito] = useState(false);
  const [loading, setLoading] = useState(false);

  function up(k: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [k]: e.target.value });
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!lgpdAceito) return toast.error("Aceite os Termos de Uso e a Política de Privacidade para continuar.");
    if (form.senha.length < 6) return toast.error("A senha precisa ter ao menos 6 caracteres.");
    if (form.senha !== form.confirmar) return toast.error("As senhas não conferem.");
    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email: form.email,
      password: form.senha,
      options: { emailRedirectTo: `${window.location.origin}/painel` },
    });
    if (error || !data.user) {
      setLoading(false);
      return toast.error(error?.message ?? "Erro ao criar conta");
    }

    // Gerar slug único
    let baseSlug = slugify(form.nome_profissional || form.nome);
    if (!baseSlug) baseSlug = "barbeiro";
    let finalSlug = baseSlug;
    let n = 0;
    while (true) {
      const { data: exists } = await supabase
        .from("barbeiros")
        .select("id")
        .eq("slug", finalSlug)
        .maybeSingle();
      if (!exists) break;
      n += 1;
      finalSlug = `${baseSlug}-${n}`;
      if (n > 30) break;
    }

    const { error: err2 } = await supabase.from("barbeiros").insert({
      user_id: data.user.id,
      nome: form.nome,
      nome_profissional: form.nome_profissional,
      email: form.email,
      whatsapp: form.whatsapp,
      slug: finalSlug,
    });

    if (err2) {
      setLoading(false);
      return toast.error(err2.message);
    }

    // Default: criar horários padrão seg-sáb 9-18
    const horarios = [1, 2, 3, 4, 5, 6].map((d) => ({
      barbeiro_id: undefined as unknown as string,
      dia_semana: d,
      hora_inicio: "09:00",
      hora_fim: "18:00",
      ativo: true,
    }));
    const { data: bRow } = await supabase
      .from("barbeiros")
      .select("id")
      .eq("user_id", data.user.id)
      .single();
    if (bRow) {
      await supabase
        .from("horarios_trabalho")
        .insert(horarios.map((h) => ({ ...h, barbeiro_id: bRow.id })));
    }

    setLoading(false);
    toast.success("Conta criada! Bem-vindo ao HomeCUT.");
    navigate({ to: "/painel" });
  }

  return (
    <div className="flex items-center justify-center px-4 py-12" style={{ minHeight: "calc(100vh - 64px)", background: "#000" }}>
      <div className="card-hc w-full" style={{ maxWidth: 460, padding: 32 }}>
        <h1 className="font-display text-center" style={{ color: "#F8F9FA", fontSize: 36, letterSpacing: 2 }}>
          <span>Home</span><span style={{ color: "#C1121F" }}>CUT</span>
        </h1>
        <span className="section-divider" />
        <h2 className="text-center mt-6" style={{ color: "#F8F9FA", fontSize: 18 }}>Criar conta grátis</h2>
        <p className="text-center mt-1" style={{ color: "#ADB5BD", fontSize: 12 }}>30 dias grátis. Sem cartão.</p>

        <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-3">
          <input className="input-hc" placeholder="Nome completo" value={form.nome} onChange={up("nome")} required />
          <input className="input-hc" placeholder="Nome profissional (aparece no link)" value={form.nome_profissional} onChange={up("nome_profissional")} required />
          <input className="input-hc" type="email" placeholder="Email" value={form.email} onChange={up("email")} required />
          <input className="input-hc" placeholder="WhatsApp (com DDD)" value={form.whatsapp} onChange={up("whatsapp")} required />
          <input className="input-hc" type="password" placeholder="Senha (mín. 6)" value={form.senha} onChange={up("senha")} required />
          <input className="input-hc" type="password" placeholder="Confirmar senha" value={form.confirmar} onChange={up("confirmar")} required />

          {/* LGPD checkbox */}
          <label
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 10,
              cursor: "pointer",
              marginTop: 4,
            }}
          >
            <span style={{ position: "relative", flexShrink: 0, marginTop: 2 }}>
              <input
                type="checkbox"
                checked={lgpdAceito}
                onChange={(e) => setLgpdAceito(e.target.checked)}
                style={{ opacity: 0, position: "absolute", inset: 0, cursor: "pointer" }}
              />
              <span
                style={{
                  display: "block",
                  width: 18,
                  height: 18,
                  borderRadius: 4,
                  border: `2px solid ${lgpdAceito ? "#C1121F" : "#ADB5BD"}`,
                  background: lgpdAceito ? "#C1121F" : "transparent",
                  transition: "background 150ms ease, border-color 150ms ease",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {lgpdAceito && (
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                    <path d="M1 4L3.5 6.5L9 1" stroke="#F8F9FA" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </span>
            </span>
            <span style={{ color: "#ADB5BD", fontSize: 13, lineHeight: 1.5 }}>
              Li e concordo com os{" "}
              <a href="/termos" target="_blank" rel="noreferrer" style={{ color: "#C1121F" }} onClick={(e) => e.stopPropagation()}>
                Termos de Uso
              </a>
              {" "}e a{" "}
              <a href="/privacidade" target="_blank" rel="noreferrer" style={{ color: "#C1121F" }} onClick={(e) => e.stopPropagation()}>
                Política de Privacidade
              </a>
            </span>
          </label>

          <button
            disabled={loading || !lgpdAceito}
            className="btn-primary mt-2"
            style={{ opacity: lgpdAceito ? 1 : 0.5 }}
          >
            {loading ? "Criando..." : "Criar minha conta grátis"}
          </button>
        </form>

        <div className="mt-6 text-center" style={{ fontSize: 13 }}>
          <Link to="/login" style={{ color: "#C1121F", fontWeight: 600 }}>Já tenho conta — entrar</Link>
        </div>
      </div>
    </div>
  );
}
