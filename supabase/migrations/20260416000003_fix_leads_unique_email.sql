-- Adiciona restrição de unicidade ao email para permitir UPSERT sem erro 400
-- Remove duplicados mantendo o mais recente antes de aplicar a constraint
DELETE FROM public.leads
WHERE id IN (
    SELECT id
    FROM (
        SELECT id,
        ROW_NUMBER() OVER (partition BY email ORDER BY created_at DESC) AS rnum
        FROM public.leads
    ) t
    WHERE t.rnum > 1
);

ALTER TABLE public.leads ADD CONSTRAINT leads_email_unique UNIQUE (email);
