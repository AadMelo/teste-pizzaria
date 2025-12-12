import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

// Fallback static banners (used when no banners in database)
import bannerPizzaGrande from '@/assets/banner-pizza-grande.jpg';
import bannerComboFamilia from '@/assets/banner-combo-familia.jpg';
import bannerDelivery from '@/assets/banner-delivery.jpg';

interface BannerData {
  id: string;
  title: string;
  subtitle: string | null;
  image_url: string;
  link_url: string | null;
  button_text: string | null;
  is_active: boolean;
  display_order: number;
}

const fallbackBanners = [
  {
    id: 'fallback-1',
    title: 'PIZZA GRANDE',
    subtitle: 'A partir de R$ 35,90',
    image_url: bannerPizzaGrande,
    link_url: null,
    button_text: 'Peça Agora 🍕',
    is_active: true,
    display_order: 0,
  },
  {
    id: 'fallback-2',
    title: 'COMBO FAMÍLIA',
    subtitle: '2 Pizzas + Refri 2L por R$ 89,90',
    image_url: bannerComboFamilia,
    link_url: null,
    button_text: 'Ver Combo',
    is_active: true,
    display_order: 1,
  },
  {
    id: 'fallback-3',
    title: 'FRETE GRÁTIS',
    subtitle: 'Em pedidos acima de R$ 60',
    image_url: bannerDelivery,
    link_url: null,
    button_text: 'Aproveitar',
    is_active: true,
    display_order: 2,
  },
];

interface BannerProps {
  onCategorySelect?: (category: string) => void;
}

export default function Banner({ onCategorySelect }: BannerProps) {
  const [banners, setBanners] = useState<BannerData[]>([]);
  const [loading, setLoading] = useState(true);
  const [current, setCurrent] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      const { data, error } = await supabase
        .from('banners')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) throw error;
      
      if (data && data.length > 0) {
        setBanners(data as BannerData[]);
      } else {
        setBanners(fallbackBanners);
      }
    } catch (error) {
      console.error('Error fetching banners:', error);
      setBanners(fallbackBanners);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isHovered || banners.length <= 1) return;
    
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % banners.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [isHovered, banners.length]);

  const prev = () => setCurrent((prev) => (prev - 1 + banners.length) % banners.length);
  const next = () => setCurrent((prev) => (prev + 1) % banners.length);

  const handleOrderClick = (linkUrl: string | null) => {
    if (linkUrl) {
      if (linkUrl.startsWith('http')) {
        window.open(linkUrl, '_blank');
      } else {
        window.location.href = linkUrl;
      }
    } else {
      if (onCategorySelect) {
        onCategorySelect('pizzas');
      }
      const menuSection = document.getElementById('menu-section');
      if (menuSection) {
        menuSection.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  if (loading) {
    return (
      <div className="relative overflow-hidden rounded-xl md:rounded-3xl mx-3 md:mx-4 mt-3 md:mt-4 h-[180px] md:h-[320px] bg-zinc-900 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (banners.length === 0) return null;

  return (
    <div 
      className="relative overflow-hidden rounded-xl md:rounded-3xl mx-3 md:mx-4 mt-3 md:mt-4 h-[180px] md:h-[320px] shadow-lg md:shadow-2xl"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {banners.map((banner, index) => (
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
            src={banner.image_url}
            alt={banner.title}
            className="absolute inset-0 w-full h-full object-cover"
            loading="lazy"
          />
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
          
          {/* Content */}
          <div className={`relative z-10 h-full flex flex-col justify-center p-5 md:p-12 max-w-2xl transition-all duration-500 ${
            index === current ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'
          }`}>
            {/* Title */}
            <h2 className="text-2xl md:text-5xl font-black text-white mb-1 md:mb-2 tracking-tight drop-shadow-2xl">
              {banner.title}
            </h2>
            
            {/* Subtitle */}
            {banner.subtitle && (
              <p className="text-base md:text-2xl font-bold text-orange-400 mb-1 md:mb-2 drop-shadow-lg">
                {banner.subtitle}
              </p>
            )}
            
            {/* CTA Button */}
            {banner.button_text && (
              <Button 
                className="mt-3 md:mt-4 w-fit bg-orange-500 hover:bg-orange-600 text-white font-bold px-5 md:px-6 py-2 md:py-2.5 text-sm md:text-base shadow-xl active:scale-95 transition-transform h-10 md:h-11"
                onClick={() => handleOrderClick(banner.link_url)}
              >
                {banner.button_text}
              </Button>
            )}
          </div>
        </div>
      ))}

      {/* Navigation Arrows */}
      {banners.length > 1 && (
        <>
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
        </>
      )}

      {/* Dots Indicator */}
      {banners.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 hidden md:flex gap-2 z-20">
          {banners.map((_, i) => (
            <button
              key={i}
              className={`rounded-full transition-all duration-300 shadow-md ${
                i === current 
                  ? 'w-8 h-3 bg-orange-500' 
                  : 'w-3 h-3 bg-white/50 hover:bg-white/80'
              }`}
              onClick={() => setCurrent(i)}
            />
          ))}
        </div>
      )}

      {/* Slide Counter */}
      {banners.length > 1 && (
        <div className="absolute top-2 md:top-4 right-2 md:right-4 z-20 bg-black/40 backdrop-blur-sm text-white text-[10px] md:text-xs font-bold px-2 md:px-3 py-1 rounded-full">
          {current + 1}/{banners.length}
        </div>
      )}
    </div>
  );
}
