import pizzaCamarao from '@/assets/pizza-camarao.jpg';

export interface Pizza {
  id: string;
  name: string;
  description: string;
  ingredients: string[];
  category: 'tradicional' | 'especial' | 'premium' | 'doce';
  basePrice: number;
  image: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  category: 'bebida' | 'sobremesa' | 'porcao';
  price: number;
  image: string;
  size?: string;
}

export interface PizzaSize {
  id: string;
  name: string;
  slices: number;
  serves: string;
  priceMultiplier: number;
}

export interface PizzaCrust {
  id: string;
  name: string;
  price: number;
}

export interface PizzaDough {
  id: string;
  name: string;
  price: number;
}

export interface PizzaExtra {
  id: string;
  name: string;
  price: number;
}

export const pizzas: Pizza[] = [
  {
    id: '1',
    name: 'Margherita',
    description: 'O clássico italiano com molho de tomate fresco, mussarela e manjericão',
    ingredients: ['Molho de tomate', 'Mussarela', 'Manjericão fresco', 'Azeite'],
    category: 'tradicional',
    basePrice: 35.90,
    image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&q=80'
  },
  {
    id: '2',
    name: 'Calabresa',
    description: 'Calabresa fatiada com cebola e azeitonas',
    ingredients: ['Molho de tomate', 'Mussarela', 'Calabresa', 'Cebola', 'Azeitonas'],
    category: 'tradicional',
    basePrice: 38.90,
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&q=80'
  },
  {
    id: '3',
    name: 'Portuguesa',
    description: 'Presunto, ovos, cebola, azeitonas e ervilha',
    ingredients: ['Molho de tomate', 'Mussarela', 'Presunto', 'Ovos', 'Cebola', 'Azeitonas', 'Ervilha'],
    category: 'tradicional',
    basePrice: 42.90,
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&q=80'
  },
  {
    id: '4',
    name: 'Quatro Queijos',
    description: 'Blend de mussarela, provolone, parmesão e gorgonzola',
    ingredients: ['Molho de tomate', 'Mussarela', 'Provolone', 'Parmesão', 'Gorgonzola'],
    category: 'especial',
    basePrice: 48.90,
    image: 'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?w=400&q=80'
  },
  {
    id: '5',
    name: 'Frango com Catupiry',
    description: 'Frango desfiado com catupiry cremoso',
    ingredients: ['Molho de tomate', 'Mussarela', 'Frango desfiado', 'Catupiry'],
    category: 'especial',
    basePrice: 45.90,
    image: 'https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?w=400&q=80'
  },
  {
    id: '6',
    name: 'Pepperoni',
    description: 'Pepperoni importado com queijo mussarela',
    ingredients: ['Molho de tomate', 'Mussarela', 'Pepperoni'],
    category: 'tradicional',
    basePrice: 44.90,
    image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400&q=80'
  },
  {
    id: '7',
    name: 'Bacon Supreme',
    description: 'Bacon crocante, mussarela e cebola caramelizada',
    ingredients: ['Molho de tomate', 'Mussarela', 'Bacon', 'Cebola caramelizada'],
    category: 'especial',
    basePrice: 49.90,
    image: 'https://images.unsplash.com/photo-1594007654729-407eedc4be65?w=400&q=80'
  },
  {
    id: '8',
    name: 'Vegetariana',
    description: 'Mix de legumes frescos grelhados',
    ingredients: ['Molho de tomate', 'Mussarela', 'Pimentão', 'Champignon', 'Tomate', 'Milho', 'Brócolis'],
    category: 'especial',
    basePrice: 43.90,
    image: 'https://images.unsplash.com/photo-1511689660979-10d2b1aada49?w=400&q=80'
  },
  {
    id: '9',
    name: 'Napolitana',
    description: 'Tomate fresco, mussarela de búfala e manjericão',
    ingredients: ['Molho de tomate', 'Mussarela de búfala', 'Tomate fresco', 'Manjericão'],
    category: 'premium',
    basePrice: 55.90,
    image: 'https://images.unsplash.com/photo-1595854341625-f33ee10dbf94?w=400&q=80'
  },
  {
    id: '10',
    name: 'Camarão',
    description: 'Camarões frescos com catupiry e alho',
    ingredients: ['Molho branco', 'Mussarela', 'Camarão', 'Catupiry', 'Alho'],
    category: 'premium',
    basePrice: 65.90,
    image: pizzaCamarao
  },
  {
    id: '11',
    name: 'Carne Seca',
    description: 'Carne seca desfiada com catupiry e cebola',
    ingredients: ['Molho de tomate', 'Mussarela', 'Carne seca', 'Catupiry', 'Cebola'],
    category: 'premium',
    basePrice: 58.90,
    image: 'https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?w=400&q=80'
  },
  {
    id: '12',
    name: 'Lombo Canadense',
    description: 'Lombo canadense com catupiry e abacaxi',
    ingredients: ['Molho de tomate', 'Mussarela', 'Lombo canadense', 'Catupiry', 'Abacaxi'],
    category: 'especial',
    basePrice: 52.90,
    image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&q=80'
  },
  {
    id: '13',
    name: 'Chocolate',
    description: 'Chocolate ao leite derretido com granulado',
    ingredients: ['Chocolate ao leite', 'Granulado'],
    category: 'doce',
    basePrice: 38.90,
    image: 'https://images.unsplash.com/photo-1481391319762-47dff72954d9?w=400&q=80'
  },
  {
    id: '14',
    name: 'Romeu e Julieta',
    description: 'Goiabada cremosa com queijo minas',
    ingredients: ['Goiabada', 'Queijo minas'],
    category: 'doce',
    basePrice: 40.90,
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&q=80'
  },
  {
    id: '15',
    name: 'Banana com Canela',
    description: 'Banana caramelizada com açúcar e canela',
    ingredients: ['Banana', 'Açúcar', 'Canela', 'Leite condensado'],
    category: 'doce',
    basePrice: 36.90,
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&q=80'
  },
  {
    id: '16',
    name: 'Prestigio',
    description: 'Chocolate com coco ralado',
    ingredients: ['Chocolate', 'Coco ralado', 'Leite condensado'],
    category: 'doce',
    basePrice: 42.90,
    image: 'https://images.unsplash.com/photo-1481391319762-47dff72954d9?w=400&q=80'
  }
];

