import { Link } from "@tanstack/react-router";

export function CTA() {
  return (
    <section style={{ background: "#C1121F", padding: "80px 24px", textAlign: "center" }} className="hc-section">
      <h2 className="font-display" style={{ color: "#F8F9FA", fontSize: "clamp(32px, 5vw, 56px)", letterSpacing: 1 }}>
        PRONTO PRA TER SUA AGENDA DE VOLTA?
      </h2>
      <Link
        to="/cadastro"
        className="inline-flex items-center justify-center mt-8"
        style={{
          background: "#F8F9FA",
          color: "#000",
          padding: "16px 32px",
          borderRadius: 12,
          fontWeight: 700,
          fontSize: 15,
          textDecoration: "none",
        }}
      >
        Começar grátis agora
      </Link>
      <p className="mt-4" style={{ color: "#F8F9FA", fontSize: 12, opacity: 0.85 }}>
        30 dias grátis. Sem cartão. Cancela quando quiser.
      </p>
    </section>
  );
}