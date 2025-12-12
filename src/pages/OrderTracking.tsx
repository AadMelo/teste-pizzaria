import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import Header from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Check, Clock, ChefHat, Bike, Home, X, Timer, Bell } from 'lucide-react';
import { format, differenceInMinutes, addMinutes } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  size?: string;
}

interface Order {
  id: string;
  status: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  delivery_fee: number;
  total: number;
  address: string;
  payment_method: string;
  created_at: string;
}

const statusSteps = [
  { key: 'pending', label: 'Pedido Recebido', icon: Clock, description: 'Aguardando confirmação', estimatedMinutes: 5 },
  { key: 'confirmed', label: 'Confirmado', icon: Check, description: 'Pedido confirmado pela pizzaria', estimatedMinutes: 10 },
  { key: 'preparing', label: 'Preparando', icon: ChefHat, description: 'Sua pizza está sendo preparada', estimatedMinutes: 25 },
  { key: 'delivering', label: 'Em Entrega', icon: Bike, description: 'Pedido saiu para entrega', estimatedMinutes: 15 },
  { key: 'delivered', label: 'Entregue', icon: Home, description: 'Pedido entregue com sucesso', estimatedMinutes: 0 },
];

const getStatusIndex = (status: string) => {
  if (status === 'cancelled') return -1;
  return statusSteps.findIndex((step) => step.key === status);
};

const calculateEstimatedDelivery = (createdAt: string, currentStatus: string) => {
  const orderTime = new Date(createdAt);
  const currentIndex = getStatusIndex(currentStatus);
  
  if (currentIndex === -1 || currentStatus === 'delivered') return null;
  
  // Calculate total remaining time based on remaining steps
  const remainingMinutes = statusSteps
    .slice(currentIndex)
    .reduce((acc, step) => acc + step.estimatedMinutes, 0);
  
  return addMinutes(new Date(), remainingMinutes);
};

const getTimeRemaining = (estimatedTime: Date | null) => {
  if (!estimatedTime) return null;
  
  const now = new Date();
  const minutes = differenceInMinutes(estimatedTime, now);
  
  if (minutes <= 0) return 'Chegando a qualquer momento';
  if (minutes < 60) return `~${minutes} minutos`;
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `~${hours}h ${remainingMinutes}min`;
};

// Notification sounds for different statuses
const playNotificationSound = (type: 'confirmed' | 'preparing' | 'delivering' | 'delivered') => {
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  
  const playNote = (frequency: number, startTime: number, duration: number, waveType: OscillatorType = 'sine') => {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = frequency;
    oscillator.type = waveType;
    
    gainNode.gain.setValueAtTime(0, startTime);
    gainNode.gain.linearRampToValueAtTime(0.25, startTime + 0.05);
    gainNode.gain.linearRampToValueAtTime(0, startTime + duration);
    
    oscillator.start(startTime);
    oscillator.stop(startTime + duration);
  };

  const now = audioContext.currentTime;
  
  switch (type) {
    case 'confirmed':
      // Simple confirmation ding
      playNote(880, now, 0.2); // A5
      playNote(1108.73, now + 0.15, 0.25); // C#6
      break;
    case 'preparing':
      // Cooking/busy melody
      playNote(392, now, 0.12); // G4
      playNote(440, now + 0.12, 0.12); // A4
      playNote(493.88, now + 0.24, 0.12); // B4
      playNote(523.25, now + 0.36, 0.2); // C5
      break;
    case 'delivering':
      // Cheerful ascending melody
      playNote(523.25, now, 0.15); // C5
      playNote(659.25, now + 0.15, 0.15); // E5
      playNote(783.99, now + 0.3, 0.3); // G5
      break;
    case 'delivered':
      // Celebratory fanfare
      playNote(523.25, now, 0.1); // C5
      playNote(659.25, now + 0.1, 0.1); // E5
      playNote(783.99, now + 0.2, 0.1); // G5
      playNote(1046.5, now + 0.3, 0.4); // C6
      break;
  }
};

