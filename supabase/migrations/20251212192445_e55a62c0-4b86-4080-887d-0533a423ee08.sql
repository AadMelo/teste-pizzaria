-- Drop the restrictive RLS policy for order updates
DROP POLICY IF EXISTS "Deny all order updates" ON public.orders;

-- Create policy allowing admins to update orders
CREATE POLICY "Admins can update orders" 
ON public.orders 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role));