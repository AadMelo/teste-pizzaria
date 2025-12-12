import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
  // Duplicate for infinite loop effect
  const duplicatedBanners = [...banners, ...banners];

  const handleOrderClick = (action: string) => {
    if (onCategorySelect) {
      onCategorySelect(action);
    }
    const menuSection = document.getElementById('menu-section');
    if (menuSection) {
      menuSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="relative overflow-hidden mx-3 md:mx-4 mt-3 md:mt-4 rounded-2xl md:rounded-3xl">
      {/* Main Banner Container */}
      <div className="relative h-[280px] sm:h-[320px] md:h-[400px] lg:h-[450px]">
        {/* Scrolling Track */}
        <motion.div
          className="flex h-full"
          animate={{
            x: ['0%', '-50%'],
          }}
          transition={{
            x: {
              repeat: Infinity,
              repeatType: 'loop',
              duration: 40,
              ease: 'linear',
            },
          }}
        >
          {duplicatedBanners.map((banner, index) => (
            <div
              key={`${banner.id}-${index}`}
              className="flex-shrink-0 w-full h-full relative"
            >
              {/* Background Image */}
              <div className="absolute inset-0">
                <img
                  src={banner.image}
                  alt={banner.title}
                  className="w-full h-full object-cover"
                  loading={index < 2 ? 'eager' : 'lazy'}
                />
              </div>

              {/* Sophisticated Multi-layer Overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-transparent opacity-60" />

              {/* Content */}
              <div className="relative z-10 h-full flex flex-col justify-center px-6 md:px-12 lg:px-16 max-w-3xl">
                {/* Badge */}
                <span className="inline-flex w-fit items-center gap-2 bg-white/10 backdrop-blur-md text-white/90 text-xs md:text-sm font-medium tracking-wide uppercase px-3 md:px-4 py-1.5 md:py-2 rounded-full border border-white/20 mb-3 md:mb-4">
                  <span className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-primary animate-pulse" />
                  {banner.badge}
                </span>

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
                <Button
                  className="group w-fit bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-5 md:px-8 py-2.5 md:py-3 text-sm md:text-base rounded-full shadow-xl transition-all duration-300 h-10 md:h-12"
                  onClick={() => handleOrderClick(banner.action)}
                >
                  Ver Cardápio
                  <ArrowRight className="ml-2 h-4 w-4 md:h-5 md:w-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
