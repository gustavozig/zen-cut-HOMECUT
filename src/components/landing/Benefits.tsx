import { CalendarX, MessageCircleOff, Lock, Heart, LineChart } from "lucide-react";
import { SectionTitle } from "./SectionTitle";

const benefits = [
  { icon: CalendarX, title: "CHEGA DE FALTA SEM AVISO",
    text: "Lembrete automático no WhatsApp do cliente 2 horas antes do corte." },
  { icon: MessageCircleOff, title: "PARE DE SER SECRETÁRIO",
    text: "Cliente agenda pelo seu link. Você só aparece pra cortar." },
  { icon: Lock, title: "SUA AGENDA VAI COM VOCÊ",
    text: "Mudou de espaço? Seu link continua o mesmo." },
  { icon: Heart, title: "CLIENTE QUE SOME, VOLTA",
    text: "O sistema chama de volta quem não aparece há um tempo. Automático." },
  { icon: LineChart, title: "SAIBA QUANTO VOCÊ FATURA",
    text: "Veja seus ganhos do dia, semana e mês sem fazer conta nenhuma." },
];

export function Benefits() {
  return (
    <section style={{ padding: "80px 0", background: "#000" }} className="hc-section">
      <div className="px-6">
        <SectionTitle>POR QUE BARBEIROS ESCOLHEM O HOMECUT</SectionTitle>
      </div>
      <div className="hc-marquee mt-10 overflow-hidden">
        <div className="hc-marquee-track gap-6">
          {[...benefits, ...benefits].map((b, i) => (
            <div key={i} className="card-hc shrink-0" style={{ width: 320, padding: 26 }}>
              <b.icon size={38} color="#C1121F" strokeWidth={1.6} />
              <h3 className="font-display mt-4" style={{ fontSize: 22, color: "#F8F9FA", letterSpacing: 1 }}>
                {b.title}
              </h3>
              <p className="mt-2" style={{ color: "#ADB5BD", fontSize: 14, lineHeight: 1.55 }}>
                {b.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}