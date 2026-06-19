import { UserPlus, Link2, Scissors } from "lucide-react";
import { SectionTitle } from "./SectionTitle";

const steps = [
  { icon: UserPlus, t: "Crie sua conta em 2 minutos" },
  { icon: Link2, t: "Coloque seu link na bio do Instagram" },
  { icon: Scissors, t: "Clientes agendam. Você corta." },
];

export function Steps() {
  return (
    <section style={{ padding: "56px 24px", background: "#000" }} className="hc-section">
      <SectionTitle small>SIMPLES ASSIM</SectionTitle>
      <div
        className="mx-auto mt-10 flex items-start justify-center gap-3 md:gap-6 flex-col md:flex-row"
        style={{ maxWidth: 900 }}
      >
        {steps.map((s, i) => (
          <div key={i} className="flex md:flex-col items-center text-left md:text-center gap-3 md:gap-2 flex-1">
            <div
              className="flex items-center justify-center shrink-0"
              style={{
                width: 48,
                height: 48,
                borderRadius: "50%",
                background: "#2B2D42",
                border: "2px solid #C1121F",
              }}
            >
              <s.icon size={22} color="#C1121F" />
            </div>
            <div className="min-w-0">
              <div className="font-display" style={{ color: "#C1121F", fontSize: 16, lineHeight: 1 }}>
                0{i + 1}
              </div>
              <p style={{ color: "#F8F9FA", fontSize: 14, marginTop: 4 }}>{s.t}</p>
            </div>
            {i < steps.length - 1 && (
              <div
                aria-hidden
                className="hidden md:block self-center"
                style={{ flex: 0, width: 32, height: 2, background: "#C1121F", opacity: 0.6 }}
              />
            )}
          </div>
        ))}
      </div>
    </section>
  );
}