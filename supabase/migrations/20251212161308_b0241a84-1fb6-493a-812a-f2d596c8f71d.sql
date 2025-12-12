-- Drop the insecure UPDATE policy
DROP POLICY IF EXISTS "Allow increment coupon usage" ON public.coupons;

-- Create a secure function to increment coupon usage (only this function can update coupons)
CREATE OR REPLACE FUNCTION public.use_coupon(p_coupon_id uuid, p_user_id uuid, p_order_id uuid DEFAULT NULL)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_coupon RECORD;
BEGIN
  -- Verify caller is authenticated
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  
  -- Verify caller matches target user
  IF auth.uid() != p_user_id THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  -- Get coupon and lock for update
  SELECT * INTO v_coupon
  FROM coupons
  WHERE id = p_coupon_id AND is_active = true
  FOR UPDATE;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Coupon not found or inactive';
  END IF;
  
  -- Check if max uses exceeded
  IF v_coupon.max_uses IS NOT NULL AND v_coupon.current_uses >= v_coupon.max_uses THEN
    RAISE EXCEPTION 'Coupon usage limit reached';
  END IF;
  
  -- Increment usage count (ONLY this field can be modified)
  UPDATE coupons
  SET current_uses = current_uses + 1
  WHERE id = p_coupon_id;
  
  -- Record coupon use
  INSERT INTO coupon_uses (coupon_id, user_id, order_id)
  VALUES (p_coupon_id, p_user_id, p_order_id);
  
  RETURN true;
END;
$$;