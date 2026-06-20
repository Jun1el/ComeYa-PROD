-- ============================================================================
-- ComeYa! - Triggers y Funciones
-- Migración: 003_functions_triggers.sql
-- Descripción: Triggers automáticos para auth y estadísticas
-- ============================================================================

-- ============================================================================
-- TRIGGER: Auto-crear profile cuando Supabase Auth crea un usuario
-- ============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role TEXT;
  user_district TEXT;
  user_business_name TEXT;
BEGIN
  -- Extraer metadata del usuario
  user_role := COALESCE(NEW.raw_user_meta_data->>'role', 'customer');
  user_district := NEW.raw_user_meta_data->>'district';
  user_business_name := NEW.raw_user_meta_data->>'business_name';
  
  -- Crear perfil
  INSERT INTO public.profiles (id, email, full_name, role, district, business_name)
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)), 
    user_role,
    user_district,
    user_business_name
  );
  
  -- Crear estadísticas iniciales
  INSERT INTO public.user_stats (user_id)
  VALUES (NEW.id);
  
  -- Si es owner, crear negocio automáticamente si hay business_name
  IF user_role = 'owner' AND user_business_name IS NOT NULL THEN
    INSERT INTO public.businesses (owner_id, name, district, phone)
    VALUES (
      NEW.id, 
      user_business_name, 
      COALESCE(user_district, 'San Martin de Porres'),
      NEW.raw_user_meta_data->>'business_phone'
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para nuevos usuarios
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- TRIGGER: Actualizar estadísticas cuando se entrega una orden
-- ============================================================================
CREATE OR REPLACE FUNCTION public.update_user_stats_on_delivery()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_meals INT;
  v_saved DECIMAL(10,2);
  v_co2 DECIMAL(10,2);
BEGIN
  -- Solo ejecutar cuando el estado cambia a 'delivered'
  IF NEW.status = 'delivered' AND OLD.status != 'delivered' THEN
    -- Calcular estadísticas de esta orden
    SELECT 
      COALESCE(SUM(oi.quantity), 0),
      COALESCE(SUM(oi.quantity * (p.original_price - oi.price)), 0),
      COALESCE(SUM(oi.quantity) * 0.5, 0)
    INTO v_meals, v_saved, v_co2
    FROM public.order_items oi
    JOIN public.products p ON p.id = oi.product_id
    WHERE oi.order_id = NEW.id;
    
    -- Actualizar estadísticas del usuario
    INSERT INTO public.user_stats (user_id, meals_rescued, money_saved, co2_avoided, total_orders, updated_at)
    VALUES (NEW.customer_id, v_meals, v_saved, v_co2, 1, NOW())
    ON CONFLICT (user_id) DO UPDATE SET
      meals_rescued = user_stats.meals_rescued + EXCLUDED.meals_rescued,
      money_saved = user_stats.money_saved + EXCLUDED.money_saved,
      co2_avoided = user_stats.co2_avoided + EXCLUDED.co2_avoided,
      total_orders = user_stats.total_orders + 1,
      updated_at = NOW();
    
    -- Actualizar delivered_at
    UPDATE public.orders SET delivered_at = NOW() WHERE id = NEW.id;
    
    -- Crear notificación de entrega
    INSERT INTO public.notifications (user_id, title, message, type, related_id)
    VALUES (
      NEW.customer_id,
      '¡Pedido entregado!',
      FORMAT('Tu pedido ha sido entregado exitosamente. Has rescatado %s comidas.', v_meals),
      'order',
      NEW.id
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_order_status_changed ON public.orders;
CREATE TRIGGER on_order_status_changed
  AFTER UPDATE OF status ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.update_user_stats_on_delivery();

-- ============================================================================
-- TRIGGER: Notificar cambio de estado de orden
-- ============================================================================
CREATE OR REPLACE FUNCTION public.notify_order_status_change()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_business_name TEXT;
  v_message TEXT;
BEGIN
  IF NEW.status != OLD.status THEN
    -- Obtener nombre del negocio
    SELECT name INTO v_business_name 
    FROM public.businesses 
    WHERE id = NEW.business_id;
    
    -- Mensaje según estado
    CASE NEW.status
      WHEN 'confirmed' THEN
        v_message := FORMAT('%s confirmó tu pedido', v_business_name);
      WHEN 'preparing' THEN
        v_message := FORMAT('%s está preparando tu pedido', v_business_name);
      WHEN 'onway' THEN
        v_message := FORMAT('Tu pedido de %s va en camino', v_business_name);
      WHEN 'delivered' THEN
        v_message := FORMAT('Tu pedido de %s ha sido entregado', v_business_name);
      WHEN 'cancelled' THEN
        v_message := FORMAT('Tu pedido de %s ha sido cancelado', v_business_name);
      ELSE
        v_message := FORMAT('Estado de tu pedido actualizado: %s', NEW.status);
    END CASE;
    
    -- Crear notificación
    INSERT INTO public.notifications (user_id, title, message, type, related_id)
    VALUES (NEW.customer_id, 'Actualización de pedido', v_message, 'order', NEW.id);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_order_status_notify ON public.orders;
CREATE TRIGGER on_order_status_notify
  AFTER UPDATE OF status ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.notify_order_status_change();

-- ============================================================================
-- TRIGGER: Crear mensaje inicial cuando se crea una orden
-- ============================================================================
CREATE OR REPLACE FUNCTION public.create_initial_order_message()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_business_name TEXT;
  v_owner_id UUID;
BEGIN
  -- Obtener info del negocio
  SELECT b.name, b.owner_id INTO v_business_name, v_owner_id
  FROM public.businesses b
  WHERE b.id = NEW.business_id;
  
  -- Crear mensaje de bienvenida del restaurante
  INSERT INTO public.messages (order_id, sender_id, sender_role, content)
  VALUES (
    NEW.id,
    v_owner_id,
    'owner',
    FORMAT('¡Hola! Recibimos tu pedido en %s. Lo confirmaremos en breve. 👋', v_business_name)
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_order_created ON public.orders;
CREATE TRIGGER on_order_created
  AFTER INSERT ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.create_initial_order_message();

-- ============================================================================
-- TRIGGER: Incrementar contador de usos de cupón
-- ============================================================================
CREATE OR REPLACE FUNCTION public.increment_coupon_usage()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_coupon_id UUID;
BEGIN
  IF NEW.coupon_code IS NOT NULL THEN
    -- Buscar el cupón
    SELECT id INTO v_coupon_id FROM public.coupons WHERE code = UPPER(NEW.coupon_code);
    
    IF v_coupon_id IS NOT NULL THEN
      -- Incrementar contador global
      UPDATE public.coupons 
      SET current_uses = current_uses + 1 
      WHERE id = v_coupon_id;
      
      -- Registrar uso por usuario
      INSERT INTO public.coupon_usage (user_id, coupon_id, order_id)
      VALUES (NEW.customer_id, v_coupon_id, NEW.id)
      ON CONFLICT DO NOTHING;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_order_with_coupon ON public.orders;
CREATE TRIGGER on_order_with_coupon
  AFTER INSERT ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.increment_coupon_usage();

-- ============================================================================
-- TRIGGER: Reducir stock cuando se crea order_item
-- ============================================================================
CREATE OR REPLACE FUNCTION public.reduce_product_stock()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.products 
  SET stock = stock - NEW.quantity 
  WHERE id = NEW.product_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_order_item_created ON public.order_items;
CREATE TRIGGER on_order_item_created
  AFTER INSERT ON public.order_items
  FOR EACH ROW EXECUTE FUNCTION public.reduce_product_stock();

-- ============================================================================
-- TRIGGER: Restaurar stock cuando se cancela una orden
-- ============================================================================
CREATE OR REPLACE FUNCTION public.restore_stock_on_cancel()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'cancelled' AND OLD.status != 'cancelled' THEN
    UPDATE public.products p
    SET stock = stock + oi.quantity
    FROM public.order_items oi
    WHERE oi.order_id = NEW.id AND p.id = oi.product_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_order_cancelled ON public.orders;
CREATE TRIGGER on_order_cancelled
  AFTER UPDATE OF status ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.restore_stock_on_cancel();

-- ============================================================================
-- TRIGGER: Notificación de nuevo mensaje
-- ============================================================================
CREATE OR REPLACE FUNCTION public.notify_new_message()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order RECORD;
  v_recipient_id UUID;
  v_sender_name TEXT;
BEGIN
  -- Obtener info de la orden
  SELECT o.customer_id, o.business_id, b.owner_id, b.name as business_name
  INTO v_order
  FROM public.orders o
  JOIN public.businesses b ON b.id = o.business_id
  WHERE o.id = NEW.order_id;
  
  -- Determinar destinatario
  IF NEW.sender_role = 'customer' THEN
    v_recipient_id := v_order.owner_id;
    SELECT full_name INTO v_sender_name FROM public.profiles WHERE id = NEW.sender_id;
  ELSE
    v_recipient_id := v_order.customer_id;
    v_sender_name := v_order.business_name;
  END IF;
  
  -- Crear notificación
  INSERT INTO public.notifications (user_id, title, message, type, related_id)
  VALUES (
    v_recipient_id,
    'Nuevo mensaje',
    FORMAT('%s: %s', v_sender_name, LEFT(NEW.content, 50)),
    'chat',
    NEW.order_id
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_message_created ON public.messages;
CREATE TRIGGER on_message_created
  AFTER INSERT ON public.messages
  FOR EACH ROW EXECUTE FUNCTION public.notify_new_message();

-- ============================================================================
-- FUNCIÓN: Marcar mensajes como leídos
-- ============================================================================
CREATE OR REPLACE FUNCTION public.mark_messages_read(p_order_id UUID, p_user_id UUID)
RETURNS INT
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count INT;
BEGIN
  UPDATE public.messages
  SET is_read = TRUE
  WHERE order_id = p_order_id
    AND sender_id != p_user_id
    AND is_read = FALSE;
  
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- FUNCIÓN: Marcar notificaciones como leídas
-- ============================================================================
CREATE OR REPLACE FUNCTION public.mark_notifications_read(p_user_id UUID, p_all BOOLEAN DEFAULT FALSE, p_notification_id UUID DEFAULT NULL)
RETURNS INT
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count INT;
BEGIN
  IF p_all THEN
    UPDATE public.notifications
    SET is_read = TRUE
    WHERE user_id = p_user_id AND is_read = FALSE;
  ELSIF p_notification_id IS NOT NULL THEN
    UPDATE public.notifications
    SET is_read = TRUE
    WHERE id = p_notification_id AND user_id = p_user_id;
  END IF;
  
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- FUNCIÓN: Obtener productos con info del negocio
-- ============================================================================
CREATE OR REPLACE FUNCTION public.get_products_with_business(
  p_category TEXT DEFAULT NULL,
  p_district TEXT DEFAULT NULL,
  p_business_id UUID DEFAULT NULL,
  p_limit INT DEFAULT 50,
  p_offset INT DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  description TEXT,
  category TEXT,
  price DECIMAL,
  original_price DECIMAL,
  image_url TEXT,
  stock INT,
  expires_at TIMESTAMPTZ,
  business_id UUID,
  business_name TEXT,
  business_district TEXT,
  business_rating DECIMAL
)
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.name,
    p.description,
    p.category,
    p.price,
    p.original_price,
    p.image_url,
    p.stock,
    p.expires_at,
    p.business_id,
    b.name AS business_name,
    b.district AS business_district,
    b.rating AS business_rating
  FROM public.products p
  JOIN public.businesses b ON b.id = p.business_id
  WHERE p.is_active = TRUE 
    AND p.expires_at > NOW()
    AND b.is_active = TRUE
    AND (p_category IS NULL OR p.category = p_category)
    AND (p_district IS NULL OR b.district = p_district)
    AND (p_business_id IS NULL OR p.business_id = p_business_id)
  ORDER BY p.expires_at ASC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;
