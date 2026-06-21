
-- 1) Z-API columns on barbeiros
ALTER TABLE public.barbeiros
  ADD COLUMN IF NOT EXISTS zapi_instance_id text,
  ADD COLUMN IF NOT EXISTS zapi_token text,
  ADD COLUMN IF NOT EXISTS zapi_client_token text;

-- 2) dias_bloqueados
CREATE TABLE IF NOT EXISTS public.dias_bloqueados (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  barbeiro_id uuid NOT NULL REFERENCES public.barbeiros(id) ON DELETE CASCADE,
  data date NOT NULL,
  criado_em timestamptz NOT NULL DEFAULT now(),
  UNIQUE (barbeiro_id, data)
);

GRANT SELECT, INSERT, DELETE ON public.dias_bloqueados TO authenticated;
GRANT ALL ON public.dias_bloqueados TO service_role;

ALTER TABLE public.dias_bloqueados ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Barbeiro lê seus dias bloqueados"
  ON public.dias_bloqueados FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.barbeiros b WHERE b.id = dias_bloqueados.barbeiro_id AND b.user_id = auth.uid()));

CREATE POLICY "Barbeiro cria seus dias bloqueados"
  ON public.dias_bloqueados FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.barbeiros b WHERE b.id = dias_bloqueados.barbeiro_id AND b.user_id = auth.uid()));

CREATE POLICY "Barbeiro deleta seus dias bloqueados"
  ON public.dias_bloqueados FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.barbeiros b WHERE b.id = dias_bloqueados.barbeiro_id AND b.user_id = auth.uid()));

-- 3) RPC público para ler datas bloqueadas (sem dados sensíveis)
CREATE OR REPLACE FUNCTION public.get_dias_bloqueados(p_barbeiro_id uuid)
RETURNS TABLE(data date)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT d.data FROM public.dias_bloqueados d
  WHERE d.barbeiro_id = p_barbeiro_id AND d.data >= CURRENT_DATE;
$$;
REVOKE ALL ON FUNCTION public.get_dias_bloqueados(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_dias_bloqueados(uuid) TO anon, authenticated;

-- 4) Trigger no agendamentos: 30 min antecedência, 30 dias limite, dia não bloqueado
CREATE OR REPLACE FUNCTION public.agendamentos_validate_window()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  is_owner boolean := false;
BEGIN
  -- Se o próprio barbeiro está criando para si (painel), pula validação de janela
  SELECT EXISTS (SELECT 1 FROM public.barbeiros b WHERE b.id = NEW.barbeiro_id AND b.user_id = auth.uid())
    INTO is_owner;

  IF NOT is_owner THEN
    IF NEW.data_hora < now() + interval '30 minutes' THEN
      RAISE EXCEPTION 'Esse horário não está mais disponível. Escolha um horário com pelo menos 30 minutos de antecedência.';
    END IF;
    IF NEW.data_hora::date > (CURRENT_DATE + 30) THEN
      RAISE EXCEPTION 'Só é possível agendar com até 30 dias de antecedência.';
    END IF;
    IF EXISTS (SELECT 1 FROM public.dias_bloqueados d WHERE d.barbeiro_id = NEW.barbeiro_id AND d.data = NEW.data_hora::date) THEN
      RAISE EXCEPTION 'Esse dia não está disponível para agendamento.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_agendamentos_validate_window ON public.agendamentos;
CREATE TRIGGER trg_agendamentos_validate_window
  BEFORE INSERT ON public.agendamentos
  FOR EACH ROW EXECUTE FUNCTION public.agendamentos_validate_window();
