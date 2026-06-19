const stats = [
  { n: "70%", l: "de redução média de faltas" },
  { n: "30%", l: "mais agendamentos com link 24 horas por dia" },
  { n: "8 mensagens", l: "economizadas por agendamento" },
];

export function Numbers() {
  return (
    <section style={{ padding: "80px 24px", background: "#2B2D42" }} className="hc-section">
      <div
        className="mx-auto grid"
        style={{
          maxWidth: 1100,
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 40,
          alignItems: "start",
        }}
      >
        {stats.map((s, i) => (
          <div
            key={i}
            className="flex flex-col items-center text-center"
            style={{ padding: "0 8px" }}
          >
            <div
              className="font-display"
              style={{
                color: "#C1121F",
                fontSize: "clamp(44px, 6vw, 76px)",
                lineHeight: 1,
              }}
            >
              {s.n}
            </div>
            <p
              style={{
                color: "#ADB5BD",
                fontSize: 14,
                marginTop: 16,
                maxWidth: 240,
                lineHeight: 1.4,
              }}
            >
              {s.l}
            </p>
          </div>
        ))}
      </div>
      <p className="text-center" style={{ color: "#ADB5BD", fontSize: 12, marginTop: 48 }}>
        Média dos usuários HomeCUT
      </p>
      <style>{`
        @media (max-width: 640px) {
          section.hc-section > div:first-child {
            grid-template-columns: 1fr !important;
            gap: 32px !important;
          }
        }
      `}</style>
    </section>
  );
}