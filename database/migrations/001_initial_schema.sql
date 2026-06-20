-- ============================================================================
-- ComeYa! - Schema Inicial
-- Migración: 001_initial_schema.sql
-- Descripción: Tablas principales del sistema
-- ============================================================================

-- Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- PROFILES: Extiende auth.users de Supabase
-- ============================================================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'owner', 'admin')),
  district TEXT,
  membership TEXT NOT NULL DEFAULT 'FREE' CHECK (membership IN ('FREE', 'PREMIUM')),
  membership_date TIMESTAMPTZ,
  business_name TEXT,
  business_phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE INDEX idx_profiles_district ON public.profiles(district);
CREATE INDEX idx_profiles_membership ON public.profiles(membership);

-- ============================================================================
-- BUSINESSES: Restaurantes/Negocios
-- ============================================================================
CREATE TABLE public.businesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  district TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  logo_url TEXT,
  rating DECIMAL(2,1) DEFAULT 0.0 CHECK (rating >= 0 AND rating <= 5),
  total_ratings INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_businesses_owner ON public.businesses(owner_id);
CREATE INDEX idx_businesses_district ON public.businesses(district);
CREATE INDEX idx_businesses_active ON public.businesses(is_active);

-- ============================================================================
-- PRODUCTS: Productos con vencimiento
-- ============================================================================
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('Comidas', 'Postres', 'Bebidas', 'Panadería')),
  price DECIMAL(10,2) NOT NULL CHECK (price > 0),
  original_price DECIMAL(10,2) NOT NULL CHECK (original_price >= price),
  image_url TEXT,
  stock INT NOT NULL DEFAULT 1 CHECK (stock >= 0),
  expires_at TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_products_business ON public.products(business_id);
CREATE INDEX idx_products_category ON public.products(category);
CREATE INDEX idx_products_expires ON public.products(expires_at);
CREATE INDEX idx_products_active_expires ON public.products(is_active, expires_at) WHERE is_active = TRUE;

-- ============================================================================
-- ORDERS: Pedidos (uno por restaurante)
-- ============================================================================
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES public.profiles(id),
  business_id UUID NOT NULL REFERENCES public.businesses(id),
  status TEXT NOT NULL DEFAULT 'pending' 
    CHECK (status IN ('pending', 'confirmed', 'preparing', 'onway', 'delivered', 'cancelled')),
  subtotal DECIMAL(10,2) NOT NULL,
  shipping_cost DECIMAL(10,2) NOT NULL DEFAULT 0,
  discount DECIMAL(10,2) DEFAULT 0,
  coupon_code TEXT,
  total DECIMAL(10,2) NOT NULL,
  payment_method TEXT NOT NULL DEFAULT 'cash' CHECK (payment_method IN ('cash', 'card')),
  delivery_address TEXT,
  delivery_district TEXT,
  estimated_delivery TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_orders_customer ON public.orders(customer_id);
CREATE INDEX idx_orders_business ON public.orders(business_id);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_orders_created ON public.orders(created_at DESC);

-- ============================================================================
-- ORDER_ITEMS: Items de cada orden
-- ============================================================================
CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id),
  name TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  quantity INT NOT NULL CHECK (quantity > 0),
  subtotal DECIMAL(10,2) NOT NULL
);

CREATE INDEX idx_order_items_order ON public.order_items(order_id);
CREATE INDEX idx_order_items_product ON public.order_items(product_id);

-- ============================================================================
-- COUPONS: Cupones disponibles
-- ============================================================================
CREATE TABLE public.coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  discount_percent INT NOT NULL CHECK (discount_percent > 0 AND discount_percent <= 100),
  max_uses INT NOT NULL CHECK (max_uses > 0),
  current_uses INT DEFAULT 0,
  min_purchase DECIMAL(10,2) DEFAULT 0,
  membership_required TEXT CHECK (membership_required IS NULL OR membership_required IN ('FREE', 'PREMIUM')),
  valid_from TIMESTAMPTZ DEFAULT NOW(),
  valid_until TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_coupons_code ON public.coupons(code);
CREATE INDEX idx_coupons_active ON public.coupons(is_active, valid_until);

