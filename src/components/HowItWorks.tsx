import { Smartphone, Pizza, CreditCard, Truck } from 'lucide-react';

const steps = [
  { icon: Smartphone, title: 'Escolha' },
  { icon: Pizza, title: 'Personalize' },
  { icon: CreditCard, title: 'Pague' },
  { icon: Truck, title: 'Receba' },
];

export default function HowItWorks() {
  return (
    <div className="mx-3 md:mx-4 mb-4">
      <h2 className="text-base md:text-lg font-bold mb-3 text-center">🍕 Como Funciona</h2>
      
      <div className="flex justify-between gap-2">
        {steps.map((step, index) => (
          <div key={step.title} className="flex-1 relative">
            <div className="bg-card rounded-lg p-3 text-center shadow-sm border border-border/50">
              <div className="w-10 h-10 md:w-12 md:h-12 mx-auto mb-1.5 rounded-full pizza-gradient flex items-center justify-center">
                <step.icon className="h-5 w-5 md:h-6 md:w-6 text-white" />
              </div>
              <div className="absolute -top-1.5 -left-1.5 w-5 h-5 md:w-6 md:h-6 rounded-full bg-primary text-primary-foreground text-xs md:text-sm font-bold flex items-center justify-center">
                {index + 1}
              </div>
              <h3 className="font-bold text-xs md:text-sm">{step.title}</h3>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
