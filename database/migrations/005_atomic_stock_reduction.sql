-- ============================================================================
-- ComeYa - Descuento atómico de stock al crear items de pedido
-- ============================================================================

CREATE OR REPLACE FUNCTION public.reduce_product_stock()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.products
  SET stock = stock - NEW.quantity
  WHERE id = NEW.product_id
    AND is_active = TRUE
    AND expires_at > NOW()
    AND stock >= NEW.quantity;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Stock insuficiente o producto no disponible'
      USING ERRCODE = 'P0001';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
