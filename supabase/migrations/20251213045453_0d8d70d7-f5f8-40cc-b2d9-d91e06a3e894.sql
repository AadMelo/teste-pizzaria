-- Add explicit policy to deny anonymous access to profiles
CREATE POLICY "Deny anonymous access to profiles" 
ON public.profiles 
FOR ALL 
USING (auth.uid() IS NOT NULL);

-- Add explicit policy to deny anonymous access to orders
CREATE POLICY "Deny anonymous access to orders" 
ON public.orders 
FOR ALL 
USING (auth.uid() IS NOT NULL);