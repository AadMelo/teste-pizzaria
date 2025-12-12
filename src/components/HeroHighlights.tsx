import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Award, 
  Clock, 
  Flame, 
  MapPin, 
  Shield, 
  Star, 
  TrendingUp, 
  Users,
  Zap,
  ChefHat,
  Truck,
  Timer
} from 'lucide-react';

const HeroHighlights = () => {
  const [activeHighlight, setActiveHighlight] = useState(0);
  const [ordersToday, setOrdersToday] = useState(127);
  const [peopleViewing, setPeopleViewing] = useState(23);

  // Simulate real-time activity
  useEffect(() => {
    const interval = setInterval(() => {
      setOrdersToday(prev => prev + Math.floor(Math.random() * 2));
      setPeopleViewing(Math.floor(Math.random() * 15) + 18);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  // Rotate highlights
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveHighlight(prev => (prev + 1) % 3);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const highlights = [
    { icon: Flame, text: "Forno a lenha tradicional italiano", color: "text-orange-500" },
    { icon: ChefHat, text: "Chef premiado com 15 anos de experiência", color: "text-amber-500" },
    { icon: Award, text: "Melhor pizzaria da região 2024", color: "text-yellow-500" },
  ];

  return (
    <div className="px-3 md:px-4 py-4 space-y-4">
      {/* Live Activity Bar */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-pizza-red/10 via-pizza-orange/10 to-pizza-yellow/10 
                   rounded-2xl p-3 border border-pizza-orange/20 backdrop-blur-sm"
      >
        <div className="flex items-center justify-between gap-2 flex-wrap">
          {/* Live Orders */}
          <motion.div 
            className="flex items-center gap-2"
            whileHover={{ scale: 1.02 }}
          >
            <div className="relative">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <div className="absolute inset-0 w-2 h-2 bg-green-500 rounded-full animate-ping" />
            </div>
            <span className="text-xs text-muted-foreground">
              <span className="font-bold text-foreground">{ordersToday}</span> pedidos hoje
            </span>
          </motion.div>

          {/* Viewing Now */}
          <motion.div 
            className="flex items-center gap-2"
            whileHover={{ scale: 1.02 }}
          >
            <Users className="w-4 h-4 text-pizza-orange" />
            <span className="text-xs text-muted-foreground">
              <span className="font-bold text-foreground">{peopleViewing}</span> pessoas vendo agora
            </span>
          </motion.div>

          {/* Delivery Time */}
          <motion.div 
            className="flex items-center gap-2"
            whileHover={{ scale: 1.02 }}
          >
            <Timer className="w-4 h-4 text-green-500" />
            <span className="text-xs font-medium text-green-600">
              Entrega em 25-35min
            </span>
          </motion.div>
        </div>
      </motion.div>

      {/* Trust Badges */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          whileHover={{ scale: 1.03, y: -2 }}
          className="bg-card rounded-xl p-3 border border-border/50 shadow-sm 
                     hover:shadow-md hover:border-pizza-orange/30 transition-all"
        >
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 rounded-lg bg-yellow-500/10">
              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
            </div>
            <span className="text-lg font-bold">4.9</span>
          </div>
          <p className="text-[10px] text-muted-foreground">+2.500 avaliações</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          whileHover={{ scale: 1.03, y: -2 }}
          className="bg-card rounded-xl p-3 border border-border/50 shadow-sm 
                     hover:shadow-md hover:border-pizza-orange/30 transition-all"
        >
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 rounded-lg bg-pizza-orange/10">
              <TrendingUp className="w-4 h-4 text-pizza-orange" />
            </div>
            <span className="text-lg font-bold">50K+</span>
          </div>
          <p className="text-[10px] text-muted-foreground">Pizzas entregues</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          whileHover={{ scale: 1.03, y: -2 }}
          className="bg-card rounded-xl p-3 border border-border/50 shadow-sm 
                     hover:shadow-md hover:border-pizza-orange/30 transition-all"
        >
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 rounded-lg bg-green-500/10">
              <Shield className="w-4 h-4 text-green-500" />
            </div>
            <span className="text-lg font-bold">100%</span>
          </div>
          <p className="text-[10px] text-muted-foreground">Satisfação garantida</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          whileHover={{ scale: 1.03, y: -2 }}
          className="bg-card rounded-xl p-3 border border-border/50 shadow-sm 
                     hover:shadow-md hover:border-pizza-orange/30 transition-all"
        >
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 rounded-lg bg-purple-500/10">
              <Award className="w-4 h-4 text-purple-500" />
            </div>
            <span className="text-lg font-bold">12</span>
          </div>
          <p className="text-[10px] text-muted-foreground">Anos de tradição</p>
        </motion.div>
      </div>

      {/* Rotating Highlight */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative overflow-hidden bg-gradient-to-r from-pizza-brown/90 to-pizza-brown 
                   rounded-2xl p-4 text-white"
      >
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
        
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeHighlight}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex items-center gap-3"
              >
                {(() => {
                  const Icon = highlights[activeHighlight].icon;
                  return (
                    <>
                      <div className="p-2 rounded-xl bg-white/10 backdrop-blur-sm">
                        <Icon className={`w-5 h-5 ${highlights[activeHighlight].color}`} />
                      </div>
                      <div>
                        <p className="text-xs text-white/70 uppercase tracking-wider">Nosso diferencial</p>
                        <p className="font-semibold text-sm">{highlights[activeHighlight].text}</p>
                      </div>
                    </>
                  );
                })()}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Progress dots */}
          <div className="flex gap-1.5">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 
                           ${i === activeHighlight ? 'bg-white w-4' : 'bg-white/30'}`}
              />
            ))}
          </div>
        </div>
      </motion.div>

      {/* Quick Info Strip */}
      <div className="flex items-center justify-center gap-6 py-2">
        <motion.div 
          className="flex items-center gap-1.5 text-xs text-muted-foreground"
          whileHover={{ scale: 1.05 }}
        >
          <Truck className="w-3.5 h-3.5 text-pizza-orange" />
          <span>Frete grátis +R$60</span>
        </motion.div>
        <div className="w-px h-4 bg-border" />
        <motion.div 
          className="flex items-center gap-1.5 text-xs text-muted-foreground"
          whileHover={{ scale: 1.05 }}
        >
          <MapPin className="w-3.5 h-3.5 text-pizza-orange" />
          <span>Até 5km</span>
        </motion.div>
        <div className="w-px h-4 bg-border" />
        <motion.div 
          className="flex items-center gap-1.5 text-xs text-muted-foreground"
          whileHover={{ scale: 1.05 }}
        >
          <Clock className="w-3.5 h-3.5 text-pizza-orange" />
          <span>18h às 23h</span>
        </motion.div>
      </div>
    </div>
  );
};

export default HeroHighlights;