// Status notification config
const statusNotifications: Record<string, { emoji: string; title: string; description: string; color: string }> = {
  confirmed: {
    emoji: '✅',
    title: 'Pedido Confirmado!',
    description: 'A pizzaria confirmou seu pedido.',
    color: 'blue',
  },
  preparing: {
    emoji: '👨‍🍳',
    title: 'Preparando seu Pedido!',
    description: 'Sua pizza está sendo preparada com carinho.',
    color: 'orange',
  },
  delivering: {
    emoji: '🛵',
    title: 'Pedido Saiu para Entrega!',
    description: 'Seu pedido está a caminho. Fique atento!',
    color: 'green',
  },
  delivered: {
    emoji: '🎉',
    title: 'Pedido Entregue!',
    description: 'Bom apetite! Esperamos que goste.',
    color: 'purple',
  },
};

export default function OrderTracking() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeAlert, setActiveAlert] = useState<string | null>(null);
  const previousStatusRef = useRef<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!user || !orderId) return;

    const fetchOrder = async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .eq('user_id', user.id)
        .single();

      if (!error && data) {
        setOrder({
          ...data,
          items: data.items as unknown as OrderItem[],
        });
      }
      if (data) {
        previousStatusRef.current = data.status;
      }
      setLoading(false);
    };

    fetchOrder();

    // Subscribe to realtime updates
    const channel = supabase
      .channel(`order-${orderId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `id=eq.${orderId}`,
        },
        (payload) => {
          const updatedOrder = payload.new as Order;
          const newStatus = updatedOrder.status;
          const prevStatus = previousStatusRef.current;
          
          // Check if status changed to a notifiable status
          const notifiableStatuses = ['confirmed', 'preparing', 'delivering', 'delivered'];
          if (prevStatus && prevStatus !== newStatus && notifiableStatuses.includes(newStatus)) {
            // Play notification sound
            playNotificationSound(newStatus as 'confirmed' | 'preparing' | 'delivering' | 'delivered');
            
            // Show visual alert
            setActiveAlert(newStatus);
            
            // Show toast notification
            const notif = statusNotifications[newStatus];
            if (notif) {
              toast({
                title: `${notif.emoji} ${notif.title}`,
                description: notif.description,
                duration: 8000,
              });
            }
            
            // Hide alert after 8 seconds
            setTimeout(() => setActiveAlert(null), 8000);
          }
          
          previousStatusRef.current = newStatus;
          
          setOrder({
            ...updatedOrder,
            items: updatedOrder.items as unknown as OrderItem[],
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, orderId]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <Skeleton className="h-8 w-48 mb-6" />
          <Skeleton className="h-64 w-full" />
        </main>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <Card className="max-w-2xl mx-auto text-center py-12">
            <CardContent>
              <p className="text-muted-foreground mb-4">Pedido não encontrado</p>
              <Button onClick={() => navigate('/pedidos')}>Ver Meus Pedidos</Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  const currentStatusIndex = getStatusIndex(order.status);
  const isCancelled = order.status === 'cancelled';
  const estimatedDelivery = calculateEstimatedDelivery(order.created_at, order.status);
  const timeRemaining = getTimeRemaining(estimatedDelivery);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate('/pedidos')}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar para Pedidos
        </Button>

        <div className="max-w-3xl mx-auto space-y-6">
          {/* Status Alert Banner */}
          {activeAlert && statusNotifications[activeAlert] && (() => {
            const notif = statusNotifications[activeAlert];
            const colorClasses: Record<string, { border: string; bg: string; iconBg: string; text: string; textLight: string }> = {
              blue: {
                border: 'border-blue-500',
                bg: 'bg-blue-500/10',
                iconBg: 'bg-blue-500',
                text: 'text-blue-700 dark:text-blue-400',
                textLight: 'text-blue-600 dark:text-blue-300',
              },
              orange: {
                border: 'border-orange-500',
                bg: 'bg-orange-500/10',
                iconBg: 'bg-orange-500',
                text: 'text-orange-700 dark:text-orange-400',
                textLight: 'text-orange-600 dark:text-orange-300',
              },
              green: {
                border: 'border-green-500',
                bg: 'bg-green-500/10',
                iconBg: 'bg-green-500',
                text: 'text-green-700 dark:text-green-400',
                textLight: 'text-green-600 dark:text-green-300',
              },
              purple: {
                border: 'border-purple-500',
                bg: 'bg-purple-500/10',
                iconBg: 'bg-purple-500',
                text: 'text-purple-700 dark:text-purple-400',
                textLight: 'text-purple-600 dark:text-purple-300',
              },
            };
            const colors = colorClasses[notif.color] || colorClasses.green;
            const StatusIcon = statusSteps.find(s => s.key === activeAlert)?.icon || Bell;

            return (
              <div className="animate-in slide-in-from-top-4 fade-in duration-500">
                <Card className={cn('border-2 overflow-hidden relative', colors.border, colors.bg)}>
                  <div className={cn('absolute inset-0 bg-gradient-to-r via-transparent animate-pulse', `from-${notif.color}-500/20 to-${notif.color}-500/20`)} />
                  <CardContent className="py-6 relative">
                    <div className="flex items-center gap-4">
                      <div className={cn('w-16 h-16 rounded-full flex items-center justify-center animate-bounce', colors.iconBg)}>
                        <StatusIcon className="w-8 h-8 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Bell className={cn('w-5 h-5 animate-pulse', colors.textLight)} />
                          <h3 className={cn('text-xl font-bold', colors.text)}>
                            {notif.title}
                          </h3>
                        </div>
                        <p className={cn('mt-1', colors.textLight)}>
                          {notif.description}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setActiveAlert(null)}
                        className={cn(colors.textLight, `hover:${colors.bg}`)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            );
          })()}

          {/* Order Header */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl">
                    Pedido #{order.id.slice(0, 8).toUpperCase()}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    {format(new Date(order.created_at), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-primary">
                    R$ {order.total.toFixed(2)}
                  </p>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Estimated Delivery */}
          {!isCancelled && order.status !== 'delivered' && timeRemaining && (
            <Card className="border-primary/50 bg-primary/5">
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Timer className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Tempo estimado de entrega</p>
                      <p className="text-xl font-bold text-primary">{timeRemaining}</p>
                    </div>
                  </div>
                  {estimatedDelivery && (
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Previsão</p>
                      <p className="font-medium">
                        {format(estimatedDelivery, 'HH:mm', { locale: ptBR })}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Status do Pedido</CardTitle>
            </CardHeader>
            <CardContent>
              {isCancelled ? (
                <div className="flex items-center gap-4 p-4 bg-destructive/10 rounded-lg">
                  <div className="w-12 h-12 rounded-full bg-destructive flex items-center justify-center">
                    <X className="w-6 h-6 text-destructive-foreground" />
                  </div>
                  <div>
                    <p className="font-semibold text-destructive">Pedido Cancelado</p>
                    <p className="text-sm text-muted-foreground">
                      Este pedido foi cancelado. Entre em contato se precisar de ajuda.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="relative">
                  {statusSteps.map((step, index) => {
                    const StepIcon = step.icon;
                    const isCompleted = index <= currentStatusIndex;
                    const isCurrent = index === currentStatusIndex;

                    return (
                      <div key={step.key} className="flex gap-4 pb-8 last:pb-0">
                        {/* Timeline line */}
                        <div className="flex flex-col items-center">
                          <div
                            className={cn(
                              'w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500',
                              isCompleted
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted text-muted-foreground',
                              isCurrent && 'ring-4 ring-primary/30 animate-pulse'
                            )}
                          >
                            <StepIcon className="w-5 h-5" />
                          </div>
                          {index < statusSteps.length - 1 && (
                            <div
                              className={cn(
                                'w-0.5 flex-1 min-h-8 transition-all duration-500',
                                index < currentStatusIndex
                                  ? 'bg-primary'
                                  : 'bg-muted'
                              )}
                            />
                          )}
                        </div>

                        {/* Step content */}
                        <div className="pt-1.5">
                          <p
                            className={cn(
                              'font-medium transition-colors',
                              isCompleted ? 'text-foreground' : 'text-muted-foreground'
                            )}
                          >
                            {step.label}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {step.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Itens do Pedido</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {order.items.map((item, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      {item.size && (
                        <p className="text-sm text-muted-foreground">{item.size}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">
                        {item.quantity}x R$ {item.price.toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t mt-4 pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>R$ {order.subtotal.toFixed(2)}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Desconto</span>
                    <span>-R$ {order.discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span>Taxa de entrega</span>
                  <span>R$ {order.delivery_fee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-2 border-t">
                  <span>Total</span>
                  <span>R$ {order.total.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Delivery Address */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Endereço de Entrega</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{order.address}</p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
