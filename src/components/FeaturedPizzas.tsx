import { Pizza } from '@/data/pizzaData';
import { Star, Flame } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FeaturedPizzasProps {
  pizzas: Pizza[];
  onSelect: (pizza: Pizza) => void;
}

export default function FeaturedPizzas({ pizzas, onSelect }: FeaturedPizzasProps) {
  const featuredPizzas = pizzas.filter(p => p.category === 'premium' || p.category === 'especial').slice(0, 4);

  return (
    <div className="mx-3 mb-4">
      <h2 className="text-sm font-bold mb-2 flex items-center gap-1.5">
        <Flame className="h-4 w-4 text-primary" />
        Mais Pedidas
      </h2>
      
      <div className="grid grid-cols-2 gap-2 sm:flex sm:gap-2 sm:overflow-x-auto sm:pb-1 sm:-mx-3 sm:px-3 scroll-container">
        {featuredPizzas.map((pizza, index) => (
          <div
            key={pizza.id}
            className="relative cursor-pointer active:scale-[0.98] transition-transform sm:min-w-[140px] sm:flex-shrink-0 scroll-item"
            onClick={() => onSelect(pizza)}
          >
            <div className="relative overflow-hidden rounded-xl aspect-square">
              <img
                src={pizza.image}
                alt={pizza.name}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              
              <div className="absolute top-1.5 left-1.5 w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-[9px]">
                #{index + 1}
              </div>
              
              <div className="absolute top-1.5 right-1.5 flex items-center gap-0.5 bg-black/50 rounded-full px-1.5 py-0.5">
                <Star className="h-2.5 w-2.5 fill-yellow-400 text-yellow-400" />
                <span className="text-white text-[9px] font-bold">4.9</span>
              </div>
              
              <div className="absolute bottom-0 left-0 right-0 p-2">
                <h3 className="font-bold text-white text-[11px] truncate">{pizza.name}</h3>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-white font-bold text-xs">
                    R$ {pizza.basePrice.toFixed(2).replace('.', ',')}
                  </span>
                  <Button size="sm" className="h-5 text-[9px] px-2 bg-primary hover:bg-primary/90">
                    Pedir
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
