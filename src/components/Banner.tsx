import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Flame, Gift, Truck, Clock, Star, Percent, Pizza, Sparkles, Calendar, Moon, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Import custom banner images
import bannerPizzaGrande from '@/assets/banner-pizza-grande.jpg';
import bannerComboFamilia from '@/assets/banner-combo-familia.jpg';
import bannerDelivery from '@/assets/banner-delivery.jpg';
import bannerDesconto from '@/assets/banner-desconto.jpg';
import bannerHappyHour from '@/assets/banner-happy-hour.jpg';
import bannerPremium from '@/assets/banner-premium.jpg';
import bannerDoces from '@/assets/banner-doces.jpg';
import bannerPrimeiraCompra from '@/assets/banner-primeira-compra.jpg';
import bannerFidelidade from '@/assets/banner-fidelidade.jpg';
import bannerFimSemana from '@/assets/banner-fim-semana.jpg';
import bannerNoturno from '@/assets/banner-noturno.jpg';

const banners = [
  {
    id: 1,
    title: 'PIZZA GRANDE',
    subtitle: 'A partir de R$ 35,90',
    description: '🔥 Monte com até 4 sabores!',
    badge: 'MAIS VENDIDA',
    badgeColor: 'bg-red-600',
    image: bannerPizzaGrande,
    gradient: 'from-red-900/90 via-red-800/70 to-transparent',
    accentColor: 'text-red-400',
    icon: Flame,
    action: 'pizzas',
  },
  {
    id: 2,
    title: 'PRIMEIRA COMPRA',
    subtitle: '15% OFF no primeiro pedido',
    description: 'Use o cupom: BEMVINDO15',
    badge: 'NOVOS CLIENTES',
    badgeColor: 'bg-emerald-600',
    image: bannerPrimeiraCompra,
    gradient: 'from-emerald-900/90 via-emerald-800/70 to-transparent',
    accentColor: 'text-emerald-400',
    icon: Sparkles,
    action: 'pizzas',
  },
  {
    id: 3,
    title: 'COMBO FAMÍLIA',
    subtitle: '2 Pizzas + Refri 2L',
    description: 'Por apenas R$ 89,90',
    badge: 'ECONOMIA',
    badgeColor: 'bg-green-600',
    image: bannerComboFamilia,
    gradient: 'from-green-900/90 via-green-800/70 to-transparent',
    accentColor: 'text-green-400',
    icon: Gift,
    action: 'pizzas',
  },
  {
    id: 4,
    title: 'FRETE GRÁTIS',
    subtitle: 'Pedidos acima de R$ 60',
    description: 'Entrega em até 45 min',
    badge: 'DELIVERY',
    badgeColor: 'bg-blue-600',
    image: bannerDelivery,
    gradient: 'from-blue-900/90 via-blue-800/70 to-transparent',
    accentColor: 'text-blue-400',
    icon: Truck,
    action: 'pizzas',
  },
  {
    id: 5,
    title: 'CLUBE VIP',
    subtitle: 'Ganhe pontos a cada pedido',
    description: 'Troque por pizzas grátis!',
    badge: 'FIDELIDADE',
    badgeColor: 'bg-yellow-600',
    image: bannerFidelidade,
    gradient: 'from-yellow-900/90 via-yellow-800/70 to-transparent',
    accentColor: 'text-yellow-400',
    icon: Crown,
    action: 'pizzas',
  },
  {
    id: 6,
    title: 'CUPOM: PROMO10',
    subtitle: '10% OFF em todo pedido',
    description: 'Use o cupom no carrinho!',
    badge: 'DESCONTO',
    badgeColor: 'bg-amber-600',
    image: bannerDesconto,
    gradient: 'from-amber-900/90 via-amber-800/70 to-transparent',
    accentColor: 'text-amber-400',
    icon: Percent,
    action: 'pizzas',
  },
  {
    id: 7,
    title: 'FIM DE SEMANA',
    subtitle: 'Sábado e Domingo especiais',
    description: '3ª pizza com 50% OFF',
    badge: 'PROMOÇÃO',
    badgeColor: 'bg-teal-600',
    image: bannerFimSemana,
    gradient: 'from-teal-900/90 via-teal-800/70 to-transparent',
    accentColor: 'text-teal-400',
    icon: Calendar,
    action: 'pizzas',
  },
  {
    id: 8,
    title: 'HAPPY HOUR',
    subtitle: '18h às 20h',
    description: 'Todas as pizzas com 15% OFF',
    badge: 'TEMPO LIMITADO',
    badgeColor: 'bg-purple-600',
    image: bannerHappyHour,
    gradient: 'from-purple-900/90 via-purple-800/70 to-transparent',
    accentColor: 'text-purple-400',
    icon: Clock,
    action: 'pizzas',
  },
  {
    id: 9,
    title: 'NOITE ESPECIAL',
    subtitle: 'Após as 21h',
    description: 'Bordas recheadas grátis!',
    badge: 'NOTURNO',
    badgeColor: 'bg-indigo-600',
    image: bannerNoturno,
    gradient: 'from-indigo-900/90 via-indigo-800/70 to-transparent',
    accentColor: 'text-indigo-400',
    icon: Moon,
    action: 'pizzas',
  },
  {
    id: 10,
    title: 'PIZZAS PREMIUM',
    subtitle: 'Ingredientes selecionados',
    description: 'Qualidade 5 estrelas ⭐',
    badge: 'EXCLUSIVO',
    badgeColor: 'bg-orange-600',
    image: bannerPremium,
    gradient: 'from-orange-900/90 via-orange-800/70 to-transparent',
    accentColor: 'text-orange-400',
    icon: Star,
    action: 'pizzas',
  },
  {
    id: 11,
    title: 'PIZZAS DOCES',
    subtitle: 'Chocolate, Prestígio, Nutella',
    description: 'A partir de R$ 36,90',
    badge: 'SOBREMESA',
    badgeColor: 'bg-pink-600',
    image: bannerDoces,
    gradient: 'from-pink-900/90 via-pink-800/70 to-transparent',
    accentColor: 'text-pink-400',
    icon: Pizza,
    action: 'desserts',
  },
];

