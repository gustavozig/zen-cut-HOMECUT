
-- 1) BARBEIROS: drop public-read of full table, expose safe columns via view
DROP POLICY IF EXISTS "Barbeiros são públicos para leitura" ON public.barbeiros;

CREATE OR REPLACE VIEW public.barbeiros_publicos
WITH (security_invoker = off) AS
SELECT id, nome_profissional, slug, foto_url, cidade
FROM public.barbeiros;

GRANT SELECT ON public.barbeiros_publicos TO anon, authenticated;

-- Authenticated barber can read own full row
DROP POLICY IF EXISTS "Barbeiro lê seu próprio perfil" ON public.barbeiros;
CREATE POLICY "Barbeiro lê seu próprio perfil"
ON public.barbeiros FOR SELECT TO authenticated
USING (auth.uid() = user_id);

-- 2) AGENDAMENTOS: remove public SELECT, expose only busy slots via RPC
DROP POLICY IF EXISTS "Verificação pública de slots ocupados" ON public.agendamentos;

CREATE OR REPLACE FUNCTION public.get_horarios_ocupados(
  p_barbeiro_id uuid,
  p_data date
)
RETURNS TABLE (data_hora timestamptz, duracao_minutos integer)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT a.data_hora, a.duracao_minutos
  FROM public.agendamentos a
  WHERE a.barbeiro_id = p_barbeiro_id
    AND a.status IN ('confirmado','concluido')
    AND a.data_hora >= (p_data::timestamp)
    AND a.data_hora <  ((p_data + 1)::timestamp);
$$;

GRANT EXECUTE ON FUNCTION public.get_horarios_ocupados(uuid, date) TO anon, authenticated;

-- 3) AGENDAMENTOS: harden public INSERT (no slot stuffing / price tampering)
ALTER TABLE public.agendamentos
  ADD CONSTRAINT agendamentos_duracao_chk CHECK (duracao_minutos BETWEEN 5 AND 480),
  ADD CONSTRAINT agendamentos_preco_chk   CHECK (preco >= 0 AND preco < 100000);

CREATE OR REPLACE FUNCTION public.agendamentos_enforce_servico()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  s_dur integer;
  s_preco numeric;
  s_barb uuid;
BEGIN
  SELECT duracao_minutos, preco, barbeiro_id
    INTO s_dur, s_preco, s_barb
  FROM public.servicos
  WHERE id = NEW.servico_id AND ativo = true;

  IF s_barb IS NULL OR s_barb <> NEW.barbeiro_id THEN
    RAISE EXCEPTION 'Serviço inválido para este barbeiro';
  END IF;

  NEW.duracao_minutos := s_dur;
  NEW.preco := s_preco;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_agendamentos_enforce_servico ON public.agendamentos;
CREATE TRIGGER trg_agendamentos_enforce_servico
BEFORE INSERT ON public.agendamentos
FOR EACH ROW EXECUTE FUNCTION public.agendamentos_enforce_servico();
