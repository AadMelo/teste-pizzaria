-- Create store_settings table
CREATE TABLE public.store_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value TEXT NOT NULL,
  label TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'text', -- text, number, time, boolean
  category TEXT NOT NULL DEFAULT 'general',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;

-- Everyone can view store settings (needed for delivery fee, hours, etc.)
CREATE POLICY "Anyone can view store settings"
ON public.store_settings
FOR SELECT
USING (true);

-- Only admins can update store settings
CREATE POLICY "Admins can update store settings"
ON public.store_settings
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

-- Only admins can insert store settings
CREATE POLICY "Admins can insert store settings"
ON public.store_settings
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Only admins can delete store settings
CREATE POLICY "Admins can delete store settings"
ON public.store_settings
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Create trigger for updated_at
CREATE TRIGGER update_store_settings_updated_at
BEFORE UPDATE ON public.store_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default settings
INSERT INTO public.store_settings (key, value, label, type, category) VALUES
  -- Horários de funcionamento
  ('opening_time_weekday', '18:00', 'Horário de Abertura (Seg-Sex)', 'time', 'hours'),
  ('closing_time_weekday', '23:30', 'Horário de Fechamento (Seg-Sex)', 'time', 'hours'),
  ('opening_time_weekend', '18:00', 'Horário de Abertura (Sáb-Dom)', 'time', 'hours'),
  ('closing_time_weekend', '00:00', 'Horário de Fechamento (Sáb-Dom)', 'time', 'hours'),
  ('is_open_monday', 'true', 'Aberto Segunda', 'boolean', 'hours'),
  ('is_open_tuesday', 'true', 'Aberto Terça', 'boolean', 'hours'),
  ('is_open_wednesday', 'true', 'Aberto Quarta', 'boolean', 'hours'),
  ('is_open_thursday', 'true', 'Aberto Quinta', 'boolean', 'hours'),
  ('is_open_friday', 'true', 'Aberto Sexta', 'boolean', 'hours'),
  ('is_open_saturday', 'true', 'Aberto Sábado', 'boolean', 'hours'),
  ('is_open_sunday', 'true', 'Aberto Domingo', 'boolean', 'hours'),
  
  -- Configurações de entrega
  ('delivery_fee', '8.00', 'Taxa de Entrega (R$)', 'number', 'delivery'),
  ('min_order_value', '30.00', 'Pedido Mínimo (R$)', 'number', 'delivery'),
  ('estimated_delivery_time', '45', 'Tempo Estimado de Entrega (minutos)', 'number', 'delivery'),
  ('max_delivery_radius', '10', 'Raio Máximo de Entrega (km)', 'number', 'delivery'),
  ('free_delivery_above', '80.00', 'Frete Grátis Acima de (R$)', 'number', 'delivery'),
  
  -- Informações gerais
  ('store_name', 'Pizza Express', 'Nome da Pizzaria', 'text', 'general'),
  ('store_phone', '(11) 99999-9999', 'Telefone', 'text', 'general'),
  ('store_address', 'Rua das Pizzas, 123 - Centro', 'Endereço', 'text', 'general'),
  ('store_whatsapp', '5511999999999', 'WhatsApp (apenas números)', 'text', 'general');