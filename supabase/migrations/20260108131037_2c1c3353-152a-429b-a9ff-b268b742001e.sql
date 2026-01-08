-- Adicionar coluna de notas internas se não existir
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS internal_notes TEXT;

-- Criar policy para permitir UPDATE de leads por usuários autenticados
CREATE POLICY "Authenticated users can update leads" 
ON public.leads 
FOR UPDATE 
TO authenticated
USING (true)
WITH CHECK (true);