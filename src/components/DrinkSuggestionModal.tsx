import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, ShoppingCart, X } from 'lucide-react';
import { Product } from '@/data/pizzaData';
import { useProducts } from '@/hooks/useProducts';
import { ScrollArea } from '@/components/ui/scroll-area';

interface DrinkSuggestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (selectedDrinks: Product[]) => void;
  pizzaName: string;
}

export default function DrinkSuggestionModal({ 
  isOpen, 
  onClose, 
  onConfirm,
  pizzaName 
}: DrinkSuggestionModalProps) {
  const { products } = useProducts();
  const [selectedDrinks, setSelectedDrinks] = useState<Product[]>([]);

  const drinks = products.filter(p => p.category === 'bebida');

  const toggleDrink = (drink: Product) => {
    setSelectedDrinks(prev => {
      const exists = prev.find(d => d.id === drink.id);
      if (exists) {
        return prev.filter(d => d.id !== drink.id);
      }
      return [...prev, drink];
    });
  };

  const handleConfirm = () => {
    onConfirm(selectedDrinks);
    setSelectedDrinks([]);
  };

  const handleSkip = () => {
    onConfirm([]);
    setSelectedDrinks([]);
  };

  const totalDrinks = selectedDrinks.reduce((acc, d) => acc + d.price, 0);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md max-h-[85vh] flex flex-col bg-background">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            🥤 Adicionar bebida?
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Quer uma bebida para acompanhar sua <span className="font-semibold text-primary">{pizzaName}</span>?
          </p>
        </DialogHeader>

        <ScrollArea className="flex-1 max-h-[50vh] pr-2">
          <div className="grid grid-cols-2 gap-2">
            {drinks.map((drink) => {
              const isSelected = selectedDrinks.some(d => d.id === drink.id);
              return (
                <button
                  key={drink.id}
                  onClick={() => toggleDrink(drink)}
                  className={`relative p-2 rounded-lg border-2 transition-all text-left ${
                    isSelected 
                      ? 'border-primary bg-primary/10' 
                      : 'border-border hover:border-primary/50 bg-card'
                  }`}
                >
                  {isSelected && (
                    <div className="absolute top-1 right-1 bg-primary text-primary-foreground rounded-full p-0.5">
                      <Check className="h-3 w-3" />
                    </div>
                  )}
                  <div className="aspect-square rounded-md overflow-hidden mb-1.5">
                    <img 
                      src={drink.image} 
                      alt={drink.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p className="font-medium text-xs line-clamp-1">{drink.name}</p>
                  {drink.size && (
                    <Badge variant="secondary" className="text-[9px] px-1 py-0 mt-0.5">
                      {drink.size}
                    </Badge>
                  )}
                  <p className="text-primary font-bold text-sm mt-1">
                    R$ {drink.price.toFixed(2).replace('.', ',')}
                  </p>
                </button>
              );
            })}
          </div>
        </ScrollArea>

        <DialogFooter className="flex-col gap-2 sm:flex-col">
          {selectedDrinks.length > 0 && (
            <div className="w-full text-center py-2 bg-primary/10 rounded-lg">
              <p className="text-sm">
                <span className="text-muted-foreground">{selectedDrinks.length} bebida(s):</span>{' '}
                <span className="font-bold text-primary">
                  + R$ {totalDrinks.toFixed(2).replace('.', ',')}
                </span>
              </p>
            </div>
          )}
          <div className="flex gap-2 w-full">
            <Button 
              variant="outline" 
              onClick={handleSkip}
              className="flex-1"
            >
              <X className="h-4 w-4 mr-1" />
              Só a pizza
            </Button>
            <Button 
              onClick={handleConfirm}
              className="flex-1"
              disabled={selectedDrinks.length === 0}
            >
              <ShoppingCart className="h-4 w-4 mr-1" />
              Adicionar
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}