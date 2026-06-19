export function SectionTitle({ children, small = false }: { children: React.ReactNode; small?: boolean }) {
  return (
    <div className="text-center">
      <h2
        className="font-display"
        style={{
          fontSize: small ? "clamp(26px, 4vw, 38px)" : "clamp(32px, 5vw, 52px)",
          color: "#F8F9FA",
          lineHeight: 1.05,
        }}
      >
        {children}
      </h2>
      <span
        style={{
          display: "block",
          width: small ? 28 : 40,
          height: 3,
          background: "#C1121F",
          borderRadius: 2,
          margin: "12px auto 0",
        }}
      />
    </div>
  );
}