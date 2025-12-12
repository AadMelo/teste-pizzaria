import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

const orderSteps = [
  { id: 'pending', label: 'Pendente', emoji: '⏳' },
  { id: 'confirmed', label: 'Confirmado', emoji: '✅' },
  { id: 'preparing', label: 'Preparando', emoji: '👨‍🍳' },
  { id: 'delivering', label: 'Em entrega', emoji: '🛵' },
  { id: 'delivered', label: 'Entregue', emoji: '🎉' },
];

interface OrderProgressBarProps {
  currentStatus: string;
  className?: string;
}

export function OrderProgressBar({ currentStatus, className }: OrderProgressBarProps) {
  // Handle cancelled status
  if (currentStatus === 'cancelled') {
    return (
      <div className={cn("flex items-center justify-center py-4", className)}>
        <div className="flex items-center gap-2 text-destructive">
          <span className="text-2xl">❌</span>
          <span className="font-medium">Pedido Cancelado</span>
        </div>
      </div>
    );
  }

  const currentIndex = orderSteps.findIndex(step => step.id === currentStatus);
  const progressPercentage = currentIndex >= 0 ? (currentIndex / (orderSteps.length - 1)) * 100 : 0;

  return (
    <div className={cn("w-full py-4", className)}>
      {/* Progress bar container */}
      <div className="relative">
        {/* Background line */}
        <div className="absolute top-4 left-0 right-0 h-1 bg-muted rounded-full" />
        
        {/* Progress line */}
        <div 
          className="absolute top-4 left-0 h-1 bg-primary rounded-full transition-all duration-500"
          style={{ width: `${progressPercentage}%` }}
        />
        
        {/* Steps */}
        <div className="relative flex justify-between">
          {orderSteps.map((step, index) => {
            const isCompleted = index < currentIndex;
            const isCurrent = index === currentIndex;
            const isPending = index > currentIndex;
            
            return (
              <div key={step.id} className="flex flex-col items-center">
                {/* Circle */}
                <div 
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 border-2",
                    isCompleted && "bg-primary border-primary text-primary-foreground",
                    isCurrent && "bg-primary border-primary text-primary-foreground ring-4 ring-primary/20 animate-pulse",
                    isPending && "bg-background border-muted text-muted-foreground"
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <span className="text-xs">{step.emoji}</span>
                  )}
                </div>
                
                {/* Label */}
                <span 
                  className={cn(
                    "mt-2 text-xs font-medium text-center max-w-[60px] leading-tight",
                    isCurrent && "text-primary",
                    isCompleted && "text-foreground",
                    isPending && "text-muted-foreground"
                  )}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
