import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, X, MapPin } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { pizzas } from '@/data/pizzaData';

const neighborhoods = [
  'Centro', 'Jardins', 'Vila Nova', 'Santa Cruz', 'Boa Vista',
  'São José', 'Alto da Boa Vista', 'Parque das Flores'
];

const simulatedNames = [
  'João', 'Maria', 'Pedro', 'Ana', 'Carlos', 'Juliana', 'Lucas', 'Fernanda',
  'Rafael', 'Beatriz', 'Gustavo', 'Larissa', 'Thiago', 'Camila', 'Bruno', 'Amanda'
];

const getRandomItem = <T,>(array: T[]): T => {
  return array[Math.floor(Math.random() * array.length)];
};

interface Notification {
  id: number;
  name: string;
  pizzaName: string;
  pizzaImage: string;
  neighborhood: string;
  time: string;
  isReal: boolean;
}

const SocialProofNotification = () => {
  const [notification, setNotification] = useState<Notification | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [notificationQueue, setNotificationQueue] = useState<Notification[]>([]);

  // Generate simulated notification
  const generateSimulatedNotification = useCallback((): Notification => {
    const randomPizza = getRandomItem(pizzas);
    return {
      id: Date.now(),
      name: getRandomItem(simulatedNames),
      pizzaName: randomPizza.name,
      pizzaImage: randomPizza.image,
      neighborhood: getRandomItem(neighborhoods),
      time: `${Math.floor(Math.random() * 5) + 1} min atrás`,
      isReal: false,
    };
  }, []);

  // Parse order items to get pizza info
  const parseOrderItems = useCallback((items: unknown): { name: string; image: string } | null => {
    try {
      const itemsArray = Array.isArray(items) ? items : [];
      if (itemsArray.length === 0) return null;

      // Find the first pizza item
      for (const item of itemsArray) {
        if (item && typeof item === 'object' && 'name' in item) {
          const pizzaName = String(item.name);
          // Try to find matching pizza in our data for the image
          const matchingPizza = pizzas.find(p => 
            p.name.toLowerCase() === pizzaName.toLowerCase() ||
            pizzaName.toLowerCase().includes(p.name.toLowerCase())
          );
          
          return {
            name: pizzaName,
            image: matchingPizza?.image || pizzas[0].image,
          };
        }
      }
      return null;
    } catch {
      return null;
    }
  }, []);

  // Subscribe to real-time orders
  useEffect(() => {
    const channel = supabase
      .channel('orders-social-proof')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'orders',
        },
        async (payload) => {
          console.log('New order received:', payload);
          
          const order = payload.new;
          if (!order) return;

          // Get user profile name
          let userName = getRandomItem(simulatedNames);
          try {
            const { data: profile } = await supabase
              .from('profiles')
              .select('name')
              .eq('user_id', order.user_id)
              .single();
            
            if (profile?.name) {
              // Use first name only for privacy
              userName = profile.name.split(' ')[0];
            }
          } catch {
            // Use random name as fallback
          }

          // Parse order items
          const pizzaInfo = parseOrderItems(order.items);
          if (!pizzaInfo) return;

          const newNotification: Notification = {
            id: Date.now(),
            name: userName,
            pizzaName: pizzaInfo.name,
            pizzaImage: pizzaInfo.image,
            neighborhood: getRandomItem(neighborhoods),
            time: 'Agora',
            isReal: true,
          };

          setNotificationQueue(prev => [...prev, newNotification]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [parseOrderItems]);

  // Show notification from queue or generate simulated one
  useEffect(() => {
    const showNextNotification = () => {
      if (notificationQueue.length > 0) {
        // Show real notification from queue
        const [next, ...rest] = notificationQueue;
        setNotificationQueue(rest);
        setNotification(next);
        setIsVisible(true);
      } else {
        // Show simulated notification
        setNotification(generateSimulatedNotification());
        setIsVisible(true);
      }
    };

    // Initial delay
    const initialDelay = setTimeout(showNextNotification, 6000);

    return () => clearTimeout(initialDelay);
  }, []);

  // Handle notification visibility and scheduling
  useEffect(() => {
    if (!isVisible) return;

    // Hide notification after 6 seconds
    const hideTimeout = setTimeout(() => {
      setIsVisible(false);
    }, 6000);

    // Schedule next notification
    const nextTimeout = setTimeout(() => {
      if (notificationQueue.length > 0) {
        const [next, ...rest] = notificationQueue;
        setNotificationQueue(rest);
        setNotification(next);
        setIsVisible(true);
      } else {
        setNotification(generateSimulatedNotification());
        setIsVisible(true);
      }
    }, Math.random() * 12000 + 18000); // 18-30 seconds

    return () => {
      clearTimeout(hideTimeout);
      clearTimeout(nextTimeout);
    };
  }, [notification, notificationQueue, generateSimulatedNotification]);

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
          className="fixed bottom-16 left-3 z-50 max-w-[280px] md:max-w-[320px] md:bottom-6 md:left-6"
        >
          <div className="bg-card border border-border/50 rounded-lg md:rounded-xl shadow-lg overflow-hidden">
            {/* Progress bar */}
            <motion.div
              initial={{ scaleX: 1 }}
              animate={{ scaleX: 0 }}
              transition={{ duration: 6, ease: 'linear' }}
              className="h-0.5 md:h-1 bg-gradient-to-r from-pizza-orange to-pizza-red origin-left"
            />
            
            <div className="p-2 md:p-3 flex items-start gap-2 md:gap-3">
              {/* Pizza Image */}
              <div className="flex-shrink-0 w-10 h-10 md:w-14 md:h-14 rounded-lg overflow-hidden bg-muted">
                <img 
                  src={notification.pizzaImage} 
                  alt={notification.pizzaName}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = pizzas[0].image;
                  }}
                />
              </div>
              
              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1 mb-0.5">
                  <ShoppingBag className="w-3 h-3 md:w-3.5 md:h-3.5 text-pizza-orange" />
                  <span className="text-[10px] md:text-xs text-muted-foreground">Novo pedido</span>
                  {notification.isReal && (
                    <span className="relative flex h-1.5 w-1.5 md:h-2 md:w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 md:h-2 md:w-2 bg-green-500"></span>
                    </span>
                  )}
                </div>
                <p className="text-xs md:text-sm font-medium text-foreground">
                  <span className="text-pizza-orange font-semibold">{notification.name}</span> pediu
                </p>
                <p className="text-xs md:text-sm text-foreground font-semibold truncate">
                  Pizza {notification.pizzaName}
                </p>
                <div className="flex items-center gap-1 mt-0.5 md:mt-1">
                  <MapPin className="w-2.5 h-2.5 md:w-3 md:h-3 text-muted-foreground" />
                  <span className="text-[9px] md:text-[11px] text-muted-foreground">
                    {notification.neighborhood} • {notification.time}
                  </span>
                </div>
              </div>
              
              {/* Close button */}
              <button
                onClick={handleClose}
                className="flex-shrink-0 p-0.5 md:p-1 rounded-full hover:bg-muted/50 transition-colors"
              >
                <X className="w-3.5 h-3.5 md:w-4 md:h-4 text-muted-foreground" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SocialProofNotification;
