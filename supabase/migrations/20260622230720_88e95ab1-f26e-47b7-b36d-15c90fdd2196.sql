ALTER TABLE public.agendamentos ADD COLUMN IF NOT EXISTS lembrete_enviado boolean NOT NULL DEFAULT false;
ALTER TABLE public.clientes ADD COLUMN IF NOT EXISTS reativacao_enviada_em timestamptz;
CREATE INDEX IF NOT EXISTS idx_agendamentos_lembrete ON public.agendamentos (data_hora) WHERE lembrete_enviado = false AND status = 'confirmado';