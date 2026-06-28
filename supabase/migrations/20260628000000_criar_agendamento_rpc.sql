-- 1) RPC para criar agendamento sem expor preco/duracao_minutos
--    O trigger trg_agendamentos_enforce_servico preenche esses campos
--    automaticamente a partir da tabela servicos.
CREATE OR REPLACE FUNCTION public.criar_agendamento(
  p_barbeiro_id     uuid,
  p_servico_id      uuid,
  p_cliente_nome    text,
  p_cliente_whatsapp text,
  p_data_hora       timestamptz,
  p_status          text DEFAULT 'confirmado'
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id uuid;
BEGIN
  INSERT INTO public.agendamentos (
    barbeiro_id,
    servico_id,
    cliente_nome,
    cliente_whatsapp,
    data_hora,
    status
  ) VALUES (
    p_barbeiro_id,
    p_servico_id,
    p_cliente_nome,
    p_cliente_whatsapp,
    p_data_hora,
    p_status
  )
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.criar_agendamento(uuid, uuid, text, text, timestamptz, text)
  TO anon, authenticated;


-- 2) Atualiza get_horarios_ocupados para filtrar apenas status = 'confirmado'
--    (horários cancelados ficam livres imediatamente no link público)
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
    AND a.status = 'confirmado'
    AND a.data_hora >= (p_data::timestamp)
    AND a.data_hora <  ((p_data + 1)::timestamp);
$$;

GRANT EXECUTE ON FUNCTION public.get_horarios_ocupados(uuid, date)
  TO anon, authenticated;
