import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface DatabaseProduct {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category: string;
  product_type: string;
  image_url: string | null;
  ingredients: string[] | null;
  size: string | null;
  is_available: boolean;
  display_order: number | null;
}

// Transform database product to Pizza format for compatibility
export interface Pizza {
  id: string;
  name: string;
  description: string;
  ingredients: string[];
  category: 'tradicional' | 'especial' | 'premium' | 'doce';
  basePrice: number;
  image: string;
}

// Transform database product to Product format for compatibility
export interface Product {
  id: string;
  name: string;
  description: string;
  category: 'bebida' | 'sobremesa' | 'porcao';
  price: number;
  image: string;
  size?: string;
}

const categoryMap: Record<string, string> = {
  'Pizzas Tradicionais': 'tradicional',
  'Pizzas Especiais': 'especial',
  'Pizzas Premium': 'premium',
  'Pizzas Doces': 'doce',
  'Bebidas': 'bebida',
  'Sobremesas': 'sobremesa',
  'Porções': 'porcao',
};

export function useProducts() {
  const [pizzas, setPizzas] = useState<Pizza[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_available', true)
        .order('display_order', { ascending: true });

      if (error) throw error;

      const pizzasList: Pizza[] = [];
      const productsList: Product[] = [];

      (data || []).forEach((item: DatabaseProduct) => {
        const mappedCategory = categoryMap[item.category] || item.category.toLowerCase();

        if (item.product_type === 'pizza') {
          pizzasList.push({
            id: item.id,
            name: item.name,
            description: item.description || '',
            ingredients: item.ingredients || [],
            category: mappedCategory as Pizza['category'],
            basePrice: item.price,
            image: item.image_url || 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800&q=100&fit=crop',
          });
        } else {
          productsList.push({
            id: item.id,
            name: item.name,
            description: item.description || '',
            category: mappedCategory as Product['category'],
            price: item.price,
            image: item.image_url || 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800&q=100&fit=crop',
            size: item.size || undefined,
          });
        }
      });

      setPizzas(pizzasList);
      setProducts(productsList);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Erro ao carregar produtos');
    } finally {
      setLoading(false);
    }
  };

  return { pizzas, products, loading, error, refetch: fetchProducts };
}
