-- Allow updates to coupons table for incrementing usage count
CREATE POLICY "Allow increment coupon usage"
ON public.coupons
FOR UPDATE
USING (true)
WITH CHECK (true);