export const products: Product[] = [
  // Bebidas
  {
    id: 'b1',
    name: 'Coca-Cola',
    description: 'Refrigerante Coca-Cola gelado',
    category: 'bebida',
    price: 6.90,
    size: '350ml',
    image: 'https://images.unsplash.com/photo-1629203851122-3726ecdf080e?w=400'
  },
  {
    id: 'b2',
    name: 'Coca-Cola',
    description: 'Refrigerante Coca-Cola gelado',
    category: 'bebida',
    price: 12.90,
    size: '2L',
    image: 'https://images.unsplash.com/photo-1629203851122-3726ecdf080e?w=400'
  },
  {
    id: 'b3',
    name: 'Guaraná Antarctica',
    description: 'Refrigerante Guaraná gelado',
    category: 'bebida',
    price: 6.90,
    size: '350ml',
    image: 'https://images.unsplash.com/photo-1625772299848-391b6a87d7b3?w=400'
  },
  {
    id: 'b4',
    name: 'Guaraná Antarctica',
    description: 'Refrigerante Guaraná gelado',
    category: 'bebida',
    price: 11.90,
    size: '2L',
    image: 'https://images.unsplash.com/photo-1625772299848-391b6a87d7b3?w=400'
  },
  {
    id: 'b5',
    name: 'Fanta Laranja',
    description: 'Refrigerante Fanta sabor laranja',
    category: 'bebida',
    price: 6.90,
    size: '350ml',
    image: 'https://images.unsplash.com/photo-1624517452488-04869289c4ca?w=400'
  },
  {
    id: 'b6',
    name: 'Sprite',
    description: 'Refrigerante Sprite limão',
    category: 'bebida',
    price: 6.90,
    size: '350ml',
    image: 'https://images.unsplash.com/photo-1625772299848-391b6a87d7b3?w=400'
  },
  {
    id: 'b7',
    name: 'Suco Natural',
    description: 'Suco natural de laranja ou limão',
    category: 'bebida',
    price: 9.90,
    size: '500ml',
    image: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400'
  },
  {
    id: 'b8',
    name: 'Água Mineral',
    description: 'Água mineral sem gás',
    category: 'bebida',
    price: 4.90,
    size: '500ml',
    image: 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=400'
  },
  {
    id: 'b9',
    name: 'Água com Gás',
    description: 'Água mineral com gás',
    category: 'bebida',
    price: 5.90,
    size: '500ml',
    image: 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=400'
  },
  {
    id: 'b10',
    name: 'Cerveja Heineken',
    description: 'Cerveja Heineken long neck gelada',
    category: 'bebida',
    price: 12.90,
    size: '330ml',
    image: 'https://images.unsplash.com/photo-1608270586620-248524c67de9?w=400'
  },
  // Sobremesas
  {
    id: 's1',
    name: 'Petit Gâteau',
    description: 'Bolo de chocolate com recheio cremoso e sorvete',
    category: 'sobremesa',
    price: 24.90,
    image: 'https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=400'
  },
  {
    id: 's2',
    name: 'Brownie com Sorvete',
    description: 'Brownie de chocolate com sorvete de creme',
    category: 'sobremesa',
    price: 19.90,
    image: 'https://images.unsplash.com/photo-1564355808539-22fda35bed7e?w=400'
  },
  {
    id: 's3',
    name: 'Churros',
    description: 'Churros recheados com doce de leite (4 unidades)',
    category: 'sobremesa',
    price: 16.90,
    image: 'https://images.unsplash.com/photo-1624371414361-e670edf4898c?w=400'
  },
  {
    id: 's4',
    name: 'Açaí',
    description: 'Açaí cremoso com granola, banana e leite condensado',
    category: 'sobremesa',
    price: 22.90,
    size: '500ml',
    image: 'https://images.unsplash.com/photo-1590080874088-eec64895b423?w=400'
  },
  {
    id: 's5',
    name: 'Mousse de Maracujá',
    description: 'Mousse cremoso de maracujá',
    category: 'sobremesa',
    price: 14.90,
    image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400'
  },
  {
    id: 's6',
    name: 'Pudim',
    description: 'Pudim de leite condensado tradicional',
    category: 'sobremesa',
    price: 12.90,
    image: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400'
  },
  // Porções
  {
    id: 'p1',
    name: 'Batata Frita',
    description: 'Porção de batata frita crocante com cheddar e bacon',
    category: 'porcao',
    price: 28.90,
    image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400'
  },
  {
    id: 'p2',
    name: 'Onion Rings',
    description: 'Anéis de cebola empanados e fritos',
    category: 'porcao',
    price: 24.90,
    image: 'https://images.unsplash.com/photo-1639024471283-03518883512d?w=400'
  },
  {
    id: 'p3',
    name: 'Bolinho de Queijo',
    description: 'Bolinhos de queijo fritos (10 unidades)',
    category: 'porcao',
    price: 26.90,
    image: 'https://images.unsplash.com/photo-1531749668029-2db88e4276c7?w=400'
  },
  {
    id: 'p4',
    name: 'Nuggets de Frango',
    description: 'Nuggets de frango empanados (12 unidades)',
    category: 'porcao',
    price: 29.90,
    image: 'https://images.unsplash.com/photo-1562967914-608f82629710?w=400'
  },
  {
    id: 'p5',
    name: 'Calabresa Acebolada',
    description: 'Calabresa fatiada com cebola e farofa',
    category: 'porcao',
    price: 32.90,
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400'
  },
  {
    id: 'p6',
    name: 'Frango à Passarinho',
    description: 'Frango crocante temperado com alho',
    category: 'porcao',
    price: 34.90,
    image: 'https://images.unsplash.com/photo-1626645738196-c2a72c3c51c8?w=400'
  },
  {
    id: 'p7',
    name: 'Polenta Frita',
    description: 'Palitos de polenta crocantes',
    category: 'porcao',
    price: 22.90,
    image: 'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?w=400'
  },
  {
    id: 'p8',
    name: 'Mandioca Frita',
    description: 'Mandioca frita crocante',
    category: 'porcao',
    price: 24.90,
    image: 'https://images.unsplash.com/photo-1528750997573-59b89d56f4f7?w=400'
  }
];

