import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

// Import custom banner images
import bannerPizzaGrande from '@/assets/banner-pizza-grande.jpg';
import bannerComboFamilia from '@/assets/banner-combo-familia.jpg';
import bannerDelivery from '@/assets/banner-delivery.jpg';
import bannerHappyHour from '@/assets/banner-happy-hour.jpg';
import bannerPremium from '@/assets/banner-premium.jpg';
import bannerDoces from '@/assets/banner-doces.jpg';

const banners = [
  {
    id: 1,
    title: 'Pizza Grande',
    highlight: 'A partir de R$ 35,90',
    description: 'Monte com até 4 sabores diferentes',
    badge: 'Mais Vendida',
    image: bannerPizzaGrande,
    action: 'pizzas',
  },
  {
    id: 2,
    title: 'Combo Família',
    highlight: '2 Pizzas + Refri 2L',
    description: 'Perfeito para reunir quem você ama',
    badge: 'Economia',
    image: bannerComboFamilia,
    action: 'pizzas',
  },
  {
    id: 3,
    title: 'Frete Grátis',
    highlight: 'Pedidos acima de R$ 60',
    description: 'Entrega rápida em até 45 minutos',
    badge: 'Delivery',
    image: bannerDelivery,
    action: 'pizzas',
  },
  {
    id: 4,
    title: 'Happy Hour',
    highlight: '18h às 20h',
    description: 'Todas as pizzas com 15% de desconto',
    badge: 'Tempo Limitado',
    image: bannerHappyHour,
    action: 'pizzas',
  },
  {
    id: 5,
    title: 'Pizzas Premium',
    highlight: 'Ingredientes Selecionados',
    description: 'Qualidade artesanal em cada fatia',
    badge: 'Exclusivo',
    image: bannerPremium,
    action: 'pizzas',
  },
  {
    id: 6,
    title: 'Pizzas Doces',
    highlight: 'A partir de R$ 36,90',
    description: 'Chocolate, Prestígio, Nutella e mais',
    badge: 'Sobremesa',
    image: bannerDoces,
    action: 'desserts',
  },
];

interface BannerProps {
  onCategorySelect?: (category: string) => void;
}

