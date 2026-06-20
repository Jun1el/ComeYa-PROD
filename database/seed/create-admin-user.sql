-- Script para crear usuario admin manualmente en Supabase
-- Ejecuta esto en SQL Editor de Supabase después de registrar un usuario como owner

-- OPCIÓN 1: Actualizar un usuario existente a owner
-- Reemplaza 'tu-email@ejemplo.com' con el email del usuario que registraste
UPDATE public.profiles 
SET role = 'owner', 
    business_name = COALESCE(business_name, 'Mi Negocio')
WHERE email = 'tu-email@ejemplo.com';

-- OPCIÓN 2: Crear un negocio para el usuario owner
-- Primero obtén el ID del usuario:
-- SELECT id, email, full_name FROM public.profiles WHERE email = 'tu-email@ejemplo.com';
-- Luego ejecuta:
-- INSERT INTO public.businesses (owner_id, name, district, phone)
-- VALUES ('UUID-DEL-USUARIO', 'Mi Negocio', 'Los Olivos', '987654321');

-- Verificar que todo esté correcto:
SELECT 
  p.id,
  p.email,
  p.full_name,
  p.role,
  p.district,
  p.business_name,
  b.id as business_id,
  b.name as business_name_db
FROM public.profiles p
LEFT JOIN public.businesses b ON b.owner_id = p.id
WHERE p.role = 'owner';
