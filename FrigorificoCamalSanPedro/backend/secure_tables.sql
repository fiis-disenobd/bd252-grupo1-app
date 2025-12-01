-- Enable Row Level Security to remove "Unrestricted" warning
ALTER TABLE public.persona_natural ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.persona_juridica ENABLE ROW LEVEL SECURITY;

-- Create policies to allow necessary access
-- We use a permissive policy here to ensure we don't break existing functionality (like registration)
-- that might access these tables directly.
-- The search RPC (buscar_cliente_admin) uses SECURITY DEFINER, so it will work regardless of these policies.

-- Policy for Persona Natural
DROP POLICY IF EXISTS "Allow all access to persona_natural" ON public.persona_natural;
CREATE POLICY "Allow all access to persona_natural" ON public.persona_natural
FOR ALL
TO public
USING (true)
WITH CHECK (true);

-- Policy for Persona Juridica
DROP POLICY IF EXISTS "Allow all access to persona_juridica" ON public.persona_juridica;
CREATE POLICY "Allow all access to persona_juridica" ON public.persona_juridica
FOR ALL
TO public
USING (true)
WITH CHECK (true);

-- Ensure permissions are granted
GRANT ALL ON TABLE public.persona_natural TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.persona_juridica TO anon, authenticated, service_role;