export default function Banner({ onCategorySelect }: BannerProps) {
  const [current, setCurrent] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [direction, setDirection] = useState(0);

  const paginate = useCallback((newDirection: number) => {
    setDirection(newDirection);
    setCurrent((prev) => (prev + newDirection + banners.length) % banners.length);
  }, []);

  useEffect(() => {
    if (isHovered) return;
    
    const timer = setInterval(() => {
      paginate(1);
    }, 5000);
    return () => clearInterval(timer);
  }, [isHovered, paginate]);

  const handleOrderClick = (action: string) => {
    if (onCategorySelect) {
      onCategorySelect(action);
    }
    const menuSection = document.getElementById('menu-section');
    if (menuSection) {
      menuSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? '100%' : '-100%',
      opacity: 0,
      scale: 1.1,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: [0.32, 0.72, 0, 1] as const,
      },
    },
    exit: (direction: number) => ({
      x: direction < 0 ? '100%' : '-100%',
      opacity: 0,
      scale: 0.95,
      transition: {
        duration: 0.5,
        ease: [0.32, 0.72, 0, 1] as const,
      },
    }),
  };

  const contentVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        delay: 0.2,
        ease: 'easeOut' as const,
      },
    },
  };

  const banner = banners[current];

  return (
    <div 
      className="relative overflow-hidden mx-3 md:mx-4 mt-3 md:mt-4 rounded-2xl md:rounded-3xl"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Main Banner Container */}
      <div className="relative h-[280px] sm:h-[320px] md:h-[400px] lg:h-[450px]">
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.div
            key={current}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="absolute inset-0"
          >
            {/* Background Image with Ken Burns Effect */}
            <motion.div
              className="absolute inset-0"
              animate={{ scale: [1, 1.05] }}
              transition={{ duration: 6, ease: 'linear' }}
            >
              <img
                src={banner.image}
                alt={banner.title}
                className="w-full h-full object-cover"
                loading="eager"
              />
            </motion.div>
            
            {/* Sophisticated Multi-layer Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-transparent opacity-60" />
            
            {/* Content */}
            <motion.div 
              variants={contentVariants}
              initial="hidden"
              animate="visible"
              className="relative z-10 h-full flex flex-col justify-center px-6 md:px-12 lg:px-16 max-w-3xl"
            >
              {/* Badge */}
              <motion.span 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className="inline-flex w-fit items-center gap-2 bg-white/10 backdrop-blur-md text-white/90 text-xs md:text-sm font-medium tracking-wide uppercase px-3 md:px-4 py-1.5 md:py-2 rounded-full border border-white/20 mb-3 md:mb-4"
              >
                <span className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-primary animate-pulse" />
                {banner.badge}
              </motion.span>
              
              {/* Title */}
              <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-2 md:mb-3 tracking-tight leading-tight">
                {banner.title}
              </h2>
              
              {/* Highlight */}
              <p className="text-lg md:text-2xl lg:text-3xl font-semibold text-primary mb-2 md:mb-3">
                {banner.highlight}
              </p>
              
              {/* Description */}
              <p className="text-sm md:text-base lg:text-lg text-white/80 font-light mb-4 md:mb-6 max-w-md leading-relaxed hidden sm:block">
                {banner.description}
              </p>
              
              {/* CTA Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Button 
                  className="group w-fit bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-5 md:px-8 py-2.5 md:py-3 text-sm md:text-base rounded-full shadow-xl transition-all duration-300 h-10 md:h-12"
                  onClick={() => handleOrderClick(banner.action)}
                >
                  Ver Cardápio
                  <ArrowRight className="ml-2 h-4 w-4 md:h-5 md:w-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation Arrows */}
        <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between px-2 md:px-4 z-20 pointer-events-none">
          <Button
            variant="ghost"
            size="icon"
            className="pointer-events-auto bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/10 h-9 w-9 md:h-12 md:w-12 rounded-full transition-all duration-300 shadow-lg"
            onClick={() => paginate(-1)}
          >
            <ChevronLeft className="h-5 w-5 md:h-6 md:w-6" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="pointer-events-auto bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/10 h-9 w-9 md:h-12 md:w-12 rounded-full transition-all duration-300 shadow-lg"
            onClick={() => paginate(1)}
          >
            <ChevronRight className="h-5 w-5 md:h-6 md:w-6" />
          </Button>
        </div>

        {/* Progress Indicators */}
        <div className="absolute bottom-4 md:bottom-6 left-6 md:left-12 lg:left-16 flex items-center gap-2 md:gap-3 z-20">
          {banners.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                setDirection(i > current ? 1 : -1);
                setCurrent(i);
              }}
              className="group relative h-1 md:h-1.5 rounded-full overflow-hidden transition-all duration-300"
              style={{ width: i === current ? '32px' : '12px' }}
            >
              <div className="absolute inset-0 bg-white/30" />
              {i === current && (
                <motion.div
                  className="absolute inset-0 bg-white"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 5, ease: 'linear' }}
                  style={{ transformOrigin: 'left' }}
                />
              )}
            </button>
          ))}
        </div>

        {/* Slide Counter */}
        <div className="absolute bottom-4 md:bottom-6 right-4 md:right-6 z-20 flex items-center gap-2 text-white/60 text-xs md:text-sm font-medium">
          <span className="text-white font-semibold">{String(current + 1).padStart(2, '0')}</span>
          <span className="w-4 md:w-6 h-px bg-white/40" />
          <span>{String(banners.length).padStart(2, '0')}</span>
        </div>
      </div>
    </div>
  );
}
