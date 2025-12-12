-- Remove the public SELECT policy that exposes all coupon codes
DROP POLICY IF EXISTS "Anyone can view active coupons" ON public.coupons;

-- Coupons are now only accessible through the secure validate_coupon function (SECURITY DEFINER)
-- No direct SELECT access is needed since validation happens through the RPC function