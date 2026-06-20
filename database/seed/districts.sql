-- ============================================================================
-- ComeYa! - Seed Data: Distritos
-- Archivo: seed/districts.sql
-- ============================================================================

-- Insertar distritos de Lima
INSERT INTO public.districts (name) VALUES
  ('San Martin de Porres'),
  ('Comas'),
  ('Los Olivos'),
  ('Independencia'),
  ('San Juan de Miraflores'),
  ('Villa el Salvador'),
  ('Chorrillos'),
  ('El Agustino'),
  ('Ate'),
  ('Santa Anita')
ON CONFLICT (name) DO NOTHING;

-- Insertar matriz de distancias
-- Nota: Solo insertamos una dirección (A->B), la función get_distance busca en ambas direcciones
INSERT INTO public.district_distances (district_a_id, district_b_id, distance_km)
SELECT a.id, b.id, d.distance
FROM (VALUES
  ('San Martin de Porres', 'Comas', 6.0),
  ('San Martin de Porres', 'Los Olivos', 4.0),
  ('San Martin de Porres', 'Independencia', 3.0),
  ('San Martin de Porres', 'San Juan de Miraflores', 20.0),
  ('San Martin de Porres', 'Villa el Salvador', 25.0),
  ('San Martin de Porres', 'Chorrillos', 18.0),
  ('San Martin de Porres', 'El Agustino', 15.0),
  ('San Martin de Porres', 'Ate', 18.0),
  ('San Martin de Porres', 'Santa Anita', 20.0),
  ('Comas', 'Los Olivos', 5.0),
  ('Comas', 'Independencia', 8.0),
  ('Comas', 'San Juan de Miraflores', 25.0),
  ('Comas', 'Villa el Salvador', 30.0),
  ('Comas', 'Chorrillos', 23.0),
  ('Comas', 'El Agustino', 20.0),
  ('Comas', 'Ate', 22.0),
  ('Comas', 'Santa Anita', 24.0),
  ('Los Olivos', 'Independencia', 6.0),
  ('Los Olivos', 'San Juan de Miraflores', 22.0),
  ('Los Olivos', 'Villa el Salvador', 27.0),
  ('Los Olivos', 'Chorrillos', 20.0),
  ('Los Olivos', 'El Agustino', 17.0),
  ('Los Olivos', 'Ate', 19.0),
  ('Los Olivos', 'Santa Anita', 21.0),
  ('Independencia', 'San Juan de Miraflores', 18.0),
  ('Independencia', 'Villa el Salvador', 23.0),
  ('Independencia', 'Chorrillos', 16.0),
  ('Independencia', 'El Agustino', 12.0),
  ('Independencia', 'Ate', 15.0),
  ('Independencia', 'Santa Anita', 17.0),
  ('San Juan de Miraflores', 'Villa el Salvador', 5.0),
  ('San Juan de Miraflores', 'Chorrillos', 8.0),
  ('San Juan de Miraflores', 'El Agustino', 15.0),
  ('San Juan de Miraflores', 'Ate', 12.0),
  ('San Juan de Miraflores', 'Santa Anita', 14.0),
  ('Villa el Salvador', 'Chorrillos', 10.0),
  ('Villa el Salvador', 'El Agustino', 20.0),
  ('Villa el Salvador', 'Ate', 17.0),
  ('Villa el Salvador', 'Santa Anita', 19.0),
  ('Chorrillos', 'El Agustino', 12.0),
  ('Chorrillos', 'Ate', 10.0),
  ('Chorrillos', 'Santa Anita', 12.0),
  ('El Agustino', 'Ate', 5.0),
  ('El Agustino', 'Santa Anita', 7.0),
  ('Ate', 'Santa Anita', 4.0)
) AS d(district_a, district_b, distance)
JOIN public.districts a ON a.name = d.district_a
JOIN public.districts b ON b.name = d.district_b
ON CONFLICT DO NOTHING;
