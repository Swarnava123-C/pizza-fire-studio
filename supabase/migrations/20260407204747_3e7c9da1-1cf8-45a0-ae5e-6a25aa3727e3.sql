
CREATE TABLE public.restaurant_tables (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  table_number integer NOT NULL UNIQUE,
  capacity integer NOT NULL DEFAULT 4,
  section text NOT NULL DEFAULT 'main' CHECK (section IN ('main', 'outdoor', 'vip', 'private')),
  status text NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'reserved', 'occupied')),
  position_x integer NOT NULL DEFAULT 0,
  position_y integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.restaurant_tables ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view tables" ON public.restaurant_tables FOR SELECT TO public USING (true);
CREATE POLICY "Admin/Manager can manage tables" ON public.restaurant_tables FOR ALL TO authenticated USING (
  has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager')
) WITH CHECK (
  has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager')
);

-- Seed some tables
INSERT INTO public.restaurant_tables (table_number, capacity, section, position_x, position_y) VALUES
(1, 2, 'main', 1, 1), (2, 2, 'main', 2, 1), (3, 4, 'main', 3, 1),
(4, 4, 'main', 1, 2), (5, 6, 'main', 2, 2), (6, 4, 'main', 3, 2),
(7, 2, 'outdoor', 1, 3), (8, 4, 'outdoor', 2, 3), (9, 4, 'outdoor', 3, 3),
(10, 6, 'vip', 1, 4), (11, 8, 'vip', 2, 4),
(12, 10, 'private', 3, 4);
