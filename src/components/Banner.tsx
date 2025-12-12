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
    <div className="relative overflow-hidden mx-3 md:mx-4 mt-3 md:mt-4">
      {/* Gradient Overlays */}
      <div className="absolute left-0 top-0 bottom-0 w-8 md:w-16 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-8 md:w-16 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

      {/* Scrolling Track */}
      <motion.div
        className="flex gap-4"
        animate={{
          x: [0, -((320 + 16) * banners.length)],
        }}
        transition={{
          x: {
            repeat: Infinity,
            repeatType: 'loop',
            duration: 30,
            ease: 'linear',
          },
        }}
      >
        {duplicatedBanners.map((banner, index) => (
          <motion.div
            key={`${banner.id}-${index}`}
            className="flex-shrink-0 w-[280px] md:w-[320px] h-[280px] sm:h-[320px] md:h-[380px] rounded-2xl md:rounded-3xl overflow-hidden relative group cursor-pointer"
            whileHover={{ scale: 1.02, y: -4 }}
            transition={{ duration: 0.3 }}
            onClick={() => handleOrderClick(banner.action)}
          >
            {/* Background Image */}
            <div className="absolute inset-0">
              <img
                src={banner.image}
                alt={banner.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                loading="lazy"
              />
            </div>

            {/* Overlay Gradients */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-transparent opacity-60" />

            {/* Content */}
            <div className="absolute inset-0 flex flex-col justify-end p-4 md:p-6">
              {/* Badge */}
              <span className="inline-flex w-fit items-center gap-2 bg-white/10 backdrop-blur-md text-white/90 text-xs font-medium tracking-wide uppercase px-3 py-1.5 rounded-full border border-white/20 mb-3">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                {banner.badge}
              </span>

              {/* Title */}
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-1 tracking-tight leading-tight">
                {banner.title}
              </h2>

              {/* Highlight */}
              <p className="text-base md:text-lg font-semibold text-primary mb-1">
                {banner.highlight}
              </p>

              {/* Description */}
              <p className="text-xs md:text-sm text-white/70 font-light mb-4 leading-relaxed line-clamp-2">
                {banner.description}
              </p>

              {/* CTA Button */}
              <Button
                className="group/btn w-fit bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-4 md:px-6 py-2 text-sm rounded-full shadow-xl transition-all duration-300 h-9 md:h-10"
                onClick={(e) => {
                  e.stopPropagation();
                  handleOrderClick(banner.action);
                }}
              >
                Ver Cardápio
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
              </Button>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
