-- ============================================================================
-- ComeYa! - Row Level Security Policies
-- Migración: 002_rls_policies.sql
-- Descripción: Políticas de seguridad a nivel de fila
-- ============================================================================

-- ============================================================================
-- Habilitar RLS en todas las tablas
-- ============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupon_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaint_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.districts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.district_distances ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- PROFILES
-- ============================================================================

-- Lectura: Usuario ve su propio perfil
CREATE POLICY "profiles_select_own"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- Lectura: Owners pueden ver perfiles de clientes que les hicieron pedidos
CREATE POLICY "profiles_select_order_customers"
  ON public.profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders
      JOIN public.businesses ON businesses.id = orders.business_id
      WHERE orders.customer_id = profiles.id
        AND businesses.owner_id = auth.uid()
    )
  );

-- Escritura: Usuario actualiza su propio perfil
CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Inserción: Solo via trigger de auth (SECURITY DEFINER)
-- No se permite inserción directa

-- ============================================================================
-- BUSINESSES
-- ============================================================================

-- Lectura: Cualquiera puede ver negocios activos
CREATE POLICY "businesses_select_active"
  ON public.businesses FOR SELECT
  USING (is_active = TRUE);

-- Lectura: Owner ve sus propios negocios (incluyendo inactivos)
CREATE POLICY "businesses_select_own"
  ON public.businesses FOR SELECT
  USING (auth.uid() = owner_id);

-- Inserción: Solo usuarios con rol 'owner'
CREATE POLICY "businesses_insert_owner"
  ON public.businesses FOR INSERT
  WITH CHECK (
    auth.uid() = owner_id AND
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'owner')
  );

-- Actualización: Solo el dueño del negocio
CREATE POLICY "businesses_update_own"
  ON public.businesses FOR UPDATE
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

-- Eliminación: Solo el dueño (soft delete preferido)
CREATE POLICY "businesses_delete_own"
  ON public.businesses FOR DELETE
  USING (auth.uid() = owner_id);

-- ============================================================================
-- PRODUCTS
-- ============================================================================

-- Lectura: Cualquiera puede ver productos activos y no vencidos
CREATE POLICY "products_select_active"
  ON public.products FOR SELECT
  USING (is_active = TRUE AND expires_at > NOW());

-- Lectura: Owner ve todos sus productos (incluyendo inactivos/vencidos)
CREATE POLICY "products_select_own"
  ON public.products FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.businesses 
      WHERE businesses.id = products.business_id 
        AND businesses.owner_id = auth.uid()
    )
  );

-- Inserción: Solo owners a través de sus negocios
CREATE POLICY "products_insert_own_business"
  ON public.products FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.businesses 
      WHERE businesses.id = business_id 
        AND businesses.owner_id = auth.uid()
    )
  );

-- Actualización: Solo el dueño del negocio
CREATE POLICY "products_update_own"
  ON public.products FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.businesses 
      WHERE businesses.id = products.business_id 
        AND businesses.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.businesses 
      WHERE businesses.id = products.business_id 
        AND businesses.owner_id = auth.uid()
    )
  );

-- Eliminación: Solo el dueño del negocio
CREATE POLICY "products_delete_own"
  ON public.products FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.businesses 
      WHERE businesses.id = products.business_id 
        AND businesses.owner_id = auth.uid()
    )
  );

-- ============================================================================
-- ORDERS
-- ============================================================================

-- Lectura: Cliente ve sus propias órdenes
CREATE POLICY "orders_select_customer"
  ON public.orders FOR SELECT
  USING (auth.uid() = customer_id);

-- Lectura: Owner ve órdenes de sus negocios
CREATE POLICY "orders_select_business_owner"
  ON public.orders FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.businesses 
      WHERE businesses.id = orders.business_id 
        AND businesses.owner_id = auth.uid()
    )
  );

-- Inserción: Clientes pueden crear órdenes
CREATE POLICY "orders_insert_customer"
  ON public.orders FOR INSERT
  WITH CHECK (
    auth.uid() = customer_id AND
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'customer')
  );

