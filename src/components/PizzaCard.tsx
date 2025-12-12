import { Plus } from 'lucide-react';
import { Pizza } from '@/data/pizzaData';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface PizzaCardProps {
  pizza: Pizza;
  onSelect: (pizza: Pizza) => void;
}

export default function PizzaCard({ pizza, onSelect }: PizzaCardProps) {
  const categoryColors = {
    tradicional: 'bg-green-500/20 text-green-700 dark:text-green-400',
    especial: 'bg-blue-500/20 text-blue-700 dark:text-blue-400',
    premium: 'bg-amber-500/20 text-amber-700 dark:text-amber-400',
    doce: 'bg-pink-500/20 text-pink-700 dark:text-pink-400',
  };

  return (
    <div className="group bg-card rounded-xl overflow-hidden shadow-sm border border-border/50 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 active:scale-[0.98]">
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={pizza.image}
          alt={pizza.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />
        <Badge className={`absolute top-2 left-2 text-xs px-2 py-1 ${categoryColors[pizza.category]} transition-transform duration-300 group-hover:scale-105`}>
          {pizza.category === 'tradicional' && 'Tradicional'}
          {pizza.category === 'especial' && 'Especial'}
          {pizza.category === 'premium' && 'Premium'}
          {pizza.category === 'doce' && 'Doce'}
        </Badge>
      </div>

      {/* Content */}
      <div className="p-3 md:p-4">
        <h3 className="font-bold text-sm md:text-base mb-1 line-clamp-1">{pizza.name}</h3>
        <p className="text-xs md:text-sm text-muted-foreground line-clamp-1 mb-2">
          {pizza.ingredients.slice(0, 3).join(', ')}
        </p>
        
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">A partir</p>
            <p className="text-base md:text-lg font-bold text-primary">
              R$ {pizza.basePrice.toFixed(2).replace('.', ',')}
            </p>
          </div>
          <Button
            onClick={() => onSelect(pizza)}
            className="rounded-full bg-primary hover:bg-primary/90 h-10 w-10 md:h-11 md:w-11 transition-all duration-200 hover:scale-110 active:scale-95"
            size="icon"
          >
            <Plus className="h-5 w-5 md:h-6 md:w-6" />
          </Button>
        </div>
      </div>
    </div>
  );
}
