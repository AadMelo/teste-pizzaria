import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, Clock, MapPin, CreditCard, Star, Eye, RefreshCw, Wifi, WifiOff, Receipt, Pizza, ShoppingBag, ChefHat, Truck, CheckCircle2, XCircle, Timer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { OrderProgressBar } from '@/components/OrderProgressBar';
import { OrderReceipt } from '@/components/OrderReceipt';
import { useAuth } from '@/hooks/useAuth';
import { useCart, CartPizza, CartProduct } from '@/contexts/CartContext';
import { supabase } from '@/integrations/supabase/client';
import { Json } from '@/integrations/supabase/types';
import { format, formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import { ptBR } from 'date-fns/locale';

interface OrderItem {
  type: string;
  name?: string;
  size?: string;
  flavors?: string[];
  flavorImages?: string[];
  image?: string;
  category?: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  created_at: string;
  status: string;
  total: number;
  subtotal: number;
  discount: number;
  delivery_fee: number;
  address: string;
  payment_method: string;
  points_earned: number;
  items: Json;
}

const statusConfig: Record<string, { 
  label: string; 
  description: string;
  variant: 'default' | 'secondary' | 'destructive' | 'outline';
  emoji: string;
  color: string;
  bgColor: string;
  borderColor: string;
  iconBg: string;
  icon: React.ElementType;
}> = {
  pending: { 
    label: 'Aguardando', 
    description: 'Seu pedido está aguardando confirmação',
    variant: 'secondary', 
    emoji: '⏳', 
    color: 'text-amber-900',
    bgColor: 'bg-amber-400',
    borderColor: 'border-amber-500',
    iconBg: 'bg-amber-200',
    icon: Timer
  },
  confirmed: { 
    label: 'Confirmado', 
    description: 'Pedido confirmado! Já vamos preparar',
    variant: 'default', 
    emoji: '✅', 
    color: 'text-emerald-900',
    bgColor: 'bg-emerald-400',
    borderColor: 'border-emerald-500',
    iconBg: 'bg-emerald-200',
    icon: CheckCircle2
  },
  preparing: { 
    label: 'Preparando sua Pizza', 
    description: 'Nossa equipe está preparando com carinho 🍕',
    variant: 'default', 
    emoji: '👨‍🍳', 
    color: 'text-orange-900',
    bgColor: 'bg-orange-500',
    borderColor: 'border-orange-600',
    iconBg: 'bg-orange-200',
    icon: ChefHat
  },
  delivering: { 
    label: 'Saiu para Entrega!', 
    description: 'Seu pedido está a caminho! 🛵💨',
    variant: 'default', 
    emoji: '🛵', 
    color: 'text-red-900',
    bgColor: 'bg-red-500',
    borderColor: 'border-red-600',
    iconBg: 'bg-red-200',
    icon: Truck
  },
  delivered: { 
    label: 'Entregue', 
    description: 'Pedido entregue com sucesso!',
    variant: 'outline', 
    emoji: '🎉', 
    color: 'text-green-800',
    bgColor: 'bg-green-100',
    borderColor: 'border-green-300',
    iconBg: 'bg-green-200',
    icon: CheckCircle2
  },
  cancelled: { 
    label: 'Cancelado', 
    description: 'Este pedido foi cancelado',
    variant: 'destructive', 
    emoji: '❌', 
    color: 'text-red-800',
    bgColor: 'bg-red-100',
    borderColor: 'border-red-300',
    iconBg: 'bg-red-200',
    icon: XCircle
  },
};

const paymentLabels: Record<string, { label: string; icon: string }> = {
  pix: { label: 'PIX', icon: '💳' },
  card: { label: 'Cartão', icon: '💳' },
  cash: { label: 'Dinheiro', icon: '💵' },
};

export default function OrderHistory() {
  const { user, loading: authLoading } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRealtimeConnected, setIsRealtimeConnected] = useState(false);
  const [receiptOrder, setReceiptOrder] = useState<Order | null>(null);

  const handleRepeatOrder = (order: Order) => {
    const items = Array.isArray(order.items) ? (order.items as unknown as OrderItem[]) : [];
    
    items.forEach((item) => {
      if (item.type === 'pizza') {
        const cartItem: CartPizza = {
          id: `pizza-${Date.now()}-${Math.random()}`,
          type: 'pizza',
          size: { id: item.size || 'grande', name: item.size || 'Grande', slices: 8, serves: '3-4 pessoas', priceMultiplier: 1 },
          flavors: (item.flavors || []).map(name => ({ id: name, name, description: '', ingredients: [], category: 'tradicional' as const, basePrice: 0, image: '' })),
          crust: { id: 'sem', name: 'Sem borda recheada', price: 0 },
          dough: { id: 'tradicional', name: 'Tradicional', price: 0 },
          extras: [],
          quantity: item.quantity,
          totalPrice: item.price,
        };
        addToCart(cartItem);
      } else {
        const cartItem: CartProduct = {
          id: `product-${Date.now()}-${Math.random()}`,
          type: 'product',
          product: { id: item.name || '', name: item.name || '', description: '', category: 'bebida', price: item.price, image: '' },
          quantity: item.quantity,
          totalPrice: item.price,
        };
        addToCart(cartItem);
      }
    });
    
    toast.success('Itens adicionados ao carrinho!', {
      description: 'Confira seu carrinho para finalizar o pedido.',
    });
    navigate('/');
  };

  const fetchOrders = useCallback(async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setOrders(data);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
      return;
    }

    if (user) {
      fetchOrders();
    }
  }, [user, authLoading, navigate, fetchOrders]);

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('order-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          // Debug logging only in development
          if (import.meta.env.DEV) {
            console.log('Order update received:', payload);
          }
          
          if (payload.eventType === 'INSERT') {
            const newOrder = payload.new as Order;
            setOrders((prev) => [newOrder, ...prev]);
            toast.success('Novo pedido criado!', {
              description: `Pedido #${newOrder.id.slice(0, 8).toUpperCase()}`,
            });
          } else if (payload.eventType === 'UPDATE') {
            const updatedOrder = payload.new as Order;
            const oldOrder = payload.old as Order;
            
            setOrders((prev) =>
              prev.map((order) =>
                order.id === updatedOrder.id ? updatedOrder : order
              )
            );
            
            if (oldOrder.status !== updatedOrder.status) {
              const statusInfo = statusConfig[updatedOrder.status] || statusConfig.pending;
              toast.success(`${statusInfo.emoji} Status atualizado!`, {
                description: `Pedido #${updatedOrder.id.slice(0, 8).toUpperCase()}: ${statusInfo.label}`,
              });
            }
          } else if (payload.eventType === 'DELETE') {
            const deletedOrder = payload.old as Order;
            setOrders((prev) => prev.filter((order) => order.id !== deletedOrder.id));
          }
        }
      )
      .subscribe((status) => {
        setIsRealtimeConnected(status === 'SUBSCRIBED');
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-6">
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="h-8 w-48" />
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-64 w-full rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const activeOrders = orders.filter(o => !['delivered', 'cancelled'].includes(o.status));
  const pastOrders = orders.filter(o => ['delivered', 'cancelled'].includes(o.status));

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background">
      <div className="container mx-auto px-4 py-6 max-w-3xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => navigate('/')}
              className="rounded-full"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <ShoppingBag className="h-6 w-6 text-primary" />
                Meus Pedidos
              </h1>
              <p className="text-sm text-muted-foreground">
                {orders.length} pedido{orders.length !== 1 ? 's' : ''} realizados
              </p>
            </div>
          </div>
          <div className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-medium ${
            isRealtimeConnected 
              ? 'bg-green-100 text-green-700 border border-green-200' 
              : 'bg-muted text-muted-foreground border'
          }`}>
            {isRealtimeConnected ? (
              <>
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <Wifi className="h-3 w-3" />
                <span>Ao vivo</span>
              </>
            ) : (
              <>
                <WifiOff className="h-3 w-3" />
                <span>Conectando...</span>
              </>
            )}
          </div>
        </div>

        {orders.length === 0 ? (
          <Card className="text-center py-16 border-dashed border-2">
            <CardContent>
              <div className="w-20 h-20 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-6">
                <Pizza className="h-10 w-10 text-primary" />
              </div>
              <h2 className="text-xl font-bold mb-2">Nenhum pedido ainda</h2>
              <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                Você ainda não fez nenhum pedido. Que tal experimentar nossas deliciosas pizzas?
              </p>
              <Button size="lg" onClick={() => navigate('/')} className="gap-2">
                <Pizza className="h-5 w-5" />
                Ver Cardápio
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {/* Active Orders */}
            {activeOrders.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-4 h-4 rounded-full bg-gradient-to-r from-red-500 to-orange-500 animate-pulse shadow-lg shadow-orange-500/50" />
                  <h2 className="font-bold text-lg bg-gradient-to-r from-red-600 to-orange-500 bg-clip-text text-transparent">
                    🔥 Pedidos em Andamento
                  </h2>
                  <Badge className="ml-auto bg-gradient-to-r from-red-500 to-orange-500 text-white border-0 shadow-md">
                    {activeOrders.length} {activeOrders.length === 1 ? 'pedido' : 'pedidos'}
                  </Badge>
                </div>
                
                <div className="space-y-4">
                  {activeOrders.map((order) => {
                    const status = statusConfig[order.status] || statusConfig.pending;
                    const orderDate = new Date(order.created_at);
                    const StatusIcon = status.icon;
                    const orderItems = Array.isArray(order.items) ? (order.items as unknown as OrderItem[]) : [];
                    
                    return (
                      <Card 
                        key={order.id} 
                        className={`overflow-hidden border-3 ${status.borderColor} shadow-xl`}
                      >
                        {/* Status Banner - mais vibrante */}
                        <div className={`px-4 py-4 flex items-center justify-between ${status.bgColor}`}>
                          <div className="flex items-center gap-3">
                            <div className={`p-3 rounded-xl ${status.iconBg} shadow-md`}>
                              <StatusIcon className="h-6 w-6 text-gray-800" />
                            </div>
                            <div className={status.color}>
                              <p className="font-black text-lg flex items-center gap-2">
                                <span className="text-2xl">{status.emoji}</span> 
                                {status.label}
                              </p>
                              <p className="text-sm font-medium opacity-90">{status.description}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="bg-white px-3 py-2 rounded-lg shadow-md">
                              <p className="font-mono font-black text-sm text-gray-900">
                                #{order.id.slice(0, 8).toUpperCase()}
                              </p>
                              <p className="text-xs text-gray-600 font-medium">
                                {formatDistanceToNow(orderDate, { addSuffix: true, locale: ptBR })}
                              </p>
                            </div>
                          </div>
                        </div>

                        <CardContent className="p-4 space-y-4 bg-white">
                          {/* Progress Bar */}
                          <div className="bg-gray-50 p-3 rounded-xl border border-gray-200">
                            <OrderProgressBar currentStatus={order.status} />
                          </div>
                          
                          {/* Items Summary */}
                          <div className="space-y-2">
                            <p className="text-sm font-black text-gray-800 uppercase tracking-wide flex items-center gap-1">
                              🍕 Itens do Pedido
                            </p>
                            {orderItems.map((item, idx) => {
                              // Get the image for the item
                              const itemImage = item.type === 'pizza' 
                                ? (item.flavorImages?.[0] || 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400')
                                : (item.image || 'https://images.unsplash.com/photo-1629203851122-3726ecdf080e?w=400');
                              
                              return (
                                <div key={idx} className="flex items-center justify-between py-3 px-4 bg-orange-100 rounded-xl border-2 border-orange-300">
                                  <div className="flex items-center gap-3">
                                    <img 
                                      src={itemImage} 
                                      alt={item.type === 'pizza' ? `Pizza ${item.flavors?.join(', ')}` : item.name}
                                      className="w-10 h-10 rounded-lg object-cover border-2 border-orange-300 shadow"
                                    />
                                    <div>
                                      <p className="font-bold text-gray-900">
                                        {item.quantity}x {item.type === 'pizza' 
                                          ? `Pizza ${item.size}`
                                          : item.name}
                                      </p>
                                      {item.type === 'pizza' && item.flavors && (
                                        <p className="text-sm text-orange-800 font-semibold">
                                          {item.flavors.join(' + ')}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                  <span className="font-black text-gray-900 bg-white px-3 py-1 rounded-lg shadow border border-gray-200">
                                    R$ {item.price.toFixed(2).replace('.', ',')}
                                  </span>
                                </div>
                              );
                            })}
                          </div>

                          {/* Delivery Info */}
                          <div className="flex items-start gap-3 p-4 bg-red-100 rounded-xl border-2 border-red-300">
                            <div className="p-2 bg-red-500 rounded-lg shadow">
                              <MapPin className="h-5 w-5 text-white" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-black text-red-800 mb-1">📍 Entregar em:</p>
                              <p className="text-sm font-semibold text-gray-900">{order.address}</p>
                            </div>
                          </div>

                          {/* Total and Actions */}
                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-4 border-t-2 border-gray-200">
                            <div>
                              <p className="text-sm text-gray-600 font-semibold">Total do pedido</p>
                              <p className="text-3xl font-black text-red-600">
                                R$ {order.total.toFixed(2).replace('.', ',')}
                              </p>
                            </div>
                            <div className="flex gap-2 w-full sm:w-auto">
                              <Button
                                variant="outline"
                                size="lg"
                                onClick={() => setReceiptOrder(order)}
                                className="gap-2 border-2 border-gray-300 font-bold flex-1 sm:flex-initial"
                              >
                                <Receipt className="h-5 w-5" />
                                <span className="hidden xs:inline">Comprovante</span>
                                <span className="xs:hidden">Ver</span>
                              </Button>
                              <Button
                                size="lg"
                                onClick={() => navigate(`/pedido/${order.id}`)}
                                className="gap-2 bg-red-600 hover:bg-red-700 shadow-xl text-white font-bold flex-1 sm:flex-initial"
                              >
                                <Eye className="h-5 w-5" />
                                Acompanhar
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Past Orders */}
            {pastOrders.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <h2 className="font-bold text-lg text-muted-foreground">Histórico</h2>
                  <Badge variant="outline" className="ml-auto">
                    {pastOrders.length}
                  </Badge>
                </div>
                
                <div className="space-y-3">
                  {pastOrders.map((order) => {
                    const status = statusConfig[order.status] || statusConfig.pending;
                    const orderDate = new Date(order.created_at);
                    const orderItems = Array.isArray(order.items) ? (order.items as unknown as OrderItem[]) : [];
                    const paymentInfo = paymentLabels[order.payment_method] || { label: order.payment_method, icon: '💳' };
                    
                    return (
                      <Card 
                        key={order.id} 
                        className="overflow-hidden hover:shadow-md transition-all"
                      >
                        <CardContent className="p-4">
                          {/* Header */}
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className={`text-2xl`}>{status.emoji}</div>
                              <div>
                                <p className="font-bold">
                                  Pedido #{order.id.slice(0, 8).toUpperCase()}
                                </p>
                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {format(orderDate, "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                                </p>
                              </div>
                            </div>
                            <Badge variant={status.variant} className="shrink-0">
                              {status.label}
                            </Badge>
                          </div>

                          {/* Items Preview */}
                          <div className="flex flex-wrap gap-2 mb-3">
                            {orderItems.slice(0, 3).map((item, idx) => (
                              <span key={idx} className="text-xs bg-muted px-2 py-1 rounded-full">
                                {item.type === 'pizza' ? '🍕' : '🥤'} {item.quantity}x {item.type === 'pizza' ? item.flavors?.join('/') : item.name}
                              </span>
                            ))}
                            {orderItems.length > 3 && (
                              <span className="text-xs bg-muted px-2 py-1 rounded-full">
                                +{orderItems.length - 3} mais
                              </span>
                            )}
                          </div>

                          {/* Footer */}
                          <div className="flex items-center justify-between pt-3 border-t">
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                {paymentInfo.icon} {paymentInfo.label}
                              </span>
                              {order.points_earned > 0 && (
                                <span className="flex items-center gap-1 text-amber-600">
                                  <Star className="h-3 w-3 fill-amber-500" />
                                  +{order.points_earned} pts
                                </span>
                              )}
                            </div>
                            <p className="font-bold text-lg">
                              R$ {order.total.toFixed(2).replace('.', ',')}
                            </p>
                          </div>

                          {/* Actions */}
                          <div className="flex gap-2 mt-3">
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1 gap-2"
                              onClick={() => setReceiptOrder(order)}
                            >
                              <Receipt className="h-4 w-4" />
                              Comprovante
                            </Button>
                            <Button
                              variant="default"
                              size="sm"
                              className="flex-1 gap-2"
                              onClick={() => handleRepeatOrder(order)}
                            >
                              <RefreshCw className="h-4 w-4" />
                              Pedir Novamente
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </section>
            )}
          </div>
        )}

        {/* Receipt Modal */}
        {receiptOrder && (
          <OrderReceipt
            order={{
              ...receiptOrder,
              items: Array.isArray(receiptOrder.items) 
                ? (receiptOrder.items as unknown as { type: string; name?: string; size?: string; flavors?: string[]; quantity: number; price: number }[])
                : [],
              customer_name: user?.user_metadata?.name || 'Cliente'
            }}
            open={!!receiptOrder}
            onClose={() => setReceiptOrder(null)}
          />
        )}
      </div>
    </div>
  );
}
