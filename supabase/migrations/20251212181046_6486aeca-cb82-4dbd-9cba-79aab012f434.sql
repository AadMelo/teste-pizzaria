-- Create products table
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10,2) NOT NULL,
  category TEXT NOT NULL,
  product_type TEXT NOT NULL DEFAULT 'product', -- 'pizza' or 'product'
  image_url TEXT,
  ingredients TEXT[], -- for pizzas
  size TEXT, -- for drinks (350ml, 2L, etc)
  is_available BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Everyone can view available products
CREATE POLICY "Anyone can view available products"
ON public.products
FOR SELECT
USING (is_available = true);

-- Admins can view all products (including unavailable)
CREATE POLICY "Admins can view all products"
ON public.products
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Only admins can insert products
CREATE POLICY "Admins can insert products"
ON public.products
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Only admins can update products
CREATE POLICY "Admins can update products"
ON public.products
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

-- Only admins can delete products
CREATE POLICY "Admins can delete products"
ON public.products
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Create trigger for updated_at
CREATE TRIGGER update_products_updated_at
BEFORE UPDATE ON public.products
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for category filtering
CREATE INDEX idx_products_category ON public.products(category);
CREATE INDEX idx_products_type ON public.products(product_type);
CREATE INDEX idx_products_available ON public.products(is_available);

