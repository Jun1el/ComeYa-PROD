-- ============================================================================
-- ComeYa - Rol superadmin para métricas globales y análisis histórico
-- ============================================================================

ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('customer', 'owner', 'admin', 'superadmin'));

-- Ejecutar manualmente para promover un usuario existente:
-- UPDATE public.profiles
-- SET role = 'superadmin', updated_at = NOW()
-- WHERE email = 'correo@ejemplo.com';
