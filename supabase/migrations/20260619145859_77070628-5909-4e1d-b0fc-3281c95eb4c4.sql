
-- 1) BARBEIROS: remove anon SELECT entirely; expose via SECURITY DEFINER RPC
DROP POLICY IF EXISTS "Leitura pública de campos não-sensíveis" ON public.barbeiros;
REVOKE SELECT ON public.barbeiros FROM anon;

CREATE OR REPLACE FUNCTION public.get_barbeiro_publico(p_slug text)
RETURNS TABLE (
  id uuid,
  nome_profissional text,
  slug text,
  foto_url text,
  cidade text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT b.id, b.nome_profissional, b.slug, b.foto_url, b.cidade
  FROM public.barbeiros b
  WHERE b.slug = p_slug
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.get_barbeiro_publico(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_barbeiro_publico(text) TO anon, authenticated;

-- 2) AGENDAMENTOS: tighten INSERT — preço e duração devem bater com o serviço
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
      AND s.preco = agendamentos.preco
      AND s.duracao_minutos = agendamentos.duracao_minutos
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
      AND s.preco = agendamentos.preco
      AND s.duracao_minutos = agendamentos.duracao_minutos
  )
);