export const pizzaSizes: PizzaSize[] = [
  { id: 'broto', name: 'Broto', slices: 4, serves: '1 pessoa', priceMultiplier: 0.6 },
  { id: 'media', name: 'Média', slices: 6, serves: '2 pessoas', priceMultiplier: 0.8 },
  { id: 'grande', name: 'Grande', slices: 8, serves: '3-4 pessoas', priceMultiplier: 1 },
  { id: 'familia', name: 'Família', slices: 12, serves: '5-6 pessoas', priceMultiplier: 1.4 }
];

export const pizzaCrusts: PizzaCrust[] = [
  { id: 'sem', name: 'Sem borda recheada', price: 0 },
  { id: 'catupiry', name: 'Catupiry', price: 8.90 },
  { id: 'cheddar', name: 'Cheddar', price: 8.90 },
  { id: 'cream-cheese', name: 'Cream Cheese', price: 9.90 },
  { id: 'chocolate', name: 'Chocolate', price: 10.90 }
];

export const pizzaDoughs: PizzaDough[] = [
  { id: 'tradicional', name: 'Tradicional', price: 0 },
  { id: 'fina', name: 'Massa Fina', price: 0 },
  { id: 'pan', name: 'Pan (mais grossa)', price: 5.00 }
];

export const pizzaExtras: PizzaExtra[] = [
  { id: 'bacon', name: 'Bacon extra', price: 6.90 },
  { id: 'queijo', name: 'Queijo extra', price: 5.90 },
  { id: 'calabresa', name: 'Calabresa extra', price: 5.90 },
  { id: 'catupiry', name: 'Catupiry extra', price: 7.90 },
  { id: 'cebola', name: 'Cebola caramelizada', price: 4.90 }
];

export const categories = [
  { id: 'todas', name: 'Todas', icon: '🍕', type: 'pizza' },
  { id: 'tradicional', name: 'Tradicionais', icon: '🍕', type: 'pizza' },
  { id: 'especial', name: 'Especiais', icon: '⭐', type: 'pizza' },
  { id: 'premium', name: 'Premium', icon: '👑', type: 'pizza' },
  { id: 'doce', name: 'Doces', icon: '🍫', type: 'pizza' },
  { id: 'bebida', name: 'Bebidas', icon: '🥤', type: 'product' },
  { id: 'sobremesa', name: 'Sobremesas', icon: '🍰', type: 'product' },
  { id: 'porcao', name: 'Porções', icon: '🍟', type: 'product' }
];
