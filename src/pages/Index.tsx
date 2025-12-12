import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import Header from '@/components/Header';
import Banner from '@/components/Banner';
import HeroHighlights from '@/components/HeroHighlights';
import StoreInfo from '@/components/StoreInfo';
import HowItWorks from '@/components/HowItWorks';
import SpecialOffers from '@/components/SpecialOffers';

import FeaturedPizzas from '@/components/FeaturedPizzas';
import Categories from '@/components/Categories';
import PizzaCard from '@/components/PizzaCard';
import ProductCard from '@/components/ProductCard';
import PizzaBuilder from '@/components/PizzaBuilder';
import Testimonials from '@/components/Testimonials';
import Footer from '@/components/Footer';
import SocialProofNotification from '@/components/SocialProofNotification';
import { pizzas, products, Pizza, Product } from '@/data/pizzaData';
import { useCart } from '@/contexts/CartContext';
import { useOrderNotifications } from '@/hooks/useOrderNotifications';
import { toast } from 'sonner';

export default function Index() {
  const [selectedCategory, setSelectedCategory] = useState('todas');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPizza, setSelectedPizza] = useState<Pizza | null>(null);
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const { addProductToCart } = useCart();
  
  // Subscribe to order status notifications
  useOrderNotifications();

  const filteredPizzas = useMemo(() => {
    if (['bebida', 'sobremesa', 'porcao'].includes(selectedCategory)) {
      return [];
    }
    return pizzas.filter((pizza) => {
      const matchesSearch = pizza.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pizza.ingredients.some((i) => i.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory = selectedCategory === 'todas' || pizza.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  const filteredProducts = useMemo(() => {
    if (!['bebida', 'sobremesa', 'porcao'].includes(selectedCategory)) {
      return [];
    }
    return products.filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = product.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  const handleSelectPizza = (pizza: Pizza) => {
    setSelectedPizza(pizza);
    setIsBuilderOpen(true);
  };

  const handleCloseBuilder = () => {
    setIsBuilderOpen(false);
    setSelectedPizza(null);
  };

  const handleAddProduct = (product: Product) => {
    addProductToCart(product);
    toast.success(`${product.name} adicionado ao carrinho!`);
  };

  const handleBannerCategorySelect = (category: string) => {
    if (category === 'pizzas') {
      setSelectedCategory('todas');
    } else if (category === 'desserts') {
      setSelectedCategory('doce');
    }
  };

  const isProductCategory = ['bebida', 'sobremesa', 'porcao'].includes(selectedCategory);

  const getCategoryTitle = () => {
    switch (selectedCategory) {
      case 'todas': return '🍕 Cardápio Completo';
      case 'tradicional': return '🍕 Pizzas Tradicionais';
      case 'especial': return '⭐ Pizzas Especiais';
      case 'premium': return '👑 Pizzas Premium';
      case 'doce': return '🍫 Pizzas Doces';
      case 'bebida': return '🥤 Bebidas';
      case 'sobremesa': return '🍰 Sobremesas';
      case 'porcao': return '🍟 Porções';
      default: return 'Cardápio';
    }
  };

  const getItemCount = () => {
    if (isProductCategory) {
      return filteredProducts.length;
    }
    return filteredPizzas.length;
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-background"
    >
      <Header onSearch={setSearchQuery} />
      
      <main className="max-w-7xl mx-auto pb-6 md:pb-8 px-0 md:px-4">
        {/* Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Banner onCategorySelect={handleBannerCategorySelect} />
        </motion.div>

        {/* Strategic Hero Highlights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
        >
          <HeroHighlights />
        </motion.div>
        
        {/* Store Info Bar + Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <StoreInfo />
        </motion.div>
        
        {/* How It Works */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <HowItWorks />
        </motion.div>
        
        {/* Special Offers */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <SpecialOffers />
        </motion.div>
        
        {/* Featured Pizzas - only show on pizza categories */}
        {!isProductCategory && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <FeaturedPizzas pizzas={pizzas} onSelect={handleSelectPizza} />
          </motion.div>
        )}
        
        {/* Categories */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <Categories selected={selectedCategory} onSelect={setSelectedCategory} />
        </motion.div>
        
        {/* Products Grid */}
        <motion.section 
          id="menu-section" 
          className="px-3 md:px-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base md:text-lg font-bold">{getCategoryTitle()}</h2>
            <span className="text-muted-foreground text-xs md:text-sm">
              {getItemCount()} itens
            </span>
          </div>
          
          {getItemCount() === 0 ? (
            <motion.div 
              className="text-center py-12"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <p className="text-3xl mb-2">🔍</p>
              <p className="text-muted-foreground text-sm">Nenhum item encontrado</p>
            </motion.div>
          ) : isProductCategory ? (
            <motion.div 
              className="grid grid-cols-2 gap-3"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: { staggerChildren: 0.05 },
                },
              }}
            >
              {filteredProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0 },
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <ProductCard
                    product={product}
                    onAdd={handleAddProduct}
                  />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div 
              className="grid grid-cols-2 gap-3"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: { staggerChildren: 0.05 },
                },
              }}
            >
              {filteredPizzas.map((pizza, index) => (
                <motion.div
                  key={pizza.id}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0 },
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <PizzaCard
                    pizza={pizza}
                    onSelect={handleSelectPizza}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
        </motion.section>

        {/* Testimonials */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <Testimonials />
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <Footer />
        </motion.div>
      </main>

      {/* Pizza Builder Modal */}
      <PizzaBuilder
        isOpen={isBuilderOpen}
        onClose={handleCloseBuilder}
        initialPizza={selectedPizza || undefined}
      />

      {/* Social Proof Notifications */}
      <SocialProofNotification />
    </motion.div>
  );
}