-- Actualización: Owner puede actualizar estado de órdenes de su negocio
CREATE POLICY "orders_update_business_owner"
  ON public.orders FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.businesses 
      WHERE businesses.id = orders.business_id 
        AND businesses.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.businesses 
      WHERE businesses.id = orders.business_id 
        AND businesses.owner_id = auth.uid()
    )
  );

-- Actualización: Cliente puede cancelar sus propias órdenes (solo pending)
CREATE POLICY "orders_cancel_customer"
  ON public.orders FOR UPDATE
  USING (
    auth.uid() = customer_id AND status = 'pending'
  )
  WITH CHECK (
    auth.uid() = customer_id AND status IN ('pending', 'cancelled')
  );

-- ============================================================================
-- ORDER_ITEMS
-- ============================================================================

-- Lectura: Hereda de orders (cliente o owner del negocio)
CREATE POLICY "order_items_select"
  ON public.order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders 
      WHERE orders.id = order_items.order_id 
        AND (
          orders.customer_id = auth.uid() 
          OR EXISTS (
            SELECT 1 FROM public.businesses 
            WHERE businesses.id = orders.business_id 
              AND businesses.owner_id = auth.uid()
          )
        )
    )
  );

-- Inserción: Solo al crear orden (cliente)
CREATE POLICY "order_items_insert"
  ON public.order_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders 
      WHERE orders.id = order_items.order_id 
        AND orders.customer_id = auth.uid()
    )
  );

-- ============================================================================
-- COUPONS
-- ============================================================================

-- Lectura: Cualquiera puede ver cupones activos
CREATE POLICY "coupons_select_active"
  ON public.coupons FOR SELECT
  USING (is_active = TRUE AND (valid_until IS NULL OR valid_until > NOW()));

-- Solo admins pueden gestionar cupones (no hay admin UI por ahora)
-- INSERT, UPDATE, DELETE restringidos

-- ============================================================================
-- COUPON_USAGE
-- ============================================================================

-- Lectura: Usuario ve su propio historial de cupones
CREATE POLICY "coupon_usage_select_own"
  ON public.coupon_usage FOR SELECT
  USING (auth.uid() = user_id);

-- Inserción: Usuario registra uso de cupón (al crear orden)
CREATE POLICY "coupon_usage_insert_own"
  ON public.coupon_usage FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- MESSAGES
-- ============================================================================

-- Lectura: Participantes de la orden
CREATE POLICY "messages_select_participants"
  ON public.messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders 
      WHERE orders.id = messages.order_id 
        AND (
          orders.customer_id = auth.uid() 
          OR EXISTS (
            SELECT 1 FROM public.businesses 
            WHERE businesses.id = orders.business_id 
              AND businesses.owner_id = auth.uid()
          )
        )
    )
  );

-- Inserción: Participantes de la orden pueden enviar mensajes
CREATE POLICY "messages_insert_participants"
  ON public.messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM public.orders 
      WHERE orders.id = messages.order_id 
        AND (
          orders.customer_id = auth.uid() 
          OR EXISTS (
            SELECT 1 FROM public.businesses 
            WHERE businesses.id = orders.business_id 
              AND businesses.owner_id = auth.uid()
          )
        )
    )
  );

-- Actualización: Marcar como leído (solo receptor)
CREATE POLICY "messages_update_read"
  ON public.messages FOR UPDATE
  USING (
    sender_id != auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.orders 
      WHERE orders.id = messages.order_id 
        AND (
          orders.customer_id = auth.uid() 
          OR EXISTS (
            SELECT 1 FROM public.businesses 
            WHERE businesses.id = orders.business_id 
              AND businesses.owner_id = auth.uid()
          )
        )
    )
  )
  WITH CHECK (is_read = TRUE);

-- ============================================================================
-- COMPLAINTS
-- ============================================================================

-- Lectura: Cliente ve sus propios reclamos
CREATE POLICY "complaints_select_customer"
  ON public.complaints FOR SELECT
  USING (auth.uid() = customer_id);

-- Lectura: Owner ve reclamos de órdenes de su negocio
CREATE POLICY "complaints_select_business_owner"
  ON public.complaints FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders
      JOIN public.businesses ON businesses.id = orders.business_id
      WHERE orders.id = complaints.order_id 
        AND businesses.owner_id = auth.uid()
    )
  );

-- Inserción: Clientes pueden crear reclamos
CREATE POLICY "complaints_insert_customer"
  ON public.complaints FOR INSERT
  WITH CHECK (
    auth.uid() = customer_id AND
    EXISTS (
      SELECT 1 FROM public.orders 
      WHERE orders.id = complaints.order_id 
        AND orders.customer_id = auth.uid()
    )
  );

-- Actualización: Owner puede actualizar estado
CREATE POLICY "complaints_update_business_owner"
  ON public.complaints FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.orders
      JOIN public.businesses ON businesses.id = orders.business_id
      WHERE orders.id = complaints.order_id 
        AND businesses.owner_id = auth.uid()
    )
  );

-- ============================================================================
-- COMPLAINT_RESPONSES
-- ============================================================================

-- Lectura: Participantes del reclamo
CREATE POLICY "complaint_responses_select"
  ON public.complaint_responses FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.complaints
      WHERE complaints.id = complaint_responses.complaint_id
        AND (
          complaints.customer_id = auth.uid()
          OR EXISTS (
            SELECT 1 FROM public.orders
            JOIN public.businesses ON businesses.id = orders.business_id
            WHERE orders.id = complaints.order_id 
              AND businesses.owner_id = auth.uid()
          )
        )
    )
  );

-- Inserción: Cliente o owner pueden responder
CREATE POLICY "complaint_responses_insert"
  ON public.complaint_responses FOR INSERT
  WITH CHECK (
    auth.uid() = responder_id AND
    EXISTS (
      SELECT 1 FROM public.complaints
      WHERE complaints.id = complaint_responses.complaint_id
        AND (
          complaints.customer_id = auth.uid()
          OR EXISTS (
            SELECT 1 FROM public.orders
            JOIN public.businesses ON businesses.id = orders.business_id
            WHERE orders.id = complaints.order_id 
              AND businesses.owner_id = auth.uid()
          )
        )
    )
  );

-- ============================================================================
-- PAYMENT_CARDS
-- ============================================================================

-- Lectura: Solo el dueño
CREATE POLICY "payment_cards_select_own"
  ON public.payment_cards FOR SELECT
  USING (auth.uid() = user_id);

-- Inserción: Solo el dueño
CREATE POLICY "payment_cards_insert_own"
  ON public.payment_cards FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Actualización: Solo el dueño
CREATE POLICY "payment_cards_update_own"
  ON public.payment_cards FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Eliminación: Solo el dueño
CREATE POLICY "payment_cards_delete_own"
  ON public.payment_cards FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- NOTIFICATIONS
-- ============================================================================

-- Lectura: Solo el dueño
CREATE POLICY "notifications_select_own"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

-- Actualización: Solo el dueño (marcar como leído)
CREATE POLICY "notifications_update_own"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Eliminación: Solo el dueño
CREATE POLICY "notifications_delete_own"
  ON public.notifications FOR DELETE
  USING (auth.uid() = user_id);

-- Inserción: Solo via triggers/backend (no directa)

-- ============================================================================
-- USER_STATS
-- ============================================================================

-- Lectura: Solo el dueño
CREATE POLICY "user_stats_select_own"
  ON public.user_stats FOR SELECT
  USING (auth.uid() = user_id);

-- Inserción/Actualización: Solo via triggers (SECURITY DEFINER)

-- ============================================================================
-- DISTRICTS (lectura pública)
-- ============================================================================

CREATE POLICY "districts_select_all"
  ON public.districts FOR SELECT
  USING (is_active = TRUE);

-- ============================================================================
-- DISTRICT_DISTANCES (lectura pública)
-- ============================================================================

CREATE POLICY "district_distances_select_all"
  ON public.district_distances FOR SELECT
  USING (TRUE);
