import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

const statusMessages: Record<string, { title: string; description: string; icon: string }> = {
  confirmed: {
    title: 'Pedido Confirmado!',
    description: 'Seu pedido foi confirmado e está sendo preparado.',
    icon: '✅',
  },
  preparing: {
    title: 'Preparando seu Pedido',
    description: 'Nossa cozinha já está preparando sua pizza!',
    icon: '👨‍🍳',
  },
  delivering: {
    title: 'Pedido Saiu para Entrega!',
    description: 'Seu pedido está a caminho. Fique atento!',
    icon: '🛵',
  },
  delivered: {
    title: 'Pedido Entregue!',
    description: 'Bom apetite! Esperamos que goste!',
    icon: '🍕',
  },
  cancelled: {
    title: 'Pedido Cancelado',
    description: 'Seu pedido foi cancelado. Entre em contato se precisar de ajuda.',
    icon: '❌',
  },
};

export function useOrderNotifications() {
  const { user } = useAuth();
  const previousStatusRef = useRef<Record<string, string>>({});

  useEffect(() => {
    if (!user) return;

    // Fetch initial order statuses
    const fetchInitialStatuses = async () => {
      const { data } = await supabase
        .from('orders')
        .select('id, status')
        .eq('user_id', user.id);

      if (data) {
        const statuses: Record<string, string> = {};
        data.forEach((order) => {
          statuses[order.id] = order.status;
        });
        previousStatusRef.current = statuses;
      }
    };

    fetchInitialStatuses();

    // Subscribe to order changes
    const channel = supabase
      .channel('order-status-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const newOrder = payload.new as { id: string; status: string };
          const previousStatus = previousStatusRef.current[newOrder.id];

          // Only notify if status actually changed
          if (previousStatus && previousStatus !== newOrder.status) {
            const message = statusMessages[newOrder.status];
            if (message) {
              toast(message.title, {
                description: message.description,
                icon: message.icon,
                duration: 5000,
              });
            }
          }

          // Update the reference
          previousStatusRef.current[newOrder.id] = newOrder.status;
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);
}
