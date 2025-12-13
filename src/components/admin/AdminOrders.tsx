import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format, startOfDay, endOfDay, isWithinInterval } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  Eye, Search, RefreshCw, Loader2, ShoppingBag, 
  Clock, CreditCard, CheckCircle2, ChefHat, Truck, 
  Package, XCircle, ArrowRight, MapPin, User, Phone,
  Wallet, Timer, AlertCircle, CalendarIcon, X
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { OrderProgressBar } from '@/components/OrderProgressBar';
import adminOrdersHero from '@/assets/admin-orders-hero.jpg';

interface Profile {
  user_id: string;
  name: string | null;
  phone: string | null;
}

interface Order {
  id: string;
  user_id: string;
  items: any[];
  subtotal: number;
  discount: number;
  delivery_fee: number;
  total: number;
  status: string;
  payment_method: string;
  address: string;
  created_at: string;
  points_earned: number;
  customer_name?: string;
}

const orderStatuses = [
  { key: 'pending', label: 'Pendente', shortLabel: 'Pend.', icon: Clock, color: 'bg-yellow-500', textColor: 'text-yellow-500', description: 'Aguardando confirmação' },
  { key: 'pending_payment', label: 'Aguardando Pagamento', shortLabel: 'Pag.', icon: Wallet, color: 'bg-orange-500', textColor: 'text-orange-500', description: 'PIX pendente' },
  { key: 'confirmed', label: 'Confirmado', shortLabel: 'Conf.', icon: CheckCircle2, color: 'bg-blue-500', textColor: 'text-blue-500', description: 'Pagamento confirmado' },
  { key: 'preparing', label: 'Preparando', shortLabel: 'Prep.', icon: ChefHat, color: 'bg-purple-500', textColor: 'text-purple-500', description: 'Na cozinha' },
  { key: 'ready', label: 'Pronto', shortLabel: 'Pronto', icon: Package, color: 'bg-indigo-500', textColor: 'text-indigo-500', description: 'Pronto para entrega' },
  { key: 'delivering', label: 'Em Entrega', shortLabel: 'Entreg.', icon: Truck, color: 'bg-cyan-500', textColor: 'text-cyan-500', description: 'A caminho' },
  { key: 'delivered', label: 'Entregue', shortLabel: 'Feito', icon: CheckCircle2, color: 'bg-emerald-500', textColor: 'text-emerald-500', description: 'Finalizado' },
  { key: 'cancelled', label: 'Cancelado', shortLabel: 'Canc.', icon: XCircle, color: 'bg-red-500', textColor: 'text-red-500', description: 'Pedido cancelado' },
];

const getStatusConfig = (status: string) => {
  return orderStatuses.find(s => s.key === status) || orderStatuses[0];
};

const getPaymentLabel = (method: string) => {
  switch (method) {
    case 'pix': return 'PIX';
    case 'credit_card': return 'Cartão de Crédito';
    case 'debit_card': return 'Cartão de Débito';
    case 'cash': return 'Dinheiro';
    default: return method;
  }
};

const getNextStatus = (currentStatus: string) => {
  const statusFlow: Record<string, string> = {
    'pending': 'confirmed',
    'pending_payment': 'confirmed',
    'confirmed': 'preparing',
    'preparing': 'ready',
    'ready': 'delivering',
    'delivering': 'delivered',
  };
  return statusFlow[currentStatus];
};