-- ============================================================================
-- COUPON_USAGE: Registro de uso de cupones por usuario
-- ============================================================================
CREATE TABLE public.coupon_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  coupon_id UUID NOT NULL REFERENCES public.coupons(id) ON DELETE CASCADE,
  order_id UUID REFERENCES public.orders(id),
  used_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, coupon_id, order_id)
);

CREATE INDEX idx_coupon_usage_user ON public.coupon_usage(user_id);
CREATE INDEX idx_coupon_usage_coupon ON public.coupon_usage(coupon_id);

-- ============================================================================
-- MESSAGES: Chat entre cliente y restaurante
-- ============================================================================
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles(id),
  sender_role TEXT NOT NULL CHECK (sender_role IN ('customer', 'owner')),
  content TEXT NOT NULL CHECK (char_length(content) > 0 AND char_length(content) <= 2000),
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_messages_order ON public.messages(order_id);
CREATE INDEX idx_messages_sender ON public.messages(sender_id);
CREATE INDEX idx_messages_created ON public.messages(created_at);

-- ============================================================================
-- COMPLAINTS: Reclamos
-- ============================================================================
CREATE TABLE public.complaints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id),
  customer_id UUID NOT NULL REFERENCES public.profiles(id),
  category TEXT NOT NULL CHECK (category IN ('product', 'service', 'delivery')),
  subject TEXT NOT NULL CHECK (char_length(subject) > 0 AND char_length(subject) <= 200),
  description TEXT NOT NULL CHECK (char_length(description) > 0 AND char_length(description) <= 5000),
  status TEXT NOT NULL DEFAULT 'pending' 
    CHECK (status IN ('pending', 'in_progress', 'resolved', 'rejected')),
  resolution_notes TEXT,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_complaints_order ON public.complaints(order_id);
CREATE INDEX idx_complaints_customer ON public.complaints(customer_id);
CREATE INDEX idx_complaints_status ON public.complaints(status);

-- ============================================================================
-- COMPLAINT_RESPONSES: Respuestas a reclamos
-- ============================================================================
CREATE TABLE public.complaint_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_id UUID NOT NULL REFERENCES public.complaints(id) ON DELETE CASCADE,
  responder_id UUID NOT NULL REFERENCES public.profiles(id),
  content TEXT NOT NULL CHECK (char_length(content) > 0 AND char_length(content) <= 2000),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_complaint_responses_complaint ON public.complaint_responses(complaint_id);

-- ============================================================================
-- PAYMENT_CARDS: Tarjetas guardadas (solo referencia, no datos sensibles)
-- ============================================================================
CREATE TABLE public.payment_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  card_brand TEXT NOT NULL CHECK (card_brand IN ('visa', 'mastercard', 'amex', 'other')),
  last_four TEXT NOT NULL CHECK (char_length(last_four) = 4),
  cardholder_name TEXT NOT NULL,
  expiry_month INT NOT NULL CHECK (expiry_month >= 1 AND expiry_month <= 12),
  expiry_year INT NOT NULL CHECK (expiry_year >= EXTRACT(YEAR FROM NOW())),
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_payment_cards_user ON public.payment_cards(user_id);

-- ============================================================================
-- NOTIFICATIONS: Notificaciones del sistema
-- ============================================================================
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('coupon', 'offer', 'order', 'system', 'chat')),
  related_id UUID,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON public.notifications(user_id);
CREATE INDEX idx_notifications_read ON public.notifications(is_read);
CREATE INDEX idx_notifications_created ON public.notifications(created_at DESC);

