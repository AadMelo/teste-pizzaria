import { useState, useEffect } from 'react';
import { Clock, Flame, Zap, Gift } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface TimeLeft {
  hours: number;
  minutes: number;
  seconds: number;
}

interface FlashDeal {
  id: number;
  title: string;
  description: string;
  originalPrice: number;
  discountPrice: number;
  discount: number;
  endTime: Date;
  icon: React.ElementType;
  gradient: string;
  sold: number;
  total: number;
}

const getEndOfDay = () => {
  const now = new Date();
  const endOfDay = new Date(now);
  endOfDay.setHours(23, 59, 59, 999);
  return endOfDay;
};

const getEndOfHappyHour = () => {
  const now = new Date();
  const happyHour = new Date(now);
  happyHour.setHours(20, 0, 0, 0);
  if (now > happyHour) {
    happyHour.setDate(happyHour.getDate() + 1);
  }
  return happyHour;
};

const flashDeals: FlashDeal[] = [
  {
    id: 1,
    title: 'Pizza Grande + Refri',
    description: 'Qualquer sabor + refrigerante 2L',
    originalPrice: 59.90,
    discountPrice: 44.90,
    discount: 25,
    endTime: getEndOfDay(),
    icon: Flame,
    gradient: 'from-red-500 to-orange-500',
    sold: 47,
    total: 100,
  },
  {
    id: 2,
    title: 'Combo Casal',
    description: '2 pizzas médias + 2 refris',
    originalPrice: 89.90,
    discountPrice: 69.90,
    discount: 22,
    endTime: getEndOfHappyHour(),
    icon: Zap,
    gradient: 'from-purple-500 to-pink-500',
    sold: 23,
    total: 50,
  },
  {
    id: 3,
    title: 'Pizza Doce Grátis',
    description: 'Ganhe broto doce em pedidos +R$80',
    originalPrice: 29.90,
    discountPrice: 0,
    discount: 100,
    endTime: getEndOfDay(),
    icon: Gift,
    gradient: 'from-amber-500 to-yellow-500',
    sold: 89,
    total: 150,
  },
];

function CountdownTimer({ endTime }: { endTime: Date }) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = endTime.getTime() - new Date().getTime();
      
      if (difference > 0) {
        setTimeLeft({
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      } else {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [endTime]);

  const formatNumber = (num: number) => num.toString().padStart(2, '0');

  return (
    <div className="flex items-center gap-1 text-xs font-mono">
      <div className="bg-foreground/10 rounded px-1.5 py-0.5 font-bold">
        {formatNumber(timeLeft.hours)}
      </div>
      <span className="text-muted-foreground">:</span>
      <div className="bg-foreground/10 rounded px-1.5 py-0.5 font-bold">
        {formatNumber(timeLeft.minutes)}
      </div>
      <span className="text-muted-foreground">:</span>
      <div className="bg-foreground/10 rounded px-1.5 py-0.5 font-bold animate-pulse">
        {formatNumber(timeLeft.seconds)}
      </div>
    </div>
  );
}

function ProgressBar({ sold, total }: { sold: number; total: number }) {
  const percentage = (sold / total) * 100;
  
  return (
    <div className="w-full">
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-primary to-primary/80 rounded-full transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <p className="text-[10px] text-muted-foreground mt-1">
        {sold} vendidos de {total}
      </p>
    </div>
  );
}

export default function FlashDeals() {
  return (
    <section className="mx-3 md:mx-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="bg-gradient-to-r from-red-500 to-orange-500 p-1.5 rounded-lg">
            <Zap className="h-4 w-4 md:h-5 md:w-5 text-white" />
          </div>
          <div>
            <h2 className="text-base md:text-lg font-bold">Ofertas Relâmpago</h2>
            <p className="text-xs text-muted-foreground">Corra! Tempo limitado</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Clock className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Termina em breve</span>
        </div>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2 -mx-3 px-3 scroll-container">
        {flashDeals.map((deal) => {
          const IconComponent = deal.icon;
          
          return (
            <Card 
              key={deal.id}
              className="min-w-[260px] md:min-w-[280px] flex-shrink-0 overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              {/* Header with gradient */}
              <div className={`bg-gradient-to-r ${deal.gradient} p-3 relative overflow-hidden`}>
                <div className="absolute -right-4 -top-4 w-16 h-16 bg-white/10 rounded-full" />
                <div className="absolute -right-2 -bottom-6 w-12 h-12 bg-white/10 rounded-full" />
                
                <div className="flex items-start justify-between relative z-10">
                  <div className="flex items-center gap-2">
                    <IconComponent className="h-5 w-5 text-white" />
                    <Badge className="bg-white/20 text-white border-0 text-[10px]">
                      -{deal.discount}%
                    </Badge>
                  </div>
                  <div className="text-right">
                    <p className="text-white/80 text-[10px]">Termina em</p>
                    <div className="text-white">
                      <CountdownTimer endTime={deal.endTime} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-3 space-y-3">
                <div>
                  <h3 className="font-bold text-sm">{deal.title}</h3>
                  <p className="text-xs text-muted-foreground">{deal.description}</p>
                </div>

                <div className="flex items-baseline gap-2">
                  <span className="text-lg font-black text-primary">
                    {deal.discountPrice === 0 ? 'GRÁTIS' : `R$ ${deal.discountPrice.toFixed(2).replace('.', ',')}`}
                  </span>
                  <span className="text-xs text-muted-foreground line-through">
                    R$ {deal.originalPrice.toFixed(2).replace('.', ',')}
                  </span>
                </div>

                <ProgressBar sold={deal.sold} total={deal.total} />

                <Button 
                  className={`w-full bg-gradient-to-r ${deal.gradient} hover:opacity-90 text-white font-bold text-sm h-9`}
                >
                  Aproveitar Agora
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
