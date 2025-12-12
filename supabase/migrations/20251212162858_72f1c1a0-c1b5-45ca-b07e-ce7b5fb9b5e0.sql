-- Remove coupon system completely

-- Drop policies first
DROP POLICY IF EXISTS "Deny direct coupon reads" ON public.coupons;
DROP POLICY IF EXISTS "Deny direct coupon inserts" ON public.coupons;
DROP POLICY IF EXISTS "Deny direct coupon updates" ON public.coupons;
DROP POLICY IF EXISTS "Deny direct coupon deletes" ON public.coupons;
DROP POLICY IF EXISTS "Deny all coupon usage deletions" ON public.coupon_uses;
DROP POLICY IF EXISTS "Deny all coupon usage updates" ON public.coupon_uses;
DROP POLICY IF EXISTS "Deny direct coupon usage inserts" ON public.coupon_uses;
DROP POLICY IF EXISTS "Users can insert their own coupon usage" ON public.coupon_uses;
DROP POLICY IF EXISTS "Users can view their own coupon usage" ON public.coupon_uses;

-- Drop functions
DROP FUNCTION IF EXISTS public.validate_coupon(text, uuid, numeric);
DROP FUNCTION IF EXISTS public.use_coupon(uuid, uuid, uuid);

-- Drop tables (coupon_uses first due to foreign key)
DROP TABLE IF EXISTS public.coupon_uses;
DROP TABLE IF EXISTS public.coupons;