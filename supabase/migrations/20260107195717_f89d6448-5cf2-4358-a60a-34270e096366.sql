-- Permitir que usuários autenticados leiam todos os leads
CREATE POLICY "Authenticated users can read leads"
ON public.leads
FOR SELECT
TO authenticated
USING (true);