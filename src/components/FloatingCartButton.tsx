import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useCart } from '@/contexts/CartContext';
import Cart from './Cart';

export default function FloatingCartButton() {
  const { itemCount, total } = useCart();

  if (itemCount === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 md:hidden safe-bottom">
      <Sheet>
        <SheetTrigger asChild>
          <Button 
            size="lg"
            className="h-14 w-14 rounded-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 shadow-lg shadow-orange-500/40 animate-scale-in"
          >
            <div className="relative">
              <ShoppingCart className="h-6 w-6 text-white" />
              <span className="absolute -top-3 -right-3 h-5 w-5 rounded-full bg-white text-xs text-orange-600 flex items-center justify-center font-bold shadow-sm">
                {itemCount > 9 ? '9+' : itemCount}
              </span>
            </div>
          </Button>
        </SheetTrigger>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto p-0">
          <Cart />
        </SheetContent>
      </Sheet>
      
      {/* Total Badge */}
      <div className="absolute -top-2 -left-2 bg-background border border-border rounded-full px-2 py-0.5 shadow-md">
        <span className="text-xs font-bold text-foreground">
          R$ {total.toFixed(0)}
        </span>
      </div>
    </div>
  );
}
