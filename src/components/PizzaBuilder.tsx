import { useState, useMemo } from 'react';
import { X, Check, Search, Plus, Minus, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import {
  Pizza,
  PizzaSize,
  PizzaCrust,
  PizzaDough,
  PizzaExtra,
  Product,
  pizzas,
  pizzaSizes,
  pizzaCrusts,
  pizzaDoughs,
  pizzaExtras,
  products,
  categories,
} from '@/data/pizzaData';
import { useCart, CartPizza } from '@/contexts/CartContext';
import { toast } from 'sonner';

interface PizzaBuilderProps {
  isOpen: boolean;
  onClose: () => void;
  initialPizza?: Pizza;
}

type BuilderStep = 'size' | 'flavors-count' | 'flavors' | 'crust' | 'dough' | 'extras' | 'drinks' | 'review';

const steps: { id: BuilderStep; label: string }[] = [
  { id: 'size', label: 'Tamanho' },
  { id: 'flavors-count', label: 'Sabores' },
  { id: 'flavors', label: 'Escolher' },
  { id: 'crust', label: 'Borda' },
  { id: 'dough', label: 'Massa' },
  { id: 'extras', label: 'Adicionais' },
  { id: 'drinks', label: 'Bebidas' },
  { id: 'review', label: 'Resumo' },
];

// Filter only drinks from products
const drinkProducts = products.filter((p) => p.category === 'bebida');

export default function PizzaBuilder({ isOpen, onClose, initialPizza }: PizzaBuilderProps) {
  const { addToCart, addProductToCart } = useCart();
  
  const [currentStep, setCurrentStep] = useState<BuilderStep>('size');
  const [selectedSize, setSelectedSize] = useState<PizzaSize | null>(null);
  const [flavorsCount, setFlavorsCount] = useState(1);
  const [selectedFlavors, setSelectedFlavors] = useState<Pizza[]>(initialPizza ? [initialPizza] : []);
  const [selectedCrust, setSelectedCrust] = useState<PizzaCrust>(pizzaCrusts[0]);
  const [selectedDough, setSelectedDough] = useState<PizzaDough>(pizzaDoughs[0]);
  const [selectedExtras, setSelectedExtras] = useState<PizzaExtra[]>([]);
  const [selectedDrinks, setSelectedDrinks] = useState<{ product: Product; quantity: number }[]>([]);
  const [observations, setObservations] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('todas');

  const currentStepIndex = steps.findIndex((s) => s.id === currentStep);

  const filteredPizzas = useMemo(() => {
    return pizzas.filter((pizza) => {
      const matchesSearch = pizza.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = filterCategory === 'todas' || pizza.category === filterCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, filterCategory]);

  const drinksTotal = useMemo(() => {
    return selectedDrinks.reduce((acc, d) => acc + d.product.price * d.quantity, 0);
  }, [selectedDrinks]);

  const calculatePrice = useMemo(() => {
    if (!selectedSize || selectedFlavors.length === 0) return 0;

    // Price based on most expensive flavor
    const maxFlavorPrice = Math.max(...selectedFlavors.map((f) => f.basePrice));
    const basePrice = maxFlavorPrice * selectedSize.priceMultiplier;
    const crustPrice = selectedCrust.price;
    const doughPrice = selectedDough.price;
    const extrasPrice = selectedExtras.reduce((acc, e) => acc + e.price, 0);

    return basePrice + crustPrice + doughPrice + extrasPrice;
  }, [selectedSize, selectedFlavors, selectedCrust, selectedDough, selectedExtras]);

  const totalWithDrinks = useMemo(() => {
    return (calculatePrice * quantity) + drinksTotal;
  }, [calculatePrice, quantity, drinksTotal]);

  const canProceed = () => {
    switch (currentStep) {
      case 'size':
        return selectedSize !== null;
      case 'flavors-count':
        return true;
      case 'flavors':
        return selectedFlavors.length === flavorsCount;
      default:
        return true;
    }
  };

  const goNext = () => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < steps.length) {
      setCurrentStep(steps[nextIndex].id);
    }
  };

  const goPrev = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(steps[prevIndex].id);
    }
  };

  const toggleFlavor = (pizza: Pizza) => {
    if (selectedFlavors.find((f) => f.id === pizza.id)) {
      setSelectedFlavors((prev) => prev.filter((f) => f.id !== pizza.id));
    } else if (selectedFlavors.length < flavorsCount) {
      setSelectedFlavors((prev) => [...prev, pizza]);
    }
  };

  const toggleExtra = (extra: PizzaExtra) => {
    if (selectedExtras.find((e) => e.id === extra.id)) {
      setSelectedExtras((prev) => prev.filter((e) => e.id !== extra.id));
    } else {
      setSelectedExtras((prev) => [...prev, extra]);
    }
  };

  const addDrink = (product: Product) => {
    const existing = selectedDrinks.find((d) => d.product.id === product.id);
    if (existing) {
      setSelectedDrinks((prev) =>
        prev.map((d) =>
          d.product.id === product.id ? { ...d, quantity: d.quantity + 1 } : d
        )
      );
    } else {
      setSelectedDrinks((prev) => [...prev, { product, quantity: 1 }]);
    }
  };

  const removeDrink = (productId: string) => {
    const existing = selectedDrinks.find((d) => d.product.id === productId);
    if (existing && existing.quantity > 1) {
      setSelectedDrinks((prev) =>
        prev.map((d) =>
          d.product.id === productId ? { ...d, quantity: d.quantity - 1 } : d
        )
      );
    } else {
      setSelectedDrinks((prev) => prev.filter((d) => d.product.id !== productId));
    }
  };

  const getDrinkQuantity = (productId: string) => {
    const drink = selectedDrinks.find((d) => d.product.id === productId);
    return drink?.quantity || 0;
  };

  const handleAddToCart = () => {
    if (!selectedSize || selectedFlavors.length === 0) return;

    const cartPizza: CartPizza = {
      id: `pizza-${Date.now()}`,
      type: 'pizza',
      size: selectedSize,
      flavors: selectedFlavors,
      crust: selectedCrust,
      dough: selectedDough,
      extras: selectedExtras,
      quantity,
      totalPrice: calculatePrice,
      observations,
    };

    addToCart(cartPizza);
    
    // Also add selected drinks to cart
    selectedDrinks.forEach((drink) => {
      const product = {
        ...drink.product,
        quantity: drink.quantity,
      };
      for (let i = 0; i < drink.quantity; i++) {
        addProductToCart(drink.product);
      }
    });
    
    const drinkCount = selectedDrinks.reduce((acc, d) => acc + d.quantity, 0);
    if (drinkCount > 0) {
      toast.success(`Pizza + ${drinkCount} bebida${drinkCount > 1 ? 's' : ''} adicionados ao carrinho!`);
    } else {
      toast.success('Pizza adicionada ao carrinho!');
    }
    resetBuilder();
    onClose();
  };

  const resetBuilder = () => {
    setCurrentStep('size');
    setSelectedSize(null);
    setFlavorsCount(1);
    setSelectedFlavors([]);
    setSelectedCrust(pizzaCrusts[0]);
    setSelectedDough(pizzaDoughs[0]);
    setSelectedExtras([]);
    setSelectedDrinks([]);
    setObservations('');
    setQuantity(1);
    setSearchQuery('');
    setFilterCategory('todas');
  };

  const renderStep = () => {
    switch (currentStep) {
      case 'size':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-center">Escolha o tamanho</h3>
            <div className="grid grid-cols-2 gap-3">
              {pizzaSizes.map((size) => (
                <button
                  key={size.id}
                  onClick={() => setSelectedSize(size)}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    selectedSize?.id === size.id
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <p className="font-bold text-lg">{size.name}</p>
                  <p className="text-sm text-muted-foreground">{size.slices} fatias</p>
                  <p className="text-sm text-muted-foreground">{size.serves}</p>
                </button>
              ))}
            </div>
          </div>
        );

      case 'flavors-count':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-center">Quantos sabores?</h3>
            <div className="grid grid-cols-2 gap-3">
              {[1, 2, 3, 4].map((count) => (
                <button
                  key={count}
                  onClick={() => {
                    setFlavorsCount(count);
                    setSelectedFlavors(selectedFlavors.slice(0, count));
                  }}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    flavorsCount === count
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <p className="font-bold text-2xl">{count}</p>
                  <p className="text-sm text-muted-foreground">
                    {count === 1 ? 'sabor' : 'sabores'}
                  </p>
                </button>
              ))}
            </div>
            <p className="text-sm text-muted-foreground text-center">
              O preço será calculado pelo sabor mais caro
            </p>
          </div>
        );

      case 'flavors':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">
                Escolha {flavorsCount} {flavorsCount === 1 ? 'sabor' : 'sabores'}
              </h3>
              <Badge variant="outline">
                {selectedFlavors.length}/{flavorsCount}
              </Badge>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar sabores..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Category Filter */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setFilterCategory(cat.id)}
                  className={`px-3 py-1 rounded-full text-sm whitespace-nowrap transition-all ${
                    filterCategory === cat.id
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted hover:bg-muted/80'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {/* Flavors Grid */}
            <ScrollArea className="h-[300px]">
              <div className="grid grid-cols-2 gap-2">
                {filteredPizzas.map((pizza) => {
                  const isSelected = selectedFlavors.find((f) => f.id === pizza.id);
                  const canSelect = selectedFlavors.length < flavorsCount || isSelected;
                  return (
                    <button
                      key={pizza.id}
                      onClick={() => canSelect && toggleFlavor(pizza)}
                      disabled={!canSelect}
                      className={`relative p-2 rounded-xl border-2 transition-all text-left ${
                        isSelected
                          ? 'border-primary bg-primary/10'
                          : canSelect
                          ? 'border-border hover:border-primary/50'
                          : 'border-border opacity-50 cursor-not-allowed'
                      }`}
                    >
                      <img
                        src={pizza.image}
                        alt={pizza.name}
                        className="w-full aspect-square object-cover rounded-lg mb-2"
                      />
                      <p className="font-medium text-sm truncate">{pizza.name}</p>
                      <p className="text-xs text-muted-foreground">
                        R$ {pizza.basePrice.toFixed(2).replace('.', ',')}
                      </p>
                      {isSelected && (
                        <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                          <Check className="h-4 w-4 text-primary-foreground" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </ScrollArea>
          </div>
        );

      case 'crust':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-center">Escolha a borda</h3>
            <div className="space-y-2">
              {pizzaCrusts.map((crust) => (
                <button
                  key={crust.id}
                  onClick={() => setSelectedCrust(crust)}
                  className={`w-full p-4 rounded-xl border-2 transition-all flex items-center justify-between ${
                    selectedCrust.id === crust.id
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <span className="font-medium">{crust.name}</span>
                  <span className="text-muted-foreground">
                    {crust.price > 0 ? `+R$ ${crust.price.toFixed(2).replace('.', ',')}` : 'Grátis'}
                  </span>
                </button>
              ))}
            </div>
          </div>
        );

      case 'dough':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-center">Escolha a massa</h3>
            <div className="space-y-2">
              {pizzaDoughs.map((dough) => (
                <button
                  key={dough.id}
                  onClick={() => setSelectedDough(dough)}
                  className={`w-full p-4 rounded-xl border-2 transition-all flex items-center justify-between ${
                    selectedDough.id === dough.id
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <span className="font-medium">{dough.name}</span>
                  <span className="text-muted-foreground">
                    {dough.price > 0 ? `+R$ ${dough.price.toFixed(2).replace('.', ',')}` : 'Grátis'}
                  </span>
                </button>
              ))}
            </div>
          </div>
        );

      case 'extras':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-center">Adicionais (opcional)</h3>
            <div className="space-y-2">
              {pizzaExtras.map((extra) => {
                const isSelected = selectedExtras.find((e) => e.id === extra.id);
                return (
                  <button
                    key={extra.id}
                    onClick={() => toggleExtra(extra)}
                    className={`w-full p-4 rounded-xl border-2 transition-all flex items-center justify-between ${
                      isSelected
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                          isSelected ? 'bg-primary border-primary' : 'border-muted-foreground'
                        }`}
                      >
                        {isSelected && <Check className="h-3 w-3 text-primary-foreground" />}
                      </div>
                      <span className="font-medium">{extra.name}</span>
                    </div>
                    <span className="text-muted-foreground">
                      +R$ {extra.price.toFixed(2).replace('.', ',')}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        );

      case 'drinks':
        return (
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="text-lg font-semibold">🥤 Adicione bebidas!</h3>
              <p className="text-sm text-muted-foreground">(opcional)</p>
            </div>
            
            <ScrollArea className="h-[300px]">
              <div className="grid grid-cols-2 gap-3">
                {drinkProducts.map((drink) => {
                  const qty = getDrinkQuantity(drink.id);
                  return (
                    <div
                      key={drink.id}
                      className={`relative p-3 rounded-xl border-2 transition-all ${
                        qty > 0
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <img
                        src={drink.image}
                        alt={drink.name}
                        className="w-full aspect-square object-cover rounded-lg mb-2"
                      />
                      <p className="font-medium text-sm truncate">{drink.name}</p>
                      {drink.size && (
                        <p className="text-xs text-muted-foreground">{drink.size}</p>
                      )}
                      <p className="text-sm font-bold text-primary">
                        R$ {drink.price.toFixed(2).replace('.', ',')}
                      </p>
                      
                      {/* Quantity Controls */}
                      <div className="flex items-center justify-center gap-2 mt-2">
                        {qty > 0 ? (
                          <>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => removeDrink(drink.id)}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="font-bold w-6 text-center">{qty}</span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => addDrink(drink)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full h-7"
                            onClick={() => addDrink(drink)}
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            Adicionar
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>

            {selectedDrinks.length > 0 && (
              <div className="bg-muted/50 rounded-xl p-3 space-y-2">
                <p className="text-sm font-semibold">Bebidas selecionadas:</p>
                {selectedDrinks.map((d) => (
                  <div key={d.product.id} className="flex justify-between text-sm">
                    <span>{d.quantity}x {d.product.name} {d.product.size && `(${d.product.size})`}</span>
                    <span className="font-medium">R$ {(d.product.price * d.quantity).toFixed(2).replace('.', ',')}</span>
                  </div>
                ))}
                <div className="border-t pt-2 flex justify-between font-bold">
                  <span>Subtotal bebidas</span>
                  <span className="text-primary">R$ {drinksTotal.toFixed(2).replace('.', ',')}</span>
                </div>
              </div>
            )}
          </div>
        );

      case 'review':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-center">Resumo do pedido</h3>
            
            <div className="bg-muted/50 rounded-xl p-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tamanho</span>
                <span className="font-medium">{selectedSize?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Sabores</span>
                <span className="font-medium text-right">
                  {selectedFlavors.map((f) => f.name).join(', ')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Borda</span>
                <span className="font-medium">{selectedCrust.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Massa</span>
                <span className="font-medium">{selectedDough.name}</span>
              </div>
              {selectedExtras.length > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Adicionais</span>
                  <span className="font-medium text-right">
                    {selectedExtras.map((e) => e.name).join(', ')}
                  </span>
                </div>
              )}
              {selectedDrinks.length > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Bebidas</span>
                  <span className="font-medium text-right">
                    {selectedDrinks.map((d) => `${d.quantity}x ${d.product.name}`).join(', ')}
                  </span>
                </div>
              )}
            </div>

            <Textarea
              placeholder="Observações (opcional)"
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              className="resize-none"
            />

            <div className="flex items-center justify-center gap-4">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="text-xl font-bold w-8 text-center">{quantity}</span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setQuantity(quantity + 1)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => { resetBuilder(); onClose(); }}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-center pizza-gradient-text">
            Monte sua Pizza
          </DialogTitle>
        </DialogHeader>

        {/* Steps indicator */}
        <div className="flex items-center justify-between px-2 mb-4">
          {steps.map((step, i) => (
            <div key={step.id} className="flex items-center">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  i <= currentStepIndex
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {i + 1}
              </div>
              {i < steps.length - 1 && (
                <div
                  className={`w-4 h-0.5 mx-1 ${
                    i < currentStepIndex ? 'bg-primary' : 'bg-muted'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-1">{renderStep()}</div>

        {/* Footer */}
        <div className="border-t pt-4 mt-4">
          {/* Price */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-muted-foreground">Total</span>
            <span className="text-2xl font-bold text-primary">
              R$ {totalWithDrinks.toFixed(2).replace('.', ',')}
            </span>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            {currentStepIndex > 0 && (
              <Button variant="outline" onClick={goPrev} className="flex-1">
                <ChevronLeft className="h-4 w-4 mr-1" />
                Voltar
              </Button>
            )}
            {currentStep === 'review' ? (
              <Button
                onClick={handleAddToCart}
                className="flex-1 bg-primary hover:bg-primary/90"
              >
                Adicionar ao Carrinho
              </Button>
            ) : (
              <Button
                onClick={goNext}
                disabled={!canProceed()}
                className="flex-1 bg-primary hover:bg-primary/90"
              >
                Próximo
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
