import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, X, MapPin } from 'lucide-react';

const names = [
  'João', 'Maria', 'Pedro', 'Ana', 'Carlos', 'Juliana', 'Lucas', 'Fernanda',
  'Rafael', 'Beatriz', 'Gustavo', 'Larissa', 'Thiago', 'Camila', 'Bruno', 'Amanda'
];

const pizzas = [
  'Margherita', 'Calabresa', 'Portuguesa', 'Frango com Catupiry', 
  '4 Queijos', 'Pepperoni', 'Napolitana', 'Bacon', 'Brasileira',
  'Mussarela', 'Atum', 'Palmito', 'Brócolis'
];

const neighborhoods = [
  'Centro', 'Jardins', 'Vila Nova', 'Santa Cruz', 'Boa Vista',
  'São José', 'Alto da Boa Vista', 'Parque das Flores'
];

const getRandomItem = <T,>(array: T[]): T => {
  return array[Math.floor(Math.random() * array.length)];
};

const getRandomTime = (): string => {
  const minutes = Math.floor(Math.random() * 5) + 1;
  return `${minutes} min atrás`;
};

interface Notification {
  id: number;
  name: string;
  pizza: string;
  neighborhood: string;
  time: string;
}

const SocialProofNotification = () => {
  const [notification, setNotification] = useState<Notification | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  const generateNotification = (): Notification => ({
    id: Date.now(),
    name: getRandomItem(names),
    pizza: getRandomItem(pizzas),
    neighborhood: getRandomItem(neighborhoods),
    time: getRandomTime(),
  });

  useEffect(() => {
    // Initial delay before first notification
    const initialDelay = setTimeout(() => {
      setNotification(generateNotification());
      setIsVisible(true);
    }, 8000);

    return () => clearTimeout(initialDelay);
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    // Hide notification after 5 seconds
    const hideTimeout = setTimeout(() => {
      setIsVisible(false);
    }, 5000);

    // Show new notification after 15-25 seconds
    const nextTimeout = setTimeout(() => {
      setNotification(generateNotification());
      setIsVisible(true);
    }, Math.random() * 10000 + 15000);

    return () => {
      clearTimeout(hideTimeout);
      clearTimeout(nextTimeout);
    };
  }, [notification]);

  const handleClose = () => {
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && notification && (
        <motion.div
          key={notification.id}
          initial={{ opacity: 0, x: -100, y: 20 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          exit={{ opacity: 0, x: -100 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="fixed bottom-20 left-4 z-50 max-w-[300px] md:bottom-6 md:left-6"
        >
          <div className="bg-card border border-border/50 rounded-xl shadow-lg overflow-hidden">
            {/* Progress bar */}
            <motion.div
              initial={{ scaleX: 1 }}
              animate={{ scaleX: 0 }}
              transition={{ duration: 5, ease: 'linear' }}
              className="h-1 bg-gradient-to-r from-pizza-orange to-pizza-red origin-left"
            />
            
            <div className="p-3 flex items-start gap-3">
              {/* Icon */}
              <div className="flex-shrink-0 p-2 rounded-full bg-pizza-orange/10">
                <ShoppingBag className="w-5 h-5 text-pizza-orange" />
              </div>
              
              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">
                  <span className="text-pizza-orange">{notification.name}</span> acabou de pedir
                </p>
                <p className="text-sm text-foreground font-semibold truncate">
                  Pizza {notification.pizza}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <MapPin className="w-3 h-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    {notification.neighborhood} • {notification.time}
                  </span>
                </div>
              </div>
              
              {/* Close button */}
              <button
                onClick={handleClose}
                className="flex-shrink-0 p-1 rounded-full hover:bg-muted/50 transition-colors"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SocialProofNotification;
