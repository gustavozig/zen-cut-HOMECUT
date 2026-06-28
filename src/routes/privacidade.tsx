import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/privacidade")({
  head: () => ({
    meta: [
      { title: "Política de Privacidade — HomeCUT" },
      { name: "description", content: "Como o HomeCUT coleta, usa e protege seus dados pessoais." },
    ],
  }),
  component: Privacidade,
});

function Privacidade() {
  return (
    <div style={{ background: "#000", minHeight: "calc(100vh - 64px)", padding: "48px 16px" }}>
      <div className="mx-auto" style={{ maxWidth: 720 }}>
        <Link to="/" style={{ color: "#ADB5BD", fontSize: 13, display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 32, textDecoration: "none" }}>
          ← Voltar ao início
        </Link>

        <h1 className="font-display" style={{ color: "#F8F9FA", fontSize: 38, letterSpacing: 1 }}>
          POLÍTICA DE PRIVACIDADE
        </h1>
        <p style={{ color: "#ADB5BD", fontSize: 13, marginTop: 8 }}>
          Última atualização: junho de 2026
        </p>

        <div className="flex flex-col gap-10 mt-10">

          <Section title="Quem somos">
            <p>
              O <strong>HomeCUT</strong> é um sistema de agendamento online para barbeiros autônomos,
              operado por <strong>Gustavo Rafael Brietzig</strong>, com sede em Joinville/SC, Brasil.
            </p>
            <p className="mt-3">
              Contato: <a href="mailto:contato@homecut.com.br" style={{ color: "#C1121F" }}>contato@homecut.com.br</a>
            </p>
          </Section>

          <Section title="Dados coletados do barbeiro (usuário cadastrado)">
            <p>Ao criar uma conta, coletamos:</p>
            <ul className="mt-3" style={{ paddingLeft: 20, display: "flex", flexDirection: "column", gap: 6 }}>
              <li>Nome completo e nome profissional</li>
              <li>Endereço de e-mail</li>
              <li>Número de WhatsApp</li>
              <li>Cidade</li>
              <li>URL de foto de perfil (opcional)</li>
            </ul>
            <p className="mt-4" style={{ color: "#ADB5BD", fontSize: 13 }}>
              <strong style={{ color: "#F8F9FA" }}>Base legal:</strong> Execução de contrato — Art. 7º, V, LGPD.
              Esses dados são necessários para operar a conta e disponibilizar os serviços contratados.
            </p>
          </Section>

          <Section title="Dados coletados do cliente (visitante que agenda)">
            <p>Ao realizar um agendamento no link público do barbeiro, coletamos:</p>
            <ul className="mt-3" style={{ paddingLeft: 20, display: "flex", flexDirection: "column", gap: 6 }}>
              <li>Nome completo</li>
              <li>Número de WhatsApp</li>
            </ul>
            <p className="mt-4" style={{ color: "#ADB5BD", fontSize: 13 }}>
              <strong style={{ color: "#F8F9FA" }}>Base legal:</strong> Legítimo interesse — Art. 7º, IX, LGPD.
              Esses dados são usados exclusivamente para confirmar o agendamento e enviar o lembrete via WhatsApp.
            </p>
          </Section>

          <Section title="Como usamos os dados">
            <ul style={{ paddingLeft: 20, display: "flex", flexDirection: "column", gap: 6 }}>
              <li>Criação e gestão da agenda do barbeiro</li>
              <li>Envio de lembretes de agendamento via WhatsApp ao cliente</li>
              <li>Comunicações transacionais por e-mail (confirmação de conta, redefinição de senha)</li>
              <li>Suporte ao usuário</li>
            </ul>
            <p className="mt-4">Não utilizamos seus dados para publicidade ou marketing sem consentimento explícito.</p>
          </Section>

          <Section title="Compartilhamento com terceiros">
            <p>Seus dados são processados pelos seguintes fornecedores, sob contrato de confidencialidade:</p>
            <ul className="mt-3" style={{ paddingLeft: 20, display: "flex", flexDirection: "column", gap: 8 }}>
              <li><strong style={{ color: "#F8F9FA" }}>Supabase</strong> — armazenamento de banco de dados e autenticação (EUA, servidor com adequação contratual)</li>
              <li><strong style={{ color: "#F8F9FA" }}>Z-API</strong> — envio de mensagens WhatsApp (Brasil)</li>
              <li><strong style={{ color: "#F8F9FA" }}>Resend</strong> — envio de e-mails transacionais (EUA, servidor com adequação contratual)</li>
            </ul>
            <p className="mt-4">Não vendemos, alugamos ou compartilhamos seus dados com terceiros para fins comerciais.</p>
          </Section>

          <Section title="Retenção de dados">
            <p>
              Os dados são mantidos enquanto a conta estiver ativa. Após a exclusão da conta, os dados
              são removidos em até <strong>30 dias</strong>, salvo obrigação legal que exija retenção por prazo superior.
            </p>
          </Section>

          <Section title="Seus direitos (Art. 18, LGPD)">
            <p>Você tem direito a:</p>
            <ul className="mt-3" style={{ paddingLeft: 20, display: "flex", flexDirection: "column", gap: 6 }}>
              <li><strong style={{ color: "#F8F9FA" }}>Acesso</strong> — saber quais dados temos sobre você</li>
              <li><strong style={{ color: "#F8F9FA" }}>Correção</strong> — corrigir dados incompletos, inexatos ou desatualizados</li>
              <li><strong style={{ color: "#F8F9FA" }}>Exclusão</strong> — solicitar a remoção dos seus dados</li>
              <li><strong style={{ color: "#F8F9FA" }}>Portabilidade</strong> — receber seus dados em formato estruturado</li>
              <li><strong style={{ color: "#F8F9FA" }}>Revogação do consentimento</strong> — a qualquer momento, sem prejuízo ao tratamento anterior</li>
            </ul>
            <p className="mt-4">
              Para exercer seus direitos, entre em contato pelo e-mail{" "}
              <a href="mailto:contato@homecut.com.br" style={{ color: "#C1121F" }}>contato@homecut.com.br</a>.
              Respondemos em até 15 dias úteis.
            </p>
            <p className="mt-3">
              Barbeiros também podem exportar e excluir seus dados diretamente no painel em{" "}
              <strong>Configurações → Seus dados e privacidade</strong>.
            </p>
          </Section>

          <Section title="Cookies e rastreamento">
            <p>
              Utilizamos apenas cookies técnicos e essenciais para o funcionamento do sistema
              (autenticação e preferências de sessão). Não utilizamos cookies de rastreamento,
              publicidade ou análise comportamental.
            </p>
          </Section>

          <Section title="Encarregado de Proteção de Dados (DPO)">
            <p>
              <strong style={{ color: "#F8F9FA" }}>Gustavo Rafael Brietzig</strong><br />
              <a href="mailto:contato@homecut.com.br" style={{ color: "#C1121F" }}>contato@homecut.com.br</a>
            </p>
          </Section>

          <Section title="Alterações nesta política">
            <p>
              Podemos atualizar esta política periodicamente. Notificaremos usuários cadastrados
              por e-mail em caso de mudanças relevantes. A data da última atualização sempre estará
              indicada no topo desta página.
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
