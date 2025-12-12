import { Plus, Star } from 'lucide-react';
import { Pizza } from '@/data/pizzaData';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

interface PizzaCardProps {
  pizza: Pizza;
  onSelect: (pizza: Pizza) => void;
}

export default function PizzaCard({ pizza, onSelect }: PizzaCardProps) {
  const categoryConfig = {
    tradicional: { 
      label: 'Tradicional', 
      bg: 'bg-emerald-500/15', 
      text: 'text-emerald-600 dark:text-emerald-400',
      border: 'border-emerald-500/30'
    },
    especial: { 
      label: 'Especial', 
      bg: 'bg-blue-500/15', 
      text: 'text-blue-600 dark:text-blue-400',
      border: 'border-blue-500/30'
    },
    premium: { 
      label: 'Premium', 
      bg: 'bg-amber-500/15', 
      text: 'text-amber-600 dark:text-amber-400',
      border: 'border-amber-500/30'
    },
    doce: { 
      label: 'Doce', 
      bg: 'bg-pink-500/15', 
      text: 'text-pink-600 dark:text-pink-400',
      border: 'border-pink-500/30'
    },
  };

  const category = categoryConfig[pizza.category];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -6 }}
      transition={{ duration: 0.3 }}
      className="group relative bg-card rounded-2xl overflow-hidden border border-border/50 shadow-sm hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500"
    >
      {/* Image Container */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={pizza.image}
          alt={pizza.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          loading="lazy"
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        {/* Category Badge */}
        <div className={`absolute top-3 left-3 px-3 py-1.5 rounded-full backdrop-blur-md ${category.bg} ${category.border} border`}>
          <span className={`text-xs font-semibold tracking-wide ${category.text}`}>
            {category.label}
          </span>
        </div>

        {/* Quick Add Button - Mobile */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          whileHover={{ scale: 1.1 }}
          className="absolute bottom-3 right-3 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300"
        >
          <Button
            onClick={() => onSelect(pizza)}
            size="icon"
            className="h-11 w-11 rounded-full bg-primary hover:bg-primary/90 shadow-lg shadow-primary/30 transition-all duration-300"
          >
            <Plus className="h-5 w-5" />
          </Button>
        </motion.div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Title & Rating */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-bold text-base leading-tight line-clamp-1 group-hover:text-primary transition-colors duration-300">
            {pizza.name}
          </h3>
          <div className="flex items-center gap-1 text-amber-500 shrink-0">
            <Star className="h-3.5 w-3.5 fill-current" />
            <span className="text-xs font-medium text-muted-foreground">4.8</span>
          </div>
        </div>
        
        {/* Ingredients */}
        <p className="text-xs text-muted-foreground line-clamp-2 mb-4 leading-relaxed">
          {pizza.ingredients.slice(0, 4).join(' • ')}
        </p>
        
        {/* Price & Action */}
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground/70 font-medium">A partir de</p>
            <p className="text-xl font-bold text-primary">
              R$ {pizza.basePrice.toFixed(2).replace('.', ',')}
            </p>
          </div>
          
          {/* Desktop Add Button */}
          <Button
            onClick={() => onSelect(pizza)}
            className="hidden md:flex items-center gap-2 rounded-full bg-primary/10 hover:bg-primary text-primary hover:text-primary-foreground px-4 py-2 h-auto text-sm font-medium transition-all duration-300 group/btn"
          >
            <Plus className="h-4 w-4 transition-transform group-hover/btn:rotate-90 duration-300" />
            <span>Adicionar</span>
          </Button>
        </div>
      </div>

      {/* Subtle shine effect on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
      </div>
    </motion.div>
  );
}
