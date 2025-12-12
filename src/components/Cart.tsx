import { useState } from 'react';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useCart, CartPizza, CartProduct } from '@/contexts/CartContext';
import Checkout from './Checkout';

export default function Cart() {
  const {
    items,
    removeFromCart,
    updateQuantity,
    subtotal,
    deliveryFee,
    total,
  } = useCart();
  
  const [showCheckout, setShowCheckout] = useState(false);

  if (showCheckout) {
    return <Checkout onBack={() => setShowCheckout(false)} />;
  }

  const renderCartItem = (item: CartPizza | CartProduct) => {
    if (item.type === 'pizza') {
      const pizzaItem = item as CartPizza;
      return (
        <div key={pizzaItem.id} className="bg-muted/50 rounded-xl p-4 space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className="font-semibold">
                🍕 Pizza {pizzaItem.size.name}
              </h4>
              <p className="text-sm text-muted-foreground">
                {pizzaItem.flavors.map((f) => f.name).join(' + ')}
              </p>
              {pizzaItem.crust.price > 0 && (
                <p className="text-xs text-muted-foreground">
                  Borda: {pizzaItem.crust.name}
                </p>
              )}
              {pizzaItem.dough.price > 0 && (
                <p className="text-xs text-muted-foreground">
                  Massa: {pizzaItem.dough.name}
                </p>
              )}
              {pizzaItem.extras.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  Adicionais: {pizzaItem.extras.map((e) => e.name).join(', ')}
                </p>
              )}
              {pizzaItem.observations && (
                <p className="text-xs text-muted-foreground italic">
                  Obs: {pizzaItem.observations}
                </p>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={() => removeFromCart(pizzaItem.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => updateQuantity(pizzaItem.id, pizzaItem.quantity - 1)}
              >
                <Minus className="h-3 w-3" />
              </Button>
              <span className="w-8 text-center font-medium">{pizzaItem.quantity}</span>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => updateQuantity(pizzaItem.id, pizzaItem.quantity + 1)}
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>
            <span className="font-bold text-primary">
              R$ {(pizzaItem.totalPrice * pizzaItem.quantity).toFixed(2).replace('.', ',')}
            </span>
          </div>
        </div>
      );
    } else {
      const productItem = item as CartProduct;
      return (
        <div key={productItem.id} className="bg-muted/50 rounded-xl p-4 space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex-1 flex gap-3">
              <img 
                src={productItem.product.image} 
                alt={productItem.product.name}
                className="w-12 h-12 rounded-lg object-cover"
              />
              <div>
                <h4 className="font-semibold">
                  {productItem.product.category === 'bebida' && '🥤'}
                  {productItem.product.category === 'sobremesa' && '🍰'}
                  {productItem.product.category === 'porcao' && '🍟'}
                  {' '}{productItem.product.name}
                </h4>
                {productItem.product.size && (
                  <p className="text-xs text-muted-foreground">{productItem.product.size}</p>
                )}
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={() => removeFromCart(productItem.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => updateQuantity(productItem.id, productItem.quantity - 1)}
              >
                <Minus className="h-3 w-3" />
              </Button>
              <span className="w-8 text-center font-medium">{productItem.quantity}</span>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => updateQuantity(productItem.id, productItem.quantity + 1)}
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>
            <span className="font-bold text-primary">
              R$ {(productItem.totalPrice * productItem.quantity).toFixed(2).replace('.', ',')}
            </span>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="flex flex-col h-full">
      <SheetHeader>
        <SheetTitle className="flex items-center gap-2">
          <ShoppingBag className="h-5 w-5" />
          Carrinho
        </SheetTitle>
      </SheetHeader>

      {items.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
          <div className="text-6xl mb-4">🍕</div>
          <h3 className="text-lg font-semibold mb-2">Carrinho vazio</h3>
          <p className="text-muted-foreground">
            Adicione pizzas deliciosas ao seu carrinho!
          </p>
        </div>
      ) : (
        <>
          {/* Items */}
          <div className="flex-1 overflow-y-auto py-4 space-y-4">
            {items.map((item) => renderCartItem(item))}
          </div>

          <Separator />

          {/* Summary */}
          <div className="py-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span>R$ {subtotal.toFixed(2).replace('.', ',')}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Taxa de entrega</span>
              <span>R$ {deliveryFee.toFixed(2).replace('.', ',')}</span>
            </div>
            <Separator />
            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span className="text-primary">R$ {total.toFixed(2).replace('.', ',')}</span>
            </div>
          </div>

          {/* Checkout Button */}
          <Button
            className="w-full bg-primary hover:bg-primary/90"
            size="lg"
            onClick={() => setShowCheckout(true)}
          >
            Finalizar Pedido
          </Button>
        </>
      )}
    </div>
  );
}