-- Insert all pizzas from pizzaData.ts
INSERT INTO public.products (name, description, price, category, product_type, image_url, ingredients, display_order) VALUES
  ('Margherita', 'O clássico italiano com molho de tomate fresco, mussarela e manjericão', 35.90, 'Pizzas Tradicionais', 'pizza', 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800&q=100&fit=crop', ARRAY['Molho de tomate', 'Mussarela', 'Manjericão fresco', 'Azeite'], 1),
  ('Calabresa', 'Calabresa fatiada com cebola e azeitonas', 38.90, 'Pizzas Tradicionais', 'pizza', 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&q=100&fit=crop', ARRAY['Molho de tomate', 'Mussarela', 'Calabresa', 'Cebola', 'Azeitonas'], 2),
  ('Portuguesa', 'Presunto, ovos, cebola, azeitonas e ervilha', 42.90, 'Pizzas Tradicionais', 'pizza', 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&q=100&fit=crop', ARRAY['Molho de tomate', 'Mussarela', 'Presunto', 'Ovos', 'Cebola', 'Azeitonas', 'Ervilha'], 3),
  ('Pepperoni', 'Pepperoni importado com queijo mussarela', 44.90, 'Pizzas Tradicionais', 'pizza', 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=800&q=100&fit=crop', ARRAY['Molho de tomate', 'Mussarela', 'Pepperoni'], 4),
  ('Quatro Queijos', 'Blend de mussarela, provolone, parmesão e gorgonzola', 48.90, 'Pizzas Especiais', 'pizza', 'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?w=800&q=100&fit=crop', ARRAY['Molho de tomate', 'Mussarela', 'Provolone', 'Parmesão', 'Gorgonzola'], 5),
  ('Frango com Catupiry', 'Frango desfiado com catupiry cremoso', 45.90, 'Pizzas Especiais', 'pizza', 'https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?w=800&q=100&fit=crop', ARRAY['Molho de tomate', 'Mussarela', 'Frango desfiado', 'Catupiry'], 6),
  ('Bacon Supreme', 'Bacon crocante, mussarela e cebola caramelizada', 49.90, 'Pizzas Especiais', 'pizza', 'https://images.unsplash.com/photo-1594007654729-407eedc4be65?w=800&q=100&fit=crop', ARRAY['Molho de tomate', 'Mussarela', 'Bacon', 'Cebola caramelizada'], 7),
  ('Vegetariana', 'Mix de legumes frescos grelhados', 43.90, 'Pizzas Especiais', 'pizza', 'https://images.unsplash.com/photo-1511689660979-10d2b1aada49?w=800&q=100&fit=crop', ARRAY['Molho de tomate', 'Mussarela', 'Pimentão', 'Champignon', 'Tomate', 'Milho', 'Brócolis'], 8),
  ('Lombo Canadense', 'Lombo canadense com catupiry e abacaxi', 52.90, 'Pizzas Especiais', 'pizza', 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800&q=100&fit=crop', ARRAY['Molho de tomate', 'Mussarela', 'Lombo canadense', 'Catupiry', 'Abacaxi'], 9),
  ('Napolitana', 'Tomate fresco, mussarela de búfala e manjericão', 55.90, 'Pizzas Premium', 'pizza', 'https://images.unsplash.com/photo-1595854341625-f33ee10dbf94?w=800&q=100&fit=crop', ARRAY['Molho de tomate', 'Mussarela de búfala', 'Tomate fresco', 'Manjericão'], 10),
  ('Camarão', 'Camarões frescos com catupiry e alho', 65.90, 'Pizzas Premium', 'pizza', 'https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?w=800&q=100&fit=crop', ARRAY['Molho branco', 'Mussarela', 'Camarão', 'Catupiry', 'Alho'], 11),
  ('Carne Seca', 'Carne seca desfiada com catupiry e cebola', 58.90, 'Pizzas Premium', 'pizza', 'https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?w=800&q=100&fit=crop', ARRAY['Molho de tomate', 'Mussarela', 'Carne seca', 'Catupiry', 'Cebola'], 12),
  ('Chocolate', 'Chocolate ao leite derretido com granulado', 38.90, 'Pizzas Doces', 'pizza', 'https://images.unsplash.com/photo-1481391319762-47dff72954d9?w=800&q=100&fit=crop', ARRAY['Chocolate ao leite', 'Granulado'], 13),
  ('Romeu e Julieta', 'Goiabada cremosa com queijo minas', 40.90, 'Pizzas Doces', 'pizza', 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&q=100&fit=crop', ARRAY['Goiabada', 'Queijo minas'], 14),
  ('Banana com Canela', 'Banana caramelizada com açúcar e canela', 36.90, 'Pizzas Doces', 'pizza', 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&q=100&fit=crop', ARRAY['Banana', 'Açúcar', 'Canela', 'Leite condensado'], 15),
  ('Prestigio', 'Chocolate com coco ralado', 42.90, 'Pizzas Doces', 'pizza', 'https://images.unsplash.com/photo-1481391319762-47dff72954d9?w=800&q=100&fit=crop', ARRAY['Chocolate', 'Coco ralado', 'Leite condensado'], 16);

-- Insert all beverages
INSERT INTO public.products (name, description, price, category, product_type, image_url, size, display_order) VALUES
  ('Coca-Cola 350ml', 'Refrigerante Coca-Cola gelado', 6.90, 'Bebidas', 'product', 'https://images.unsplash.com/photo-1629203851122-3726ecdf080e?w=400', '350ml', 17),
  ('Coca-Cola 2L', 'Refrigerante Coca-Cola gelado', 12.90, 'Bebidas', 'product', 'https://images.unsplash.com/photo-1629203851122-3726ecdf080e?w=400', '2L', 18),
  ('Guaraná Antarctica 350ml', 'Refrigerante Guaraná gelado', 6.90, 'Bebidas', 'product', 'https://images.unsplash.com/photo-1625772299848-391b6a87d7b3?w=400', '350ml', 19),
  ('Guaraná Antarctica 2L', 'Refrigerante Guaraná gelado', 11.90, 'Bebidas', 'product', 'https://images.unsplash.com/photo-1625772299848-391b6a87d7b3?w=400', '2L', 20),
  ('Fanta Laranja 350ml', 'Refrigerante Fanta sabor laranja', 6.90, 'Bebidas', 'product', 'https://images.unsplash.com/photo-1624517452488-04869289c4ca?w=400', '350ml', 21),
  ('Sprite 350ml', 'Refrigerante Sprite limão', 6.90, 'Bebidas', 'product', 'https://images.unsplash.com/photo-1625772299848-391b6a87d7b3?w=400', '350ml', 22),
  ('Suco Natural 500ml', 'Suco natural de laranja ou limão', 9.90, 'Bebidas', 'product', 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400', '500ml', 23),
  ('Água Mineral 500ml', 'Água mineral sem gás', 4.90, 'Bebidas', 'product', 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=400', '500ml', 24),
  ('Água com Gás 500ml', 'Água mineral com gás', 5.90, 'Bebidas', 'product', 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=400', '500ml', 25),
  ('Cerveja Heineken 330ml', 'Cerveja Heineken long neck gelada', 12.90, 'Bebidas', 'product', 'https://images.unsplash.com/photo-1608270586620-248524c67de9?w=400', '330ml', 26);

-- Insert all desserts
INSERT INTO public.products (name, description, price, category, product_type, image_url, display_order) VALUES
  ('Petit Gâteau', 'Bolo de chocolate com recheio cremoso e sorvete', 24.90, 'Sobremesas', 'product', 'https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=400', 27),
  ('Brownie com Sorvete', 'Brownie de chocolate com sorvete de creme', 19.90, 'Sobremesas', 'product', 'https://images.unsplash.com/photo-1564355808539-22fda35bed7e?w=400', 28),
  ('Churros', 'Churros recheados com doce de leite (4 unidades)', 16.90, 'Sobremesas', 'product', 'https://images.unsplash.com/photo-1624371414361-e670edf4898c?w=400', 29),
  ('Açaí 500ml', 'Açaí cremoso com granola, banana e leite condensado', 22.90, 'Sobremesas', 'product', 'https://images.unsplash.com/photo-1590080874088-eec64895b423?w=400', 30),
  ('Mousse de Maracujá', 'Mousse cremoso de maracujá', 14.90, 'Sobremesas', 'product', 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400', 31),
  ('Pudim', 'Pudim de leite condensado tradicional', 12.90, 'Sobremesas', 'product', 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400', 32);

-- Insert all portions
INSERT INTO public.products (name, description, price, category, product_type, image_url, display_order) VALUES
  ('Batata Frita', 'Porção de batata frita crocante com cheddar e bacon', 28.90, 'Porções', 'product', 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400', 33),
  ('Onion Rings', 'Anéis de cebola empanados e fritos', 24.90, 'Porções', 'product', 'https://images.unsplash.com/photo-1639024471283-03518883512d?w=400', 34),
  ('Bolinho de Queijo', 'Bolinhos de queijo fritos (10 unidades)', 26.90, 'Porções', 'product', 'https://images.unsplash.com/photo-1531749668029-2db88e4276c7?w=400', 35),
  ('Nuggets de Frango', 'Nuggets de frango empanados (12 unidades)', 29.90, 'Porções', 'product', 'https://images.unsplash.com/photo-1562967914-608f82629710?w=400', 36),
  ('Calabresa Acebolada', 'Calabresa fatiada com cebola e farofa', 32.90, 'Porções', 'product', 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400', 37),
  ('Frango à Passarinho', 'Frango crocante temperado com alho', 34.90, 'Porções', 'product', 'https://images.unsplash.com/photo-1626645738196-c2a72c3c51c8?w=400', 38),
  ('Polenta Frita', 'Palitos de polenta crocantes', 22.90, 'Porções', 'product', 'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?w=400', 39),
  ('Mandioca Frita', 'Mandioca frita crocante', 24.90, 'Porções', 'product', 'https://images.unsplash.com/photo-1528750997573-59b89d56f4f7?w=400', 40);