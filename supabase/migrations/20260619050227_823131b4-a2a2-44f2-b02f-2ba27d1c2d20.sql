CREATE TABLE public.barbeiros (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  nome_profissional TEXT NOT NULL,
  email TEXT NOT NULL,
  whatsapp TEXT,
  cidade TEXT,
  foto_url TEXT,
  slug TEXT NOT NULL UNIQUE,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.barbeiros TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.barbeiros TO authenticated;
GRANT ALL ON public.barbeiros TO service_role;
ALTER TABLE public.barbeiros ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Barbeiros são públicos para leitura" ON public.barbeiros FOR SELECT USING (true);
CREATE POLICY "Barbeiro atualiza seu próprio perfil" ON public.barbeiros FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Barbeiro insere seu próprio perfil" ON public.barbeiros FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Barbeiro deleta seu próprio perfil" ON public.barbeiros FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TABLE public.servicos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  barbeiro_id UUID NOT NULL REFERENCES public.barbeiros(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  duracao_minutos INTEGER NOT NULL DEFAULT 30,
  preco NUMERIC(10,2) NOT NULL DEFAULT 0,
  ativo BOOLEAN NOT NULL DEFAULT true,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.servicos TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.servicos TO authenticated;
GRANT ALL ON public.servicos TO service_role;
ALTER TABLE public.servicos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Serviços ativos são públicos" ON public.servicos FOR SELECT USING (true);
CREATE POLICY "Barbeiro gerencia seus serviços" ON public.servicos FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.barbeiros b WHERE b.id = barbeiro_id AND b.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.barbeiros b WHERE b.id = barbeiro_id AND b.user_id = auth.uid()));

CREATE TABLE public.horarios_trabalho (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  barbeiro_id UUID NOT NULL REFERENCES public.barbeiros(id) ON DELETE CASCADE,
  dia_semana SMALLINT NOT NULL CHECK (dia_semana BETWEEN 0 AND 6),
  hora_inicio TIME NOT NULL,
  hora_fim TIME NOT NULL,
  intervalo_inicio TIME,
  intervalo_fim TIME,
  ativo BOOLEAN NOT NULL DEFAULT true,
  UNIQUE(barbeiro_id, dia_semana)
);
GRANT SELECT ON public.horarios_trabalho TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.horarios_trabalho TO authenticated;
GRANT ALL ON public.horarios_trabalho TO service_role;
ALTER TABLE public.horarios_trabalho ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Horários públicos" ON public.horarios_trabalho FOR SELECT USING (true);
CREATE POLICY "Barbeiro gerencia seus horários" ON public.horarios_trabalho FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.barbeiros b WHERE b.id = barbeiro_id AND b.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.barbeiros b WHERE b.id = barbeiro_id AND b.user_id = auth.uid()));

CREATE TABLE public.agendamentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  barbeiro_id UUID NOT NULL REFERENCES public.barbeiros(id) ON DELETE CASCADE,
  servico_id UUID NOT NULL REFERENCES public.servicos(id) ON DELETE RESTRICT,
  cliente_nome TEXT NOT NULL,
  cliente_whatsapp TEXT NOT NULL,
  data_hora TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'confirmado' CHECK (status IN ('confirmado','concluido','falta','cancelado')),
  preco NUMERIC(10,2) NOT NULL DEFAULT 0,
  duracao_minutos INTEGER NOT NULL DEFAULT 30,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.agendamentos TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.agendamentos TO authenticated;
GRANT ALL ON public.agendamentos TO service_role;
ALTER TABLE public.agendamentos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Agendamentos visíveis para o barbeiro dono" ON public.agendamentos FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.barbeiros b WHERE b.id = barbeiro_id AND b.user_id = auth.uid()));
CREATE POLICY "Verificação pública de slots ocupados" ON public.agendamentos FOR SELECT TO anon USING (true);
CREATE POLICY "Qualquer um pode criar agendamento" ON public.agendamentos FOR INSERT TO anon WITH CHECK (status = 'confirmado');
CREATE POLICY "Autenticado pode criar agendamento" ON public.agendamentos FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Barbeiro atualiza seus agendamentos" ON public.agendamentos FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.barbeiros b WHERE b.id = barbeiro_id AND b.user_id = auth.uid()));
CREATE POLICY "Barbeiro deleta seus agendamentos" ON public.agendamentos FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.barbeiros b WHERE b.id = barbeiro_id AND b.user_id = auth.uid()));

CREATE INDEX idx_agendamentos_barbeiro_data ON public.agendamentos(barbeiro_id, data_hora);

CREATE TABLE public.clientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  barbeiro_id UUID NOT NULL REFERENCES public.barbeiros(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  ultimo_agendamento TIMESTAMPTZ,
  total_agendamentos INTEGER NOT NULL DEFAULT 0,
  UNIQUE(barbeiro_id, whatsapp)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.clientes TO authenticated;
GRANT ALL ON public.clientes TO service_role;
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Barbeiro gerencia seus clientes" ON public.clientes FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.barbeiros b WHERE b.id = barbeiro_id AND b.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.barbeiros b WHERE b.id = barbeiro_id AND b.user_id = auth.uid()));