
-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_assigned_staff ON public.orders(assigned_staff_id);
CREATE INDEX IF NOT EXISTS idx_reservations_date ON public.reservations(reservation_date);
CREATE INDEX IF NOT EXISTS idx_reservations_status ON public.reservations(status);
CREATE INDEX IF NOT EXISTS idx_reviews_status ON public.reviews(status);
CREATE INDEX IF NOT EXISTS idx_menu_items_category ON public.menu_items(category);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs(action_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON public.audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_staff_shifts_date ON public.staff_shifts(shift_date);
CREATE INDEX IF NOT EXISTS idx_staff_shifts_user ON public.staff_shifts(user_id);
CREATE INDEX IF NOT EXISTS idx_inventory_low_stock ON public.inventory(is_low_stock);

-- Fix overly permissive INSERT on orders
DROP POLICY IF EXISTS "Anyone can create orders" ON public.orders;
CREATE POLICY "Anyone can create orders" ON public.orders
FOR INSERT TO public
WITH CHECK (
  length(customer_name) > 0 AND
  length(customer_email) > 0 AND
  length(customer_phone) > 0
);

-- Fix overly permissive INSERT on order_items
DROP POLICY IF EXISTS "Anyone can create order items" ON public.order_items;
CREATE POLICY "Anyone can create order items" ON public.order_items
FOR INSERT TO public
WITH CHECK (order_id IS NOT NULL AND length(item_name) > 0);

-- Manager access to reservations
DROP POLICY IF EXISTS "Managers can view reservations" ON public.reservations;
CREATE POLICY "Managers can view reservations" ON public.reservations
FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'manager'::app_role));

DROP POLICY IF EXISTS "Managers can update reservations" ON public.reservations;
CREATE POLICY "Managers can update reservations" ON public.reservations
FOR UPDATE TO authenticated
USING (has_role(auth.uid(), 'manager'::app_role));

-- Manager access to inventory
DROP POLICY IF EXISTS "Manager can view inventory" ON public.inventory;
CREATE POLICY "Manager can view inventory" ON public.inventory
FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'manager'::app_role));

DROP POLICY IF EXISTS "Manager can update inventory" ON public.inventory;
CREATE POLICY "Manager can update inventory" ON public.inventory
FOR UPDATE TO authenticated
USING (has_role(auth.uid(), 'manager'::app_role));

-- Manager access to contact submissions
DROP POLICY IF EXISTS "Managers can view contacts" ON public.contact_submissions;
CREATE POLICY "Managers can view contacts" ON public.contact_submissions
FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'manager'::app_role));

DROP POLICY IF EXISTS "Managers can update contacts" ON public.contact_submissions;
CREATE POLICY "Managers can update contacts" ON public.contact_submissions
FOR UPDATE TO authenticated
USING (has_role(auth.uid(), 'manager'::app_role));

-- Staff read access to reservations (today's only enforced in app)
DROP POLICY IF EXISTS "Staff can view reservations" ON public.reservations;
CREATE POLICY "Staff can view reservations" ON public.reservations
FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'staff'::app_role));

-- Staff read access to inventory
DROP POLICY IF EXISTS "Staff can view inventory" ON public.inventory;
CREATE POLICY "Staff can view inventory" ON public.inventory
FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'staff'::app_role));

-- Manager access to menu items (update only, no delete, no price change enforced in app)
DROP POLICY IF EXISTS "Manager can update menu items" ON public.menu_items;
CREATE POLICY "Manager can update menu items" ON public.menu_items
FOR UPDATE TO authenticated
USING (has_role(auth.uid(), 'manager'::app_role));

-- Manager can manage coupons
DROP POLICY IF EXISTS "Manager can manage coupons" ON public.coupons;
CREATE POLICY "Manager can view coupons" ON public.coupons
FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'manager'::app_role));
