-- Garantir que a política SELECT de agendamentos para barbeiros autenticados
-- está correta: usa EXISTS com join em barbeiros, não compara auth.uid() com barbeiro_id diretamente.
DROP POLICY IF EXISTS "Agendamentos visíveis para o barbeiro dono" ON public.agendamentos;
CREATE POLICY "Agendamentos visíveis para o barbeiro dono"
ON public.agendamentos FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.barbeiros b
    WHERE b.id = agendamentos.barbeiro_id
      AND b.user_id = auth.uid()
  )
);

-- Remover checagem de preco/duracao_minutos das políticas de INSERT.
-- O trigger trg_agendamentos_enforce_servico preenche esses campos automaticamente
-- a partir da tabela servicos. O RPC criar_agendamento (SECURITY DEFINER) bypassa
-- RLS de qualquer forma, mas corrigimos para clareza.
DROP POLICY IF EXISTS "Público cria agendamento válido" ON public.agendamentos;
CREATE POLICY "Público cria agendamento válido"
ON public.agendamentos FOR INSERT TO anon
WITH CHECK (
  status = 'confirmado'
  AND EXISTS (
    SELECT 1 FROM public.servicos s
    WHERE s.id = agendamentos.servico_id
      AND s.barbeiro_id = agendamentos.barbeiro_id
      AND s.ativo = true
  )
);

DROP POLICY IF EXISTS "Autenticado cria agendamento válido" ON public.agendamentos;
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
