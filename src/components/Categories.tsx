import { categories } from '@/data/pizzaData';

interface CategoriesProps {
  selected: string;
  onSelect: (category: string) => void;
}

export default function Categories({ selected, onSelect }: CategoriesProps) {
  return (
    <div className="px-3 md:px-4 py-4">
      <h2 className="text-base md:text-lg font-semibold mb-3">Categorias</h2>
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-3 px-3 scroll-container">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onSelect(category.id)}
            className={`flex items-center gap-1.5 px-3 md:px-4 py-2 md:py-2.5 rounded-full whitespace-nowrap transition-all duration-200 text-sm md:text-base scroll-item active:scale-95 hover:scale-105 ${
              selected === category.id
                ? 'bg-primary text-primary-foreground shadow-md scale-105'
                : 'bg-muted hover:bg-muted/80 text-foreground'
            }`}
          >
            <span className="text-base md:text-lg">{category.icon}</span>
            <span className="font-medium">{category.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