interface BannerProps {
  onCategorySelect?: (category: string) => void;
}

export default function Banner({ onCategorySelect }: BannerProps) {
  const [current, setCurrent] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (isHovered) return;
    
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % banners.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [isHovered]);

  const prev = () => setCurrent((prev) => (prev - 1 + banners.length) % banners.length);
  const next = () => setCurrent((prev) => (prev + 1) % banners.length);

  const handleOrderClick = (action: string) => {
    if (onCategorySelect) {
      onCategorySelect(action);
    }
    // Scroll to the menu section
    const menuSection = document.getElementById('menu-section');
    if (menuSection) {
      menuSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div 
      className="relative overflow-hidden rounded-xl md:rounded-3xl mx-3 md:mx-4 mt-3 md:mt-4 h-[180px] md:h-[320px] shadow-lg md:shadow-2xl"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {banners.map((banner, index) => {
        const IconComponent = banner.icon;
        return (
          <div
            key={banner.id}
            className={`absolute inset-0 transition-all duration-700 ease-out ${
              index === current 
                ? 'opacity-100 scale-100 z-10' 
                : index === (current - 1 + banners.length) % banners.length
                ? 'opacity-0 -translate-x-full z-0'
                : 'opacity-0 translate-x-full z-0'
            }`}
          >
            {/* Background Image */}
            <img
              src={banner.image}
              alt={banner.title}
              className="absolute inset-0 w-full h-full object-cover"
              loading="lazy"
            />
            
            {/* Gradient Overlay */}
            <div className={`absolute inset-0 bg-gradient-to-r ${banner.gradient}`} />
            
            {/* Content */}
            <div className={`relative z-10 h-full flex flex-col justify-center p-5 md:p-12 max-w-2xl transition-all duration-500 ${
              index === current ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'
            }`}>
              {/* Badge */}
              <div className="flex items-center gap-2 mb-2 md:mb-3">
                <span className={`inline-flex items-center gap-1 ${banner.badgeColor} text-white text-xs md:text-sm font-bold px-2.5 md:px-3 py-1 rounded-full shadow-lg`}>
                  <IconComponent className="h-3.5 w-3.5 md:h-4 md:w-4" />
                  {banner.badge}
                </span>
              </div>
              
              {/* Title */}
              <h2 className="text-2xl md:text-5xl font-black text-white mb-1 md:mb-2 tracking-tight drop-shadow-2xl">
                {banner.title}
              </h2>
              
              {/* Subtitle */}
              <p className={`text-base md:text-2xl font-bold ${banner.accentColor} mb-1 md:mb-2 drop-shadow-lg`}>
                {banner.subtitle}
              </p>
              
              {/* Description */}
              <p className="text-sm md:text-lg text-white/90 font-medium drop-shadow-md hidden md:block">
                {banner.description}
              </p>
              
              {/* CTA Button */}
              <Button 
                className={`mt-3 md:mt-4 w-fit ${banner.badgeColor} hover:opacity-90 text-white font-bold px-5 md:px-6 py-2 md:py-2.5 text-sm md:text-base shadow-xl active:scale-95 transition-transform h-10 md:h-11`}
                onClick={() => handleOrderClick(banner.action)}
              >
                Peça Agora 🍕
              </Button>
            </div>
          </div>
        );
      })}

      {/* Navigation Arrows - Hidden on small mobile */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute left-2 md:left-3 top-1/2 -translate-y-1/2 z-20 bg-white/20 active:bg-white/40 text-white border-0 backdrop-blur-sm h-8 w-8 md:h-12 md:w-12 rounded-full shadow-lg transition-all touch-target"
        onClick={prev}
      >
        <ChevronLeft className="h-4 w-4 md:h-6 md:w-6" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-2 md:right-3 top-1/2 -translate-y-1/2 z-20 bg-white/20 active:bg-white/40 text-white border-0 backdrop-blur-sm h-8 w-8 md:h-12 md:w-12 rounded-full shadow-lg transition-all touch-target"
        onClick={next}
      >
        <ChevronRight className="h-4 w-4 md:h-6 md:w-6" />
      </Button>

      {/* Dots Indicator - Hidden on mobile */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 hidden md:flex gap-2 z-20">
        {banners.map((banner, i) => (
          <button
            key={i}
            className={`rounded-full transition-all duration-300 shadow-md ${
              i === current 
                ? `w-8 h-3 ${banner.badgeColor}` 
                : 'w-3 h-3 bg-white/50 hover:bg-white/80'
            }`}
            onClick={() => setCurrent(i)}
          />
        ))}
      </div>

      {/* Slide Counter */}
      <div className="absolute top-2 md:top-4 right-2 md:right-4 z-20 bg-black/40 backdrop-blur-sm text-white text-[10px] md:text-xs font-bold px-2 md:px-3 py-1 rounded-full">
        {current + 1}/{banners.length}
      </div>
    </div>
  );
}
