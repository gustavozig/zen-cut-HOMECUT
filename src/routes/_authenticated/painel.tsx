import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { useRef, useEffect, useState, useMemo } from "react";
import { Home, Calendar, DollarSign, Settings } from "lucide-react";

export const Route = createFileRoute("/_authenticated/painel")({
  component: PainelLayout,
});

const tabs = [
  { to: "/painel", label: "Início", icon: Home, exact: true },
  { to: "/painel/agenda", label: "Agenda", icon: Calendar, exact: false },
  { to: "/painel/financeiro", label: "Financeiro", icon: DollarSign, exact: false },
  { to: "/painel/configuracoes", label: "Configurações", icon: Settings, exact: false },
] as const;

function PainelLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navRef = useRef<HTMLDivElement>(null);
  const [indicator, setIndicator] = useState({ left: 0, width: 0 });
  const itemRefs = useRef<(HTMLAnchorElement | null)[]>([]);

  const activeIndex = useMemo(() => {
    return tabs.findIndex((t) => (t.exact ? pathname === t.to : pathname.startsWith(t.to)));
  }, [pathname]);

  useEffect(() => {
    const el = itemRefs.current[activeIndex];
    const nav = navRef.current;
    if (!el || !nav) return;
    const navRect = nav.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();
    setIndicator({
      left: elRect.left - navRect.left,
      width: elRect.width,
    });
  }, [activeIndex, pathname]);

  return (
    <div style={{ background: "#000", minHeight: "calc(100vh - 64px)" }}>
      <div
        style={{
          background: "#1A1A1A",
          borderBottom: "1px solid #2B2D42",
        }}
      >
        <nav
          ref={navRef}
          className="mx-auto flex relative"
          style={{
            maxWidth: 1200,
          }}
        >
          {tabs.map((t, i) => {
            const active = i === activeIndex;
            return (
              <Link
                key={t.to}
                to={t.to}
                ref={(el) => { itemRefs.current[i] = el; }}
                className="flex-1 flex flex-col items-center justify-center py-3 select-none"
                style={{
                  color: active ? "#C1121F" : "#ADB5BD",
                  textDecoration: "none",
                  transition: "color 200ms ease",
                }}
              >
                <t.icon
                  size={22}
                  style={{
                    transform: active ? "scale(1.1)" : "scale(1)",
                    transition: "transform 200ms ease",
                  }}
                />
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    marginTop: 4,
                    letterSpacing: 0.5,
                  }}
                >
                  {t.label}
                </span>
              </Link>
            );
          })}
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: indicator.left,
              width: indicator.width,
              height: 3,
              background: "#C1121F",
              borderRadius: "2px 2px 0 0",
              transition: "left 300ms ease, width 300ms ease",
            }}
          />
        </nav>
      </div>
      <div className="mx-auto p-4 md:p-8" style={{ maxWidth: 1200 }}>
        <Outlet />
      </div>
    </div>
  );
}