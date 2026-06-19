import { useState } from "react";
import { Star } from "lucide-react";
import { SectionTitle } from "./SectionTitle";

type Depo = {
  nome: string;
  cidade: string;
  texto: string;
  foto: string; // path em /public
};

const depoimentos: Depo[] = [
  { nome: "Rafael", cidade: "Joinville · SC", foto: "/rafael.jpg",
    texto: "mano antes era foda, cliente marcava e sumia. agora chega aquele lembrete no zap e o cara aparece. minha agenda tá sempre cheia, virei outro barbeiro" },
  { nome: "Diego", cidade: "Blumenau · SC", foto: "/diego.jpg",
    texto: "botei o link na bio do insta e já caiu uns clientes novo direto. o cara marca de madrugada enquanto eu tô dormindo kkkk muito bom demais" },
  { nome: "Lucas", cidade: "Curitiba · PR", foto: "/lucas.jpg",
    texto: "o que me pegou foi que mudei de barbearia e não perdi ninguém. o link continuou o mesmo, só troquei o endereço e pronto. isso aí não tem preço" },
  { nome: "Mateus", cidade: "Florianópolis · SC", foto: "/mateus.jpg",
    texto: "Cara, me ajudou muito antes ficava anotando quanto entrava as vezes esquecia ou perdia a anotação, com o app consegui organizar certinho da pra saber quanto entrou sem erro, show de mais!" },
  { nome: "Bruno", cidade: "São José · SC", foto: "/bruno.jpg",
    texto: "cara eu era escravo do whatsapp, ficava o dia inteiro respondendo. agora o cliente se vira sozinho e eu só corto. ganhei minha paz de volta" },
  { nome: "Thiago", cidade: "Joinville · SC", foto: "/thiago.jpg",
    texto: "comecei achando que era só mais um app mas me surpreendi. fácil de mexer, o cliente ama agendar sozinho. tô indicando pros parceiro tudo" },
];

function Avatar({ nome, foto }: { nome: string; foto: string }) {
  const [erro, setErro] = useState(false);
  const inicial = nome.charAt(0).toUpperCase();
  return (
    <div
      className="shrink-0 flex items-center justify-center font-display"
      style={{
        width: 52,
        height: 52,
        borderRadius: "50%",
        background: "#2B2D42",
        color: "#C1121F",
        fontSize: 24,
        overflow: "hidden",
        border: "2px solid #C1121F",
      }}
    >
      {!erro ? (
        <img
          src={foto}
          alt={nome}
          loading="lazy"
          onError={() => setErro(true)}
          style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center", display: "block", borderRadius: "50%" }}
        />
      ) : (
        inicial
      )}
    </div>
  );
}

function Card({ d }: { d: Depo }) {
  return (
    <div className="card-hc shrink-0" style={{ width: 340 }}>
      <div className="flex items-center gap-3">
        <Avatar nome={d.nome} foto={d.foto} />
        <div className="min-w-0">
          <div style={{ color: "#F8F9FA", fontWeight: 600, fontSize: 15 }}>{d.nome}</div>
          <div style={{ color: "#ADB5BD", fontSize: 12 }}>{d.cidade}</div>
        </div>
      </div>
      <div className="flex gap-0.5 mt-3">
        {Array.from({ length: 5 }).map((_, k) => (
          <Star key={k} size={15} fill="#FFC107" color="#FFC107" />
        ))}
      </div>
      <p className="mt-3" style={{ color: "#ADB5BD", fontSize: 13, lineHeight: 1.55 }}>
        “{d.texto}”
      </p>
    </div>
  );
}

export function Testimonials() {
  return (
    <section style={{ padding: "80px 0", background: "#000" }} className="hc-section">
      <div className="px-6">
        <SectionTitle>O QUE BARBEIROS ESTÃO DIZENDO</SectionTitle>
      </div>
      <div className="hc-marquee mt-10 overflow-hidden">
        <div className="hc-marquee-track fast gap-6">
          {[...depoimentos, ...depoimentos].map((d, i) => (
            <Card key={i} d={d} />
          ))}
        </div>
      </div>
    </section>
  );
}