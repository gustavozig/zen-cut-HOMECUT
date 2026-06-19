
DROP POLICY IF EXISTS "Autenticado pode criar agendamento" ON public.agendamentos;
CREATE POLICY "Autenticado cria agendamento válido"
ON public.agendamentos FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.servicos s
    WHERE s.id = agendamentos.servico_id
      AND s.barbeiro_id = agendamentos.barbeiro_id
      AND s.ativo = true
  )
);
