-- ============================================================================
-- ComeYa! - Seed Data: Cupones
-- Archivo: seed/coupons.sql
-- ============================================================================

INSERT INTO public.coupons (code, discount_percent, max_uses, min_purchase, membership_required, valid_from, valid_until, is_active)
VALUES
  -- Cupón de bienvenida para todos
  ('PRIMERA30', 30, 10000, 0, NULL, NOW(), NOW() + INTERVAL '1 year', TRUE),
  
  -- Cupones exclusivos Premium
  ('PREMIUM20', 20, 5000, 15, 'PREMIUM', NOW(), NOW() + INTERVAL '1 year', TRUE),
  ('PREMIUM15', 15, 99999, 0, 'PREMIUM', NOW(), NOW() + INTERVAL '1 year', TRUE),
  
  -- Cupones promocionales
  ('RESCATE10', 10, 1000, 20, NULL, NOW(), NOW() + INTERVAL '3 months', TRUE),
  ('PLANETA25', 25, 500, 30, NULL, NOW(), NOW() + INTERVAL '1 month', TRUE)
ON CONFLICT (code) DO NOTHING;
