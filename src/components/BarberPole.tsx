import { type CSSProperties } from "react";

/**
 * Cilindro listrado animado. Loop perfeito: background-size vertical = 56px
 * (dois ciclos do gradiente de 28px). A animação move o background em
 * exatamente 56px (um período completo), então quando reinicia o padrão já
 * está alinhado — sem faixa em branco.
 */
export function BarberPole({ size = "md" }: { size?: "md" | "sm" }) {
  const h = size === "sm" ? 36 : 44;
  const w = size === "sm" ? 14 : 16;

  const stripes: CSSProperties = {
    width: w,
    height: h - 10,
    overflow: "hidden",
    borderRadius: 4,
    backgroundImage:
      "repeating-linear-gradient(45deg, #C1121F 0 9px, #F8F9FA 9px 18px, #1B2A4A 18px 28px)",
    backgroundSize: "200% 56px",
    backgroundPosition: "0 0",
    animation: "barberpole 2s linear infinite",
  };

  const cap: CSSProperties = {
    width: w + 6,
    height: 5,
    background: "#2B2D42",
    border: "1px solid #ADB5BD",
    borderRadius: 2,
  };

  return (
    <div
      aria-hidden
      style={{
        display: "inline-flex",
        flexDirection: "column",
        alignItems: "center",
        height: h,
        justifyContent: "center",
      }}
    >
      <div style={cap} />
      <div style={stripes} />
      <div style={cap} />
    </div>
  );
}