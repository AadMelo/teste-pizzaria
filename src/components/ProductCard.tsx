import { Plus } from 'lucide-react';
import { Product } from '@/data/pizzaData';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface ProductCardProps {
  product: Product;
  onAdd: (product: Product) => void;
}

export default function ProductCard({ product, onAdd }: ProductCardProps) {
  const categoryColors = {
    bebida: 'bg-blue-500/20 text-blue-700 dark:text-blue-400',
    sobremesa: 'bg-pink-500/20 text-pink-700 dark:text-pink-400',
    porcao: 'bg-amber-500/20 text-amber-700 dark:text-amber-400',
  };

  const categoryLabels = {
    bebida: 'Bebida',
    sobremesa: 'Sobremesa',
    porcao: 'Porção',
  };

  return (
    <div className="group bg-card rounded-xl overflow-hidden shadow-sm border border-border/50 active:scale-[0.98] transition-transform">
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        <Badge className={`absolute top-1.5 left-1.5 text-[9px] px-1.5 py-0.5 ${categoryColors[product.category]}`}>
          {categoryLabels[product.category]}
        </Badge>
        {product.size && (
          <Badge className="absolute top-1.5 right-1.5 bg-black/60 text-white text-[9px] px-1.5 py-0.5">
            {product.size}
          </Badge>
        )}
      </div>

      {/* Content */}
      <div className="p-2">
        <h3 className="font-bold text-xs mb-0.5 line-clamp-1">{product.name}</h3>
        <p className="text-[10px] text-muted-foreground line-clamp-1 mb-1.5">
          {product.description}
        </p>
        
        <div className="flex items-center justify-between">
          <p className="text-sm font-bold text-primary">
            R$ {product.price.toFixed(2).replace('.', ',')}
          </p>
          <Button
            onClick={() => onAdd(product)}
            className="rounded-full bg-primary hover:bg-primary/90 h-7 w-7"
            size="icon"
          >
            <Plus className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
