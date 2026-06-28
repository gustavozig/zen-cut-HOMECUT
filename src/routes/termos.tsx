import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/termos")({
  head: () => ({
    meta: [
      { title: "Termos de Uso — HomeCUT" },
      { name: "description", content: "Termos e condições de uso da plataforma HomeCUT." },
    ],
  }),
  component: Termos,
});

function Termos() {
  return (
    <div style={{ background: "#000", minHeight: "calc(100vh - 64px)", padding: "48px 16px" }}>
      <div className="mx-auto" style={{ maxWidth: 720 }}>
        <Link to="/" style={{ color: "#ADB5BD", fontSize: 13, display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 32, textDecoration: "none" }}>
          ← Voltar ao início
        </Link>

        <h1 className="font-display" style={{ color: "#F8F9FA", fontSize: 38, letterSpacing: 1 }}>
          TERMOS DE USO
        </h1>
        <p style={{ color: "#ADB5BD", fontSize: 13, marginTop: 8 }}>
          Última atualização: junho de 2026
        </p>

        <div className="flex flex-col gap-10 mt-10">

          <Section title="O serviço">
            <p>
              O <strong>HomeCUT</strong> é uma plataforma de agendamento online desenvolvida para
              barbeiros autônomos. Ao criar uma conta, o barbeiro obtém um link público personalizado
              onde seus clientes podem escolher serviços, dias e horários disponíveis e confirmar
              agendamentos diretamente, sem necessidade de ligação ou mensagem.
            </p>
          </Section>

          <Section title="Conta e responsabilidade do usuário">
            <p>Ao criar uma conta no HomeCUT, você declara que:</p>
            <ul className="mt-3" style={{ paddingLeft: 20, display: "flex", flexDirection: "column", gap: 6 }}>
              <li>As informações fornecidas são verdadeiras e atualizadas</li>
              <li>Você é responsável pela segurança das suas credenciais de acesso</li>
              <li>Você é responsável por todos os agendamentos realizados através do seu link público</li>
              <li>Você não utilizará o serviço em nome de terceiros sem autorização</li>
            </ul>
            <p className="mt-4">
              Em caso de acesso não autorizado à sua conta, entre em contato imediatamente pelo
              e-mail <a href="mailto:contato@homecut.com.br" style={{ color: "#C1121F" }}>contato@homecut.com.br</a>.
            </p>
          </Section>

          <Section title="Plano e pagamento">
            <p>
              O HomeCUT oferece <strong style={{ color: "#F8F9FA" }}>30 dias de teste grátis</strong>,
              sem necessidade de cartão de crédito. Após o período de teste, o serviço é cobrado no
              valor de <strong style={{ color: "#F8F9FA" }}>R$ 79,00 por mês</strong>.
            </p>
            <ul className="mt-3" style={{ paddingLeft: 20, display: "flex", flexDirection: "column", gap: 6 }}>
              <li>Sem taxa de adesão ou fidelidade</li>
              <li>Cancelamento a qualquer momento, sem multa</li>
              <li>Acesso encerrado ao final do período já pago</li>
              <li>Não há reembolso proporcional para cancelamentos no meio do ciclo</li>
            </ul>
          </Section>

          <Section title="Uso aceitável">
            <p>É expressamente proibido:</p>
            <ul className="mt-3" style={{ paddingLeft: 20, display: "flex", flexDirection: "column", gap: 6 }}>
              <li>Utilizar o HomeCUT para atividades ilegais ou fraudulentas</li>
              <li>Enviar spam ou comunicações não solicitadas aos clientes</li>
              <li>Revender, sublicenciar ou reproduzir o serviço para terceiros</li>
              <li>Tentar acessar sistemas ou dados de outros usuários</li>
              <li>Usar o serviço para fins que não sejam gestão de agenda de barbeiro autônomo</li>
            </ul>
            <p className="mt-4">
              O descumprimento destas regras pode resultar no encerramento imediato da conta,
              sem reembolso do período restante.
            </p>
          </Section>

          <Section title="Disponibilidade do serviço">
            <p>
              O HomeCUT se compromete a manter o serviço disponível com o melhor esforço, mas
              não garante disponibilidade ininterrupta. Manutenções programadas serão comunicadas
              com antecedência sempre que possível.
            </p>
            <p className="mt-3">
              Não nos responsabilizamos por agendamentos perdidos em decorrência de indisponibilidade
              técnica fora do nosso controle, como interrupções em provedores de infraestrutura.
            </p>
          </Section>

          <Section title="Limitação de responsabilidade">
            <p>
              O HomeCUT é uma ferramenta de gestão de agenda. A relação entre o barbeiro e seus clientes
              é de inteira responsabilidade do barbeiro. Não nos responsabilizamos por:
            </p>
            <ul className="mt-3" style={{ paddingLeft: 20, display: "flex", flexDirection: "column", gap: 6 }}>
              <li>Faltas, cancelamentos ou conflitos entre barbeiro e cliente</li>
              <li>Perdas financeiras decorrentes do uso ou não-uso do sistema</li>
              <li>Conteúdo inserido pelos usuários na plataforma</li>
            </ul>
          </Section>

          <Section title="Alterações nos termos">
            <p>
              Podemos modificar estes Termos de Uso a qualquer momento. Notificaremos usuários
              cadastrados por e-mail com pelo menos 10 dias de antecedência em caso de mudanças
              relevantes. O uso continuado do serviço após a vigência das alterações implica
              aceitação dos novos termos.
            </p>
          </Section>

          <Section title="Lei aplicável e foro">
            <p>
              Estes termos são regidos pelas leis da República Federativa do Brasil. Em caso de
              litígio, fica eleito o foro da Comarca de Joinville, Santa Catarina, com renúncia
              expressa a qualquer outro.
            </p>
          </Section>

          <Section title="Contato">
            <p>
              Dúvidas sobre estes Termos de Uso? Entre em contato:<br />
              <a href="mailto:contato@homecut.com.br" style={{ color: "#C1121F" }}>contato@homecut.com.br</a>
            </p>
          </Section>

        </div>

        <div className="mt-16 text-center">
          <Link to="/" style={{ color: "#ADB5BD", fontSize: 13, textDecoration: "none" }}>
            ← Voltar ao início
          </Link>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <div style={{ height: 2, width: 36, background: "#C1121F", marginBottom: 14 }} />
      <h2 className="font-display" style={{ color: "#F8F9FA", fontSize: 20, letterSpacing: 0.5, marginBottom: 12 }}>
        {title}
      </h2>
      <div style={{ color: "#ADB5BD", fontSize: 15, lineHeight: 1.7 }}>
        {children}
      </div>
    </section>
  );
}
