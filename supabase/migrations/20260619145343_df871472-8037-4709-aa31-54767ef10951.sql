
-- Remove view (use column-level grants instead, simpler & passes linter)
DROP VIEW IF EXISTS public.barbeiros_publicos;

-- Column-level public read on barbeiros (no email/whatsapp/user_id/criado_em)
REVOKE SELECT ON public.barbeiros FROM anon;
GRANT SELECT (id, nome_profissional, slug, foto_url, cidade) ON public.barbeiros TO anon;

CREATE POLICY "Leitura pública de campos não-sensíveis"
ON public.barbeiros FOR SELECT TO anon
USING (true);

-- Tighten anon INSERT on agendamentos: serviço precisa pertencer ao barbeiro
DROP POLICY IF EXISTS "Qualquer um pode criar agendamento" ON public.agendamentos;
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
