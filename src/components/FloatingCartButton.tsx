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
            size="sm"
            className="h-11 w-11 rounded-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 shadow-lg shadow-orange-500/30 animate-scale-in p-0"
          >
            <div className="relative">
              <ShoppingCart className="h-5 w-5 text-white" />
              <span className="absolute -top-2 -right-2 h-4 w-4 rounded-full bg-white text-[10px] text-orange-600 flex items-center justify-center font-bold shadow-sm">
                {itemCount > 9 ? '9+' : itemCount}
              </span>
            </div>
          </Button>
        </SheetTrigger>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto p-0">
          <Cart />
        </SheetContent>
      </Sheet>
    </div>
  );
}