export const AdminOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('active');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [dateFrom, setDateFrom] = useState<Date | undefined>(undefined);
  const [dateTo, setDateTo] = useState<Date | undefined>(undefined);

  useEffect(() => {
    fetchOrders();

    const channel = supabase
      .channel('admin-orders-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newOrder = payload.new as Order;
            newOrder.items = typeof newOrder.items === 'string' ? JSON.parse(newOrder.items) : newOrder.items;
            setOrders(prev => [newOrder, ...prev]);
            
            // Play notification sound for new orders
            playNotificationSound();
            toast.success('🍕 Novo pedido recebido!', {
              description: `Pedido #${newOrder.id.slice(0, 8)} - R$ ${Number(newOrder.total).toFixed(2)}`,
              duration: 8000,
            });
          } else if (payload.eventType === 'UPDATE') {
            const updatedOrder = payload.new as Order;
            updatedOrder.items = typeof updatedOrder.items === 'string' ? JSON.parse(updatedOrder.items) : updatedOrder.items;
            setOrders(prev => prev.map(o => o.id === updatedOrder.id ? updatedOrder : o));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const playNotificationSound = () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.05);
      gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.3);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
      
      // Second beep
      setTimeout(() => {
        const osc2 = audioContext.createOscillator();
        const gain2 = audioContext.createGain();
        osc2.connect(gain2);
        gain2.connect(audioContext.destination);
        osc2.frequency.value = 1000;
        osc2.type = 'sine';
        gain2.gain.setValueAtTime(0, audioContext.currentTime);
        gain2.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.05);
        gain2.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.3);
        osc2.start(audioContext.currentTime);
        osc2.stop(audioContext.currentTime + 0.3);
      }, 200);
    } catch (e) {
      console.log('Audio not supported');
    }
  };

  const fetchOrders = async () => {
    try {
      // Fetch orders
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;
      
      // Fetch all profiles to get customer names
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('user_id, name, phone');
      
      const profilesMap = new Map<string, Profile>();
      profilesData?.forEach(profile => {
        profilesMap.set(profile.user_id, profile);
      });
      
      const ordersWithParsedItems = ordersData?.map(order => ({
        ...order,
        items: typeof order.items === 'string' ? JSON.parse(order.items) : order.items,
        customer_name: profilesMap.get(order.user_id)?.name || 'Cliente'
      })) || [];
      
      setOrders(ordersWithParsedItems);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Erro ao carregar pedidos');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    setUpdatingStatus(orderId);
    try {
      // Atualiza imediatamente o estado local para refletir nas contagens
      setOrders(prev => prev.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ));
      
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) {
        // Reverte em caso de erro
        fetchOrders();
        throw error;
      }
      
      const statusConfig = getStatusConfig(newStatus);
      toast.success(`Status atualizado: ${statusConfig.label}`, {
        icon: '✅',
      });
    } catch (error) {
      console.error('Error updating order:', error);
      toast.error('Erro ao atualizar status');
    } finally {
      setUpdatingStatus(null);
    }
  };

  const advanceToNextStatus = async (order: Order) => {
    const nextStatus = getNextStatus(order.status);
    if (nextStatus) {
      await updateOrderStatus(order.id, nextStatus);
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.address.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Date filter
    const orderDate = new Date(order.created_at);
    let matchesDate = true;
    
    if (dateFrom && dateTo) {
      matchesDate = isWithinInterval(orderDate, {
        start: startOfDay(dateFrom),
        end: endOfDay(dateTo)
      });
    } else if (dateFrom) {
      matchesDate = orderDate >= startOfDay(dateFrom);
    } else if (dateTo) {
      matchesDate = orderDate <= endOfDay(dateTo);
    }
    
    if (!matchesDate) return false;
    
    if (statusFilter === 'all') return matchesSearch;
    if (statusFilter === 'active') {
      return matchesSearch && !['delivered', 'cancelled'].includes(order.status);
    }
    return matchesSearch && order.status === statusFilter;
  });

  // Count orders by status
  const statusCounts = orderStatuses.reduce((acc, status) => {
    acc[status.key] = orders.filter(o => o.status === status.key).length;
    return acc;
  }, {} as Record<string, number>);

  const activeOrdersCount = orders.filter(o => !['delivered', 'cancelled'].includes(o.status)).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div className="relative rounded-xl overflow-hidden h-28 md:h-36 group">
        <img 
          src={adminOrdersHero} 
          alt="Pedidos" 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
        <div className="absolute inset-0 flex items-center px-5">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 md:h-6 md:w-6 text-orange-400" />
              Central de Pedidos
            </h2>
            <p className="text-orange-200/80 text-sm mt-1">{activeOrdersCount} pedidos ativos em tempo real</p>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="flex justify-end">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={fetchOrders}
          className="border-orange-500/30 bg-orange-500/10 text-orange-300 hover:bg-orange-500/20"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {/* Status Quick Filters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
        <Button
          variant={statusFilter === 'active' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setStatusFilter('active')}
          className={cn(
            "justify-start gap-2",
            statusFilter === 'active' 
              ? 'bg-orange-500 hover:bg-orange-600 text-white' 
              : 'border-zinc-700 bg-black/40 text-zinc-300 hover:bg-zinc-800'
          )}
        >
          <AlertCircle className="h-4 w-4" />
          Ativos ({activeOrdersCount})
        </Button>
        {orderStatuses.filter(s => s.key !== 'cancelled').map((status) => {
          const Icon = status.icon;
          const count = statusCounts[status.key] || 0;
          const isActive = statusFilter === status.key;
          
          return (
            <Button
              key={status.key}
              variant={isActive ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter(status.key)}
              className={cn(
                "justify-start gap-1 text-xs sm:text-sm",
                isActive 
                  ? `${status.color} hover:opacity-90 text-white` 
                  : 'border-zinc-700 bg-black/40 text-zinc-300 hover:bg-zinc-800'
              )}
            >
              <Icon className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
              <span className="hidden lg:inline truncate">{status.label}</span>
              <span className="lg:hidden truncate">{status.shortLabel}</span>
              <span className="flex-shrink-0">({count})</span>
            </Button>
          );
        })}
      </div>
      
      {/* Search and Date Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <Input
            placeholder="Buscar por ID do pedido ou endereço..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-black/40 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-orange-500"
          />
        </div>
        
        {/* Date From */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full sm:w-[150px] justify-start text-left font-normal border-zinc-700 bg-black/40 text-zinc-300 hover:bg-zinc-800",
                dateFrom && "text-white"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateFrom ? format(dateFrom, "dd/MM/yy") : "De"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 bg-zinc-900 border-zinc-700" align="start">
            <Calendar
              mode="single"
              selected={dateFrom}
              onSelect={setDateFrom}
              initialFocus
              locale={ptBR}
              className="p-3 pointer-events-auto"
            />
          </PopoverContent>
        </Popover>
        
        {/* Date To */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full sm:w-[150px] justify-start text-left font-normal border-zinc-700 bg-black/40 text-zinc-300 hover:bg-zinc-800",
                dateTo && "text-white"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateTo ? format(dateTo, "dd/MM/yy") : "Até"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 bg-zinc-900 border-zinc-700" align="start">
            <Calendar
              mode="single"
              selected={dateTo}
              onSelect={setDateTo}
              initialFocus
              locale={ptBR}
              className="p-3 pointer-events-auto"
            />
          </PopoverContent>
        </Popover>
        
        {/* Clear Date Filter */}
        {(dateFrom || dateTo) && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setDateFrom(undefined);
              setDateTo(undefined);
            }}
            className="text-zinc-400 hover:text-white hover:bg-zinc-800"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Orders Grid */}
      <div className="grid gap-4">
        {filteredOrders.map((order) => {
          const statusConfig = getStatusConfig(order.status);
          const StatusIcon = statusConfig.icon;
          const nextStatus = getNextStatus(order.status);
          const nextStatusConfig = nextStatus ? getStatusConfig(nextStatus) : null;
          const isUpdating = updatingStatus === order.id;
          
          return (
            <Card 
              key={order.id} 
              className={cn(
                "bg-gradient-to-r from-zinc-900/90 to-zinc-900/70 border-l-4 transition-all duration-300 hover:shadow-lg",
                order.status === 'cancelled' ? 'border-l-red-500 opacity-60' : `border-l-${statusConfig.color.replace('bg-', '')}`
              )}
              style={{ borderLeftColor: statusConfig.color.includes('yellow') ? '#eab308' : 
                       statusConfig.color.includes('orange') ? '#f97316' :
                       statusConfig.color.includes('blue') ? '#3b82f6' :
                       statusConfig.color.includes('purple') ? '#a855f7' :
                       statusConfig.color.includes('indigo') ? '#6366f1' :
                       statusConfig.color.includes('cyan') ? '#06b6d4' :
                       statusConfig.color.includes('emerald') ? '#10b981' :
                       statusConfig.color.includes('red') ? '#ef4444' : '#f97316'
              }}
            >
              <CardContent className="p-4">
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                  {/* Order Info */}
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={cn("p-2 rounded-lg", statusConfig.color)}>
                          <StatusIcon className="h-5 w-5 text-white" />
                        </div>
                        <div>
                                          <p className="font-bold text-white text-lg">
                                            #{order.id.slice(0, 8).toUpperCase()}
                                          </p>
                                          <p className="text-sm text-orange-300 font-medium">
                                            👤 {order.customer_name || 'Cliente'}
                                          </p>
                                          <p className="text-xs text-zinc-400">
                                            {format(new Date(order.created_at), "dd/MM 'às' HH:mm", { locale: ptBR })}
                                          </p>
                                        </div>
                                      </div>
                                      <Badge className={cn(statusConfig.color, "text-white border-0 font-medium")}>
                                        {statusConfig.label}
                                      </Badge>
                    </div>

                    {/* Progress Bar */}
                    {!['cancelled'].includes(order.status) && (
                      <OrderProgressBar currentStatus={order.status} className="py-2" />
                    )}

                    {/* Order Details */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                      <div className="flex items-center gap-2 text-zinc-400">
                        <MapPin className="h-4 w-4 text-zinc-500" />
                        <span className="truncate">{order.address}</span>
                      </div>
                      <div className="flex items-center gap-2 text-zinc-400">
                        <CreditCard className="h-4 w-4 text-zinc-500" />
                        <span>{getPaymentLabel(order.payment_method)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-bold text-emerald-400">
                          R$ {Number(order.total).toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {/* Items Preview */}
                    <div className="flex flex-wrap gap-2">
                      {order.items.slice(0, 3).map((item: any, idx: number) => (
                        <Badge 
                          key={idx} 
                          variant="outline" 
                          className="border-zinc-700 text-zinc-300 bg-black/30"
                        >
                          {item.quantity}x {item.name}
                        </Badge>
                      ))}
                      {order.items.length > 3 && (
                        <Badge variant="outline" className="border-zinc-700 text-zinc-400">
                          +{order.items.length - 3} itens
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 lg:w-48">
                    {nextStatusConfig && order.status !== 'delivered' && order.status !== 'cancelled' && (
                      <Button
                        onClick={() => advanceToNextStatus(order)}
                        disabled={isUpdating}
                        className={cn(
                          "w-full gap-2 font-medium transition-all",
                          nextStatusConfig.color,
                          "hover:opacity-90 text-white"
                        )}
                      >
                        {isUpdating ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <ArrowRight className="h-4 w-4" />
                            {nextStatusConfig.label}
                          </>
                        )}
                      </Button>
                    )}

                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => setSelectedOrder(order)}
                            className="flex-1 border-zinc-700 bg-zinc-800/50 text-zinc-300 hover:bg-zinc-700 hover:text-white"
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Detalhes
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl bg-zinc-900 border-zinc-700">
                          <DialogHeader>
                            <DialogTitle className="text-white flex items-center gap-2">
                              <ShoppingBag className="h-5 w-5 text-orange-400" />
                              Pedido #{selectedOrder?.id.slice(0, 8).toUpperCase()}
                            </DialogTitle>
                          </DialogHeader>
                          {selectedOrder && (
                            <ScrollArea className="max-h-[70vh]">
                              <div className="space-y-6 pr-4">
                                {/* Status Progress */}
                                <OrderProgressBar currentStatus={selectedOrder.status} />

                                <Separator className="bg-zinc-800" />

                                {/* Order Info Grid */}
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-1 col-span-2">
                                    <p className="text-xs text-zinc-500 uppercase tracking-wide">Cliente</p>
                                    <p className="text-lg font-bold text-orange-400">👤 {selectedOrder.customer_name || 'Cliente'}</p>
                                  </div>
                                  <div className="space-y-1">
                                    <p className="text-xs text-zinc-500 uppercase tracking-wide">ID do Pedido</p>
                                    <p className="font-mono text-sm text-white">{selectedOrder.id}</p>
                                  </div>
                                  <div className="space-y-1">
                                    <p className="text-xs text-zinc-500 uppercase tracking-wide">Data</p>
                                    <p className="text-white">{format(new Date(selectedOrder.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</p>
                                  </div>
                                  <div className="space-y-1">
                                    <p className="text-xs text-zinc-500 uppercase tracking-wide">Endereço</p>
                                    <p className="text-white">{selectedOrder.address}</p>
                                  </div>
                                  <div className="space-y-1">
                                    <p className="text-xs text-zinc-500 uppercase tracking-wide">Pagamento</p>
                                    <p className="text-white">{getPaymentLabel(selectedOrder.payment_method)}</p>
                                  </div>
                                </div>

                                <Separator className="bg-zinc-800" />

                                {/* Items */}
                                <div>
                                  <p className="text-xs text-zinc-500 uppercase tracking-wide mb-3">Itens do Pedido</p>
                                  <div className="space-y-2">
                                    {selectedOrder.items.map((item: any, index: number) => (
                                      <div key={index} className="flex justify-between items-center p-3 bg-black/40 rounded-lg border border-zinc-800">
                                        <div className="flex items-center gap-3">
                                          <span className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-400 font-bold text-sm">
                                            {item.quantity}
                                          </span>
                                          <span className="text-white">{item.name}</span>
                                        </div>
                                        <span className="font-semibold text-emerald-400">
                                          R$ {(item.price * item.quantity).toFixed(2)}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                <Separator className="bg-zinc-800" />

                                {/* Totals */}
                                <div className="space-y-2">
                                  <div className="flex justify-between text-zinc-300">
                                    <span>Subtotal</span>
                                    <span>R$ {Number(selectedOrder.subtotal).toFixed(2)}</span>
                                  </div>
                                  {selectedOrder.discount > 0 && (
                                    <div className="flex justify-between text-emerald-400">
                                      <span>Desconto</span>
                                      <span>-R$ {Number(selectedOrder.discount).toFixed(2)}</span>
                                    </div>
                                  )}
                                  <div className="flex justify-between text-zinc-300">
                                    <span>Taxa de Entrega</span>
                                    <span>R$ {Number(selectedOrder.delivery_fee).toFixed(2)}</span>
                                  </div>
                                  <div className="flex justify-between font-bold text-xl text-white pt-3 border-t border-zinc-700">
                                    <span>Total</span>
                                    <span className="text-emerald-400">R$ {Number(selectedOrder.total).toFixed(2)}</span>
                                  </div>
                                </div>

                                <Separator className="bg-zinc-800" />

                                {/* Status Update */}
                                <div className="space-y-3">
                                  <p className="text-xs text-zinc-500 uppercase tracking-wide">Alterar Status</p>
                                  <Select
                                    value={selectedOrder.status}
                                    onValueChange={(value) => {
                                      updateOrderStatus(selectedOrder.id, value);
                                      setSelectedOrder({ ...selectedOrder, status: value });
                                    }}
                                  >
                                    <SelectTrigger className="w-full bg-black/40 border-zinc-700 text-white">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-zinc-900 border-zinc-700">
                                      {orderStatuses.map((status) => {
                                        const Icon = status.icon;
                                        return (
                                          <SelectItem 
                                            key={status.key} 
                                            value={status.key}
                                            className="text-white hover:bg-zinc-800"
                                          >
                                            <div className="flex items-center gap-2">
                                              <Icon className={cn("h-4 w-4", status.textColor)} />
                                              {status.label}
                                            </div>
                                          </SelectItem>
                                        );
                                      })}
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                            </ScrollArea>
                          )}
                        </DialogContent>
                      </Dialog>

                      {order.status !== 'cancelled' && order.status !== 'delivered' && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => updateOrderStatus(order.id, 'cancelled')}
                          disabled={isUpdating}
                          className="border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300"
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      {filteredOrders.length === 0 && (
        <Card className="bg-black/40 border-zinc-800">
          <CardContent className="py-12">
            <div className="text-center text-zinc-500">
              <ShoppingBag className="h-16 w-16 mx-auto mb-4 opacity-30" />
              <p className="text-lg font-medium">Nenhum pedido encontrado</p>
              <p className="text-sm mt-1">
                {statusFilter !== 'all' ? 'Tente ajustar os filtros' : 'Os pedidos aparecerão aqui em tempo real'}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
