
-- 1. Create audit_logs table
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action_type text NOT NULL,
  entity_type text NOT NULL,
  entity_id text,
  old_value text,
  new_value text,
  ip_address text,
  details text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all audit logs"
  ON public.audit_logs FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Managers can view limited audit logs"
  ON public.audit_logs FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'manager') 
    AND action_type IN ('LOGIN', 'ORDER_UPDATE', 'RESERVATION_UPDATE')
  );

CREATE POLICY "System can insert audit logs"
  ON public.audit_logs FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE INDEX idx_audit_logs_user ON public.audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON public.audit_logs(action_type);
CREATE INDEX idx_audit_logs_created ON public.audit_logs(created_at DESC);

-- 2. Update handle_new_user to assign roles based on email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  assigned_role app_role;
BEGIN
  -- Determine role by email (highest priority first)
  IF NEW.email IN ('somamalakar1977@gmail.com', 'swarnavamalakar863@gmail.com') THEN
    assigned_role := 'admin';
  ELSIF NEW.email = 'swarnava122@gmail.com' THEN
    assigned_role := 'manager';
  ELSIF NEW.email = 'jagaddalshyamal@gmail.com' THEN
    assigned_role := 'staff';
  ELSE
    assigned_role := 'user';
  END IF;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, assigned_role)
  ON CONFLICT (user_id, role) DO NOTHING;

  -- Log the role assignment
  INSERT INTO public.audit_logs (user_id, action_type, entity_type, entity_id, new_value, details)
  VALUES (NEW.id, 'ROLE_ASSIGNMENT', 'user', NEW.id::text, assigned_role::text, 'Auto-assigned on signup for ' || NEW.email);

  RETURN NEW;
END;
$$;

-- Recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. Audit trigger on user_roles changes
CREATE OR REPLACE FUNCTION public.audit_role_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.audit_logs (user_id, action_type, entity_type, entity_id, new_value, details)
    VALUES (NEW.user_id, 'ROLE_CHANGE', 'user_role', NEW.id::text, NEW.role::text, 'Role added');
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO public.audit_logs (user_id, action_type, entity_type, entity_id, old_value, new_value, details)
    VALUES (NEW.user_id, 'ROLE_CHANGE', 'user_role', NEW.id::text, OLD.role::text, NEW.role::text, 'Role changed');
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO public.audit_logs (user_id, action_type, entity_type, entity_id, old_value, details)
    VALUES (OLD.user_id, 'ROLE_CHANGE', 'user_role', OLD.id::text, OLD.role::text, 'Role removed');
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER audit_user_roles_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.user_roles
  FOR EACH ROW EXECUTE FUNCTION public.audit_role_change();

-- 4. Add indexes on user_roles
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON public.user_roles(role);