-- ============================================================================
-- USER_STATS: Estadísticas de impacto del usuario
-- ============================================================================
CREATE TABLE public.user_stats (
  user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  meals_rescued INT DEFAULT 0,
  money_saved DECIMAL(10,2) DEFAULT 0,
  co2_avoided DECIMAL(10,2) DEFAULT 0,
  total_orders INT DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- DISTRICTS: Distritos de Lima
-- ============================================================================
CREATE TABLE public.districts (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE
);

-- ============================================================================
-- DISTRICT_DISTANCES: Matriz de distancias entre distritos
-- ============================================================================
CREATE TABLE public.district_distances (
  district_a_id INT REFERENCES public.districts(id) ON DELETE CASCADE,
  district_b_id INT REFERENCES public.districts(id) ON DELETE CASCADE,
  distance_km DECIMAL(5,2) NOT NULL CHECK (distance_km >= 0),
  PRIMARY KEY (district_a_id, district_b_id)
);

-- ============================================================================
-- FUNCTIONS: Funciones auxiliares
-- ============================================================================

-- Calcular distancia entre dos distritos
CREATE OR REPLACE FUNCTION public.get_distance(district_a TEXT, district_b TEXT)
RETURNS DECIMAL AS $$
DECLARE
  dist DECIMAL;
  a_id INT;
  b_id INT;
BEGIN
  SELECT id INTO a_id FROM public.districts WHERE name = district_a;
  SELECT id INTO b_id FROM public.districts WHERE name = district_b;
  
  IF a_id IS NULL OR b_id IS NULL THEN
    RETURN 5.0; -- default
  END IF;
  
  SELECT distance_km INTO dist 
  FROM public.district_distances 
  WHERE (district_a_id = a_id AND district_b_id = b_id)
     OR (district_a_id = b_id AND district_b_id = a_id);
  
  RETURN COALESCE(dist, 5.0);
END;
$$ LANGUAGE plpgsql STABLE;

-- Calcular costo de envío basado en distancia
CREATE OR REPLACE FUNCTION public.calculate_shipping(distance_km DECIMAL)
RETURNS DECIMAL AS $$
BEGIN
  IF distance_km <= 10 THEN
    RETURN 4.00;
  ELSIF distance_km <= 25 THEN
    RETURN 6.00;
  ELSE
    RETURN 8.00;
  END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Validar cupón
CREATE OR REPLACE FUNCTION public.validate_coupon(
  p_coupon_code TEXT,
  p_user_id UUID,
  p_subtotal DECIMAL
)
RETURNS TABLE (
  valid BOOLEAN,
  coupon_id UUID,
  discount_percent INT,
  error_message TEXT
) AS $$
DECLARE
  v_coupon RECORD;
  v_usage_count INT;
  v_user_membership TEXT;
BEGIN
  -- Buscar cupón
  SELECT * INTO v_coupon 
  FROM public.coupons 
  WHERE code = UPPER(p_coupon_code) 
    AND is_active = TRUE 
    AND (valid_until IS NULL OR valid_until > NOW())
    AND valid_from <= NOW();
  
  IF v_coupon IS NULL THEN
    RETURN QUERY SELECT FALSE, NULL::UUID, NULL::INT, 'Cupón no válido o expirado'::TEXT;
    RETURN;
  END IF;
  
  -- Verificar usos máximos globales
  IF v_coupon.current_uses >= v_coupon.max_uses THEN
    RETURN QUERY SELECT FALSE, NULL::UUID, NULL::INT, 'Cupón agotado'::TEXT;
    RETURN;
  END IF;
  
  -- Verificar compra mínima
  IF p_subtotal < v_coupon.min_purchase THEN
    RETURN QUERY SELECT FALSE, NULL::UUID, NULL::INT, 
      FORMAT('Compra mínima requerida: S/ %s', v_coupon.min_purchase)::TEXT;
    RETURN;
  END IF;
  
  -- Verificar membresía del usuario
  SELECT membership INTO v_user_membership FROM public.profiles WHERE id = p_user_id;
  
  IF v_coupon.membership_required = 'PREMIUM' AND v_user_membership != 'PREMIUM' THEN
    RETURN QUERY SELECT FALSE, NULL::UUID, NULL::INT, 'Cupón exclusivo para miembros Premium'::TEXT;
    RETURN;
  END IF;
  
  -- Verificar usos por usuario
  SELECT COUNT(*) INTO v_usage_count 
  FROM public.coupon_usage 
  WHERE user_id = p_user_id AND coupon_id = v_coupon.id;
  
  -- Límite de 3 usos por usuario para cupones generales
  IF v_usage_count >= 3 THEN
    RETURN QUERY SELECT FALSE, NULL::UUID, NULL::INT, 'Ya usaste este cupón el máximo de veces'::TEXT;
    RETURN;
  END IF;
  
  RETURN QUERY SELECT TRUE, v_coupon.id, v_coupon.discount_percent, NULL::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- UPDATED_AT TRIGGER: Actualizar timestamp automáticamente
-- ============================================================================
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_businesses_updated_at
  BEFORE UPDATE ON public.businesses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_complaints_updated_at
  BEFORE UPDATE ON public.complaints
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
