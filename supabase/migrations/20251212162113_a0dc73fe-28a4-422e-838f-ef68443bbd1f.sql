-- Add restrictive policies to prevent manipulation of coupon usage history
CREATE POLICY "Deny all coupon usage deletions"
ON public.coupon_uses
FOR DELETE
USING (false);

CREATE POLICY "Deny all coupon usage updates"
ON public.coupon_uses
FOR UPDATE
USING (false);