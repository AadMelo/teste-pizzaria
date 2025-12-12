-- Create coupons table
CREATE TABLE public.coupons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value NUMERIC NOT NULL CHECK (discount_value > 0),
  min_order_value NUMERIC DEFAULT 0,
  max_uses INTEGER,
  current_uses INTEGER DEFAULT 0,
  valid_from TIMESTAMP WITH TIME ZONE DEFAULT now(),
  valid_until TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

-- Anyone can view active coupons (for validation)
CREATE POLICY "Anyone can view active coupons"
ON public.coupons
FOR SELECT
USING (is_active = true);

-- Insert some default coupons
INSERT INTO public.coupons (code, description, discount_type, discount_value, min_order_value, max_uses) VALUES
('PROMO10', '10% de desconto em todo pedido', 'percentage', 10, 0, NULL),
('BEMVINDO15', '15% OFF na primeira compra', 'percentage', 15, 0, 500),
('FRETE0', 'Frete grátis (R$8 OFF)', 'fixed', 8, 60, NULL),
('PIZZA20', 'R$20 OFF em pedidos acima de R$100', 'fixed', 20, 100, 200);

-- Create table for tracking coupon usage per user
CREATE TABLE public.coupon_uses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  coupon_id UUID NOT NULL REFERENCES public.coupons(id),
  user_id UUID NOT NULL,
  order_id UUID REFERENCES public.orders(id),
  used_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.coupon_uses ENABLE ROW LEVEL SECURITY;

-- Users can only see their own coupon usage
CREATE POLICY "Users can view their own coupon usage"
ON public.coupon_uses
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own coupon usage
CREATE POLICY "Users can insert their own coupon usage"
ON public.coupon_uses
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create function to validate and apply coupon
CREATE OR REPLACE FUNCTION public.validate_coupon(
  p_code TEXT,
  p_user_id UUID,
  p_order_total NUMERIC
)
RETURNS TABLE(
  valid BOOLEAN,
  message TEXT,
  discount_amount NUMERIC,
  coupon_id UUID
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_coupon RECORD;
  v_user_uses INTEGER;
  v_discount NUMERIC;
BEGIN
  -- Find coupon
  SELECT * INTO v_coupon
  FROM coupons c
  WHERE UPPER(c.code) = UPPER(p_code)
    AND c.is_active = true;
  
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 'Cupom não encontrado'::TEXT, 0::NUMERIC, NULL::UUID;
    RETURN;
  END IF;
  
  -- Check validity dates
  IF v_coupon.valid_from > now() THEN
    RETURN QUERY SELECT false, 'Cupom ainda não está válido'::TEXT, 0::NUMERIC, NULL::UUID;
    RETURN;
  END IF;
  
  IF v_coupon.valid_until IS NOT NULL AND v_coupon.valid_until < now() THEN
    RETURN QUERY SELECT false, 'Cupom expirado'::TEXT, 0::NUMERIC, NULL::UUID;
    RETURN;
  END IF;
  
  -- Check max uses
  IF v_coupon.max_uses IS NOT NULL AND v_coupon.current_uses >= v_coupon.max_uses THEN
    RETURN QUERY SELECT false, 'Cupom esgotado'::TEXT, 0::NUMERIC, NULL::UUID;
    RETURN;
  END IF;
  
  -- Check minimum order value
  IF p_order_total < v_coupon.min_order_value THEN
    RETURN QUERY SELECT false, 
      format('Pedido mínimo de R$ %s', v_coupon.min_order_value)::TEXT, 
      0::NUMERIC, NULL::UUID;
    RETURN;
  END IF;
  
  -- Check if user already used this coupon (if user is logged in)
  IF p_user_id IS NOT NULL THEN
    SELECT COUNT(*) INTO v_user_uses
    FROM coupon_uses
    WHERE coupon_id = v_coupon.id AND user_id = p_user_id;
    
    IF v_user_uses > 0 THEN
      RETURN QUERY SELECT false, 'Você já usou este cupom'::TEXT, 0::NUMERIC, NULL::UUID;
      RETURN;
    END IF;
  END IF;
  
  -- Calculate discount
  IF v_coupon.discount_type = 'percentage' THEN
    v_discount := p_order_total * (v_coupon.discount_value / 100);
  ELSE
    v_discount := v_coupon.discount_value;
  END IF;
  
  -- Cap discount at order total
  IF v_discount > p_order_total THEN
    v_discount := p_order_total;
  END IF;
  
  RETURN QUERY SELECT true, v_coupon.description, v_discount, v_coupon.id;
END;
$$;