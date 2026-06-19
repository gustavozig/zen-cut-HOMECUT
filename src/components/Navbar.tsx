import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { BarberPole } from "./BarberPole";
import { supabase } from "@/integrations/supabase/client";

export function Navbar() {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setAuthed(!!data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setAuthed(!!s));
    return () => sub.subscription.unsubscribe();
  }, []);

  const inPainel = pathname.startsWith("/painel");

  return (
    <header
      className="navbar-line sticky top-0 z-50"
      style={{ background: "#000000" }}
    >
      <div
        className="mx-auto flex items-center justify-between"
        style={{ height: 64, padding: "0 24px", maxWidth: 1280 }}
      >
        <Link to="/" className="flex items-center" style={{ textDecoration: "none", gap: 10 }}>
          <BarberPole />
          <span
            className="hc-logo select-none"
            style={{
              fontFamily: "'Lobster', cursive",
              fontSize: 28,
              lineHeight: 1,
              whiteSpace: "nowrap",
              color: "#F8F9FA",
              display: "inline-flex",
              alignItems: "center",
              animation: "hc-logo-enter 0.7s ease-out",
            }}
          >
            Home<span style={{ color: "#C1121F", animation: "hc-logo-cut 2s ease-in-out infinite" }}>CUT</span>
          </span>
        </Link>

        <nav className="flex items-center gap-3">
          {authed ? (
            <>
              {!inPainel && (
                <Link to="/painel" className="btn-secondary" style={{ padding: "8px 18px", fontSize: 14 }}>
                  Painel
                </Link>
              )}
              <button
                onClick={async () => {
                  await supabase.auth.signOut();
                  navigate({ to: "/" });
                }}
                className="btn-secondary"
                style={{ padding: "8px 18px", fontSize: 14 }}
              >
                Sair
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-secondary" style={{ padding: "8px 18px", fontSize: 14 }}>
                Entrar
              </Link>
              <Link to="/cadastro" className="btn-primary" style={{ padding: "8px 18px", fontSize: 14 }}>
                Começar grátis
              </Link>
            </>
          )}
        </nav>
      </div>
      <style>{`
        @keyframes hc-logo-enter {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes hc-logo-cut {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.75; }
        }
        @media (max-width: 640px) {
          header > div { height: 56px !important; padding: 0 16px !important; }
          header .hc-logo { font-size: 22px !important; }
        }
      `}</style>
    </header>
  );
}