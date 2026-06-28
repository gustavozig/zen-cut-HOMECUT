-- ============================================================
-- FIX 1: Política de UPDATE em agendamentos
-- Adiciona WITH CHECK explícito para garantir que o barbeiro
-- autenticado consegue atualizar seus próprios agendamentos.
-- ============================================================
DROP POLICY IF EXISTS "Barbeiro atualiza seus agendamentos" ON public.agendamentos;

CREATE POLICY "Barbeiro atualiza seus agendamentos"
ON public.agendamentos
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.barbeiros b
    WHERE b.id = agendamentos.barbeiro_id
      AND b.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.barbeiros b
    WHERE b.id = agendamentos.barbeiro_id
      AND b.user_id = auth.uid()
  )
);

-- ============================================================
-- FIX 2: get_horarios_ocupados filtra APENAS status='confirmado'
-- Slots cancelados ficam livres imediatamente no link público.
-- ============================================================
CREATE OR REPLACE FUNCTION public.get_horarios_ocupados(
  p_barbeiro_id uuid,
  p_data        date
)
RETURNS TABLE (data_hora timestamptz, duracao_minutos integer)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT a.data_hora, a.duracao_minutos
  FROM   public.agendamentos a
  WHERE  a.barbeiro_id     = p_barbeiro_id
    AND  a.status          = 'confirmado'
    AND  a.data_hora      >= p_data::timestamptz
    AND  a.data_hora       < (p_data + 1)::timestamptz;
$$;

REVOKE ALL ON FUNCTION public.get_horarios_ocupados(uuid, date) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_horarios_ocupados(uuid, date) TO anon, authenticated;
