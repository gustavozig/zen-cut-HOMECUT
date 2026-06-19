import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Entrar — HomeCUT" },
      { name: "description", content: "Acesse seu painel HomeCUT." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password: senha });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Bem-vindo de volta!");
    navigate({ to: "/painel" });
  }

  return (
    <div className="flex items-center justify-center px-4" style={{ minHeight: "calc(100vh - 64px)", background: "#000" }}>
      <div className="card-hc w-full" style={{ maxWidth: 420, padding: 32 }}>
        <h1 className="font-display text-center" style={{ color: "#F8F9FA", fontSize: 36, letterSpacing: 2 }}>
          <span>Home</span><span style={{ color: "#C1121F" }}>CUT</span>
        </h1>
        <span className="section-divider" />
        <h2 className="text-center mt-6" style={{ color: "#F8F9FA", fontSize: 18 }}>Entrar na sua conta</h2>
        <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-3">
          <input className="input-hc" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <input className="input-hc" type="password" placeholder="Senha" value={senha} onChange={(e) => setSenha(e.target.value)} required />
          <button disabled={loading} className="btn-primary mt-2">{loading ? "Entrando..." : "Entrar"}</button>
        </form>
        <div className="mt-6 text-center" style={{ fontSize: 13 }}>
          <Link to="/cadastro" style={{ color: "#C1121F", fontWeight: 600 }}>Não tem conta? Criar grátis</Link>
        </div>
        <div className="mt-2 text-center">
          <button
            onClick={async () => {
              if (!email) return toast.error("Digite seu email primeiro");
              const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password`,
              });
              if (error) toast.error(error.message);
              else toast.success("Email de redefinição enviado.");
            }}
            style={{ color: "#ADB5BD", fontSize: 12, background: "none", border: 0, cursor: "pointer" }}
          >
            Esqueci minha senha
          </button>
        </div>
      </div>
    </div>
  );
}