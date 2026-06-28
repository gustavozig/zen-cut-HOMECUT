import { createFileRoute } from "@tanstack/react-router";
import { Hero } from "@/components/landing/Hero";
import { Testimonials } from "@/components/landing/Testimonials";
import { Benefits } from "@/components/landing/Benefits";
import { Numbers } from "@/components/landing/Numbers";
import { CTA } from "@/components/landing/CTA";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "HomeCUT — Agenda para barbeiros autônomos" },
      { name: "description", content: "Sua agenda, seus clientes, onde você for. O sistema de agendamento feito para o barbeiro autônomo." },
      { property: "og:title", content: "HomeCUT — Agenda para barbeiros autônomos" },
      { property: "og:description", content: "Sua agenda, seus clientes, onde você for." },
    ],
  }),
  component: LandingPage,
});

function LandingPage() {
  return (
    <div style={{ background: "#000000" }}>
      <Hero />
      <Testimonials />
      <Benefits />
      <Numbers />
      <CTA />
      <footer style={{ padding: "28px 24px", background: "#000", textAlign: "center" }}>
        <p style={{ color: "#ADB5BD", fontSize: 12 }}>
          © {new Date().getFullYear()} HomeCUT · Feito para barbeiros autônomos
          {" · "}
          <a
            href="/termos"
            style={{ color: "#ADB5BD", textDecoration: "none", transition: "color 150ms" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#C1121F")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#ADB5BD")}
          >
            Termos de Uso
          </a>
          {" · "}
          <a
            href="/privacidade"
            style={{ color: "#ADB5BD", textDecoration: "none", transition: "color 150ms" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#C1121F")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#ADB5BD")}
          >
            Privacidade
          </a>
        </p>
      </footer>
    </div>
  );
}
