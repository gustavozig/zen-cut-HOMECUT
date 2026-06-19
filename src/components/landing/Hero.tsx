import { Link } from "@tanstack/react-router";
import heroImg from "@/assets/hero-barber.jpg";

export function Hero() {
  return (
    <section
      className="relative"
      style={{
        minHeight: "auto",
        backgroundImage: `linear-gradient(rgba(0,0,0,0.88), rgba(0,0,0,0.92)), url(${heroImg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div
        className="mx-auto flex flex-col items-center justify-center text-center px-6"
        style={{ maxWidth: 980, paddingTop: 80, paddingBottom: 80, margin: "auto" }}
      >
        <h1
          className="font-display anim-fade-up"
          style={{
            fontSize: "clamp(40px, 7vw, 84px)",
            color: "#F8F9FA",
            lineHeight: 1.02,
            letterSpacing: "0.02em",
          }}
        >
          Simples como deve ser.{" "}
          <span
            style={{
              background:
                "linear-gradient(90deg, #009C3B 0%, #009C3B 25%, #FFDF00 40%, #FFDF00 55%, #002776 70%, #002776 85%, #FFFFFF 100%)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
              display: "inline-block",
              fontWeight: 800,
              letterSpacing: "0.04em",
            }}
          >
            BRASILEIRO
          </span>{" "}
          como você.
        </h1>
        <p
          className="anim-fade-up anim-delay-1 mt-6"
          style={{ color: "#ADB5BD", fontSize: 18, maxWidth: 620 }}
        >
          O sistema de agendamento feito para o barbeiro autônomo.
        </p>
        <Link
          to="/cadastro"
          className="btn-primary anim-fade-up anim-delay-2 mt-10"
          style={{ padding: "18px 32px", fontSize: 16 }}
        >
          Criar minha conta grátis — 30 dias sem cartão
        </Link>
        <p className="anim-fade-up anim-delay-3 mt-4" style={{ color: "#ADB5BD", fontSize: 11 }}>
          Sem taxa de adesão. Cancela quando quiser.
        </p>
      </div>
    </section>
  );
}