-- ============================================================================
-- ComeYa - Alinear order_items con el modelo EF Core
-- ============================================================================

ALTER TABLE public.order_items
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

ALTER TABLE public.order_items
  DROP COLUMN IF EXISTS subtotal;

ALTER TABLE public.order_items
  ADD COLUMN subtotal DECIMAL(10,2)
  GENERATED ALWAYS AS (price * quantity) STORED;

DROP TRIGGER IF EXISTS update_order_items_updated_at ON public.order_items;

CREATE TRIGGER update_order_items_updated_at
  BEFORE UPDATE ON public.order_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
