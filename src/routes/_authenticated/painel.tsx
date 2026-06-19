import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, CalendarDays, Settings, Wallet } from "lucide-react";

export const Route = createFileRoute("/_authenticated/painel")({
  component: PainelLayout,
});

const tabs = [
  { to: "/painel", label: "Início", icon: LayoutDashboard, exact: true },
  { to: "/painel/agenda", label: "Agenda", icon: CalendarDays, exact: false },
  { to: "/painel/financeiro", label: "Financeiro", icon: Wallet, exact: false },
  { to: "/painel/configuracoes", label: "Configurações", icon: Settings, exact: false },
] as const;

function PainelLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <div style={{ background: "#000", minHeight: "calc(100vh - 64px)" }}>
      {/* Sub-navegação */}
      <div
        className="overflow-x-auto"
        style={{ background: "#0a0a0a", borderBottom: "1px solid #2B2D42" }}
      >
        <nav className="mx-auto flex gap-1 px-4" style={{ maxWidth: 1200 }}>
          {tabs.map((t) => {
            const active = t.exact ? pathname === t.to : pathname.startsWith(t.to);
            return (
              <Link
                key={t.to}
                to={t.to}
                className="flex items-center gap-2 px-4 py-3 shrink-0"
                style={{
                  color: active ? "#F8F9FA" : "#ADB5BD",
                  borderBottom: `2px solid ${active ? "#C1121F" : "transparent"}`,
                  fontSize: 14,
                  fontWeight: 600,
                  textDecoration: "none",
                }}
              >
                <t.icon size={16} /> {t.label}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="mx-auto p-4 md:p-8" style={{ maxWidth: 1200 }}>
        <Outlet />
      </div>
    </div>
  );
}