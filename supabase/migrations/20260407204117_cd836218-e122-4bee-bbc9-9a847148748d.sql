
-- Orders table
CREATE TABLE public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  customer_phone text NOT NULL,
  delivery_type text NOT NULL DEFAULT 'pickup' CHECK (delivery_type IN ('delivery', 'pickup')),
  delivery_address text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'preparing', 'ready', 'completed', 'cancelled')),
  payment_status text NOT NULL DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'paid', 'refunded')),
  payment_method text,
  payment_id text,
  subtotal integer NOT NULL DEFAULT 0,
  discount integer NOT NULL DEFAULT 0,
  total integer NOT NULL DEFAULT 0,
  coupon_code text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Order items
CREATE TABLE public.order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  menu_item_id uuid REFERENCES public.menu_items(id) ON DELETE SET NULL,
  item_name text NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  price integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Reviews
CREATE TABLE public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Inventory
CREATE TABLE public.inventory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ingredient_name text NOT NULL,
  quantity numeric NOT NULL DEFAULT 0,
  unit text NOT NULL DEFAULT 'kg',
  low_stock_threshold numeric NOT NULL DEFAULT 5,
  is_low_stock boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Coupons
CREATE TABLE public.coupons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  discount_percent integer NOT NULL CHECK (discount_percent > 0 AND discount_percent <= 100),
  max_uses integer,
  used_count integer NOT NULL DEFAULT 0,
  expires_at timestamptz,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

-- Orders policies
CREATE POLICY "Anyone can create orders" ON public.orders FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Users can view own orders" ON public.orders FOR SELECT TO public USING (customer_email = customer_email);
CREATE POLICY "Staff+ can view all orders" ON public.orders FOR SELECT TO authenticated USING (
  has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager') OR has_role(auth.uid(), 'staff')
);
CREATE POLICY "Manager+ can update orders" ON public.orders FOR UPDATE TO authenticated USING (
  has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager') OR has_role(auth.uid(), 'staff')
);

-- Order items policies
CREATE POLICY "Anyone can create order items" ON public.order_items FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Anyone can view order items" ON public.order_items FOR SELECT TO public USING (true);

-- Reviews policies
CREATE POLICY "Anyone can submit reviews" ON public.reviews FOR INSERT TO public WITH CHECK (length(customer_name) > 0 AND rating >= 1 AND rating <= 5);
CREATE POLICY "Anyone can view approved reviews" ON public.reviews FOR SELECT TO public USING (status = 'approved');
CREATE POLICY "Staff+ can view all reviews" ON public.reviews FOR SELECT TO authenticated USING (
  has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager')
);
CREATE POLICY "Manager+ can update reviews" ON public.reviews FOR UPDATE TO authenticated USING (
  has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager')
);

-- Inventory policies
CREATE POLICY "Admin can manage inventory" ON public.inventory FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'));

-- Coupons policies
CREATE POLICY "Anyone can view active coupons" ON public.coupons FOR SELECT TO public USING (is_active = true);
CREATE POLICY "Admin can manage coupons" ON public.coupons FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'));

-- Updated_at triggers
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_inventory_updated_at BEFORE UPDATE ON public.inventory FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS policies for user_roles: allow admins to insert/update/delete
CREATE POLICY "Admins can manage roles" ON public.user_roles FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

-- Update handle_new_user to support manager/staff seeding
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.email IN ('swarnavamalakar863@gmail.com', 'somamalakar1977@gmail.com') THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin');
  ELSE
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user');
  END IF;
  RETURN NEW;
END;
$$;

-- Make sure trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Enable realtime for orders
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
