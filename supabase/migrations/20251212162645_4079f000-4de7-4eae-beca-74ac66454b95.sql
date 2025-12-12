-- Add restrictive policies to coupons table
-- All access should go through SECURITY DEFINER functions (validate_coupon, use_coupon)

CREATE POLICY "Deny direct coupon reads"
ON public.coupons
FOR SELECT
USING (false);

CREATE POLICY "Deny direct coupon inserts"
ON public.coupons
FOR INSERT
WITH CHECK (false);

CREATE POLICY "Deny direct coupon updates"
ON public.coupons
FOR UPDATE
USING (false);

CREATE POLICY "Deny direct coupon deletes"
ON public.coupons
FOR DELETE
USING (false);