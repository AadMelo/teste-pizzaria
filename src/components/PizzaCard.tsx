import { ShoppingCart, Settings2 } from 'lucide-react';
import { Pizza } from '@/data/pizzaData';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface PizzaCardProps {
  pizza: Pizza;
  onSelect: (pizza: Pizza) => void;
  onQuickAdd: (pizza: Pizza) => void;
}

export default function PizzaCard({ pizza, onSelect, onQuickAdd }: PizzaCardProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const categoryColors = {
    tradicional: 'bg-green-500/20 text-green-700 dark:text-green-400',
    especial: 'bg-blue-500/20 text-blue-700 dark:text-blue-400',
    premium: 'bg-amber-500/20 text-amber-700 dark:text-amber-400',
    doce: 'bg-pink-500/20 text-pink-700 dark:text-pink-400',
  };

  const handleQuickAdd = () => {
    if (!user) {
      toast.info('Faça login para montar seu pedido!');
      navigate('/auth');
      return;
    }
    onQuickAdd(pizza);
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
        
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-xs text-muted-foreground">A partir</p>
            <p className="text-base md:text-lg font-bold text-primary">
              R$ {pizza.basePrice.toFixed(2).replace('.', ',')}
            </p>
          </div>
          <div className="flex gap-1.5">
            <Button
              onClick={handleQuickAdd}
              className="rounded-full bg-primary hover:bg-primary/90 h-9 w-9 md:h-10 md:w-10 transition-all duration-200 hover:scale-110 active:scale-95"
              size="icon"
              title="Adicionar pizza grande padrão"
            >
              <ShoppingCart className="h-4 w-4 md:h-5 md:w-5" />
            </Button>
            <Button
              onClick={() => onSelect(pizza)}
              variant="outline"
              className="rounded-full h-9 w-9 md:h-10 md:w-10 transition-all duration-200 hover:scale-110 active:scale-95 border-primary/50 hover:bg-primary/10"
              size="icon"
              title="Personalizar pizza"
            >
              <Settings2 className="h-4 w-4 md:h-5 md:w-5 text-primary" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}