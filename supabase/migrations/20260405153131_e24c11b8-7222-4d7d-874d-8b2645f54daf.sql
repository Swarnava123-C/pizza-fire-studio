
-- Drop and recreate the permissive INSERT policies with basic validation
DROP POLICY "Anyone can create reservations" ON public.reservations;
CREATE POLICY "Anyone can create reservations" ON public.reservations
  FOR INSERT WITH CHECK (
    length(name) > 0 AND length(email) > 0 AND length(phone) > 0 AND guests > 0
  );

DROP POLICY "Anyone can submit contact" ON public.contact_submissions;
CREATE POLICY "Anyone can submit contact" ON public.contact_submissions
  FOR INSERT WITH CHECK (
    length(name) > 0 AND length(email) > 0 AND length(message) > 0
  );
