import { Gift, Percent, Clock, Star } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import LoyaltyProgram from './LoyaltyProgram';

const offers = [
  { icon: Percent, title: 'PROMO10', description: '10% OFF', color: 'from-green-500 to-emerald-600' },
  { icon: Gift, title: 'Combo', description: '2 Pizzas R$89', color: 'from-blue-500 to-indigo-600' },
  { icon: Clock, title: 'Happy Hour', description: '20% OFF', color: 'from-purple-500 to-pink-600' },
  { icon: Star, title: 'Fidelidade', description: 'Ganhe pts', color: 'from-amber-500 to-orange-600', isLoyalty: true },
];

export default function SpecialOffers() {
  return (
    <div className="mx-3 md:mx-4 mb-4">
      <h2 className="text-base md:text-lg font-bold mb-3">🎁 Ofertas</h2>
      
      <div className="flex gap-2.5 overflow-x-auto pb-2 -mx-3 px-3 scroll-container">
        {offers.map((offer) => (
          offer.isLoyalty ? (
            <Dialog key={offer.title}>
              <DialogTrigger asChild>
                <div className={`bg-gradient-to-br ${offer.color} rounded-lg p-3 md:p-4 text-white shadow-md active:scale-95 transition-transform cursor-pointer min-w-[100px] md:min-w-[120px] flex-shrink-0`}>
                  <offer.icon className="h-6 w-6 md:h-7 md:w-7 mb-1.5 opacity-90" />
                  <h3 className="font-bold text-sm md:text-base">{offer.title}</h3>
                  <p className="text-xs md:text-sm text-white/80">{offer.description}</p>
                </div>
              </DialogTrigger>
              <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-center pizza-gradient-text">🎁 Programa Fidelidade</DialogTitle>
                </DialogHeader>
                <LoyaltyProgram />
              </DialogContent>
            </Dialog>
          ) : (
            <div
              key={offer.title}
              className={`bg-gradient-to-br ${offer.color} rounded-lg p-3 md:p-4 text-white shadow-md active:scale-95 transition-transform cursor-pointer min-w-[100px] md:min-w-[120px] flex-shrink-0`}
            >
              <offer.icon className="h-6 w-6 md:h-7 md:w-7 mb-1.5 opacity-90" />
              <h3 className="font-bold text-sm md:text-base">{offer.title}</h3>
              <p className="text-xs md:text-sm text-white/80">{offer.description}</p>
            </div>
          )
        ))}
      </div>
    </div>
  );
}
