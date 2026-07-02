-- ============================================================================
-- Búsqueda multivariada de productos y cercanía por distrito
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_products_name_lower
  ON public.products (LOWER(name));

CREATE INDEX IF NOT EXISTS idx_products_price
  ON public.products (price);

CREATE INDEX IF NOT EXISTS idx_businesses_district_active
  ON public.businesses (district, is_active);

CREATE INDEX IF NOT EXISTS idx_districts_name_active
  ON public.districts (name, is_active);

-- Conserva la función existente y corrige el caso del mismo distrito a 0 km.
CREATE OR REPLACE FUNCTION public.get_distance(district_a TEXT, district_b TEXT)
RETURNS DECIMAL
LANGUAGE plpgsql
STABLE
SET search_path = public
AS $$
DECLARE
  dist DECIMAL;
  a_id INT;
  b_id INT;
BEGIN
  IF district_a IS NULL OR district_b IS NULL THEN
    RETURN NULL;
  END IF;

  IF LOWER(TRIM(district_a)) = LOWER(TRIM(district_b)) THEN
    RETURN 0;
  END IF;

  SELECT id INTO a_id FROM public.districts WHERE name = district_a AND is_active = TRUE;
  SELECT id INTO b_id FROM public.districts WHERE name = district_b AND is_active = TRUE;

  IF a_id IS NULL OR b_id IS NULL THEN
    RETURN NULL;
  END IF;

  SELECT distance_km INTO dist
  FROM public.district_distances
  WHERE (district_a_id = a_id AND district_b_id = b_id)
     OR (district_a_id = b_id AND district_b_id = a_id);

  RETURN dist;
END;
$$;
