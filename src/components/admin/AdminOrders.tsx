import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Eye, Search, RefreshCw, Loader2, ShoppingBag } from 'lucide-react';
import { toast } from 'sonner';

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
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-500',
  pending_payment: 'bg-orange-500',
  confirmed: 'bg-blue-500',
  preparing: 'bg-purple-500',
  ready: 'bg-indigo-500',
  delivering: 'bg-cyan-500',
  delivered: 'bg-green-500',
  cancelled: 'bg-red-500'
};

const statusLabels: Record<string, string> = {
  pending: 'Pendente',
  pending_payment: 'Aguardando Pagamento',
  confirmed: 'Confirmado',
  preparing: 'Preparando',
  ready: 'Pronto',
  delivering: 'Em Entrega',
  delivered: 'Entregue',
  cancelled: 'Cancelado'
};

export const AdminOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    fetchOrders();

    // Realtime subscription
    const channel = supabase
      .channel('admin-orders-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        () => {
          fetchOrders();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const ordersWithParsedItems = data?.map(order => ({
        ...order,
        items: typeof order.items === 'string' ? JSON.parse(order.items) : order.items
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
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;
      toast.success('Status atualizado com sucesso!');
      fetchOrders();
    } catch (error) {
      console.error('Error updating order:', error);
      toast.error('Erro ao atualizar status');
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.address.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <ShoppingBag className="h-6 w-6 text-orange-400" />
            Pedidos em Tempo Real
          </h2>
          <p className="text-zinc-400 text-sm mt-1">Gerencie todos os pedidos da pizzaria</p>
        </div>
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
      
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <Input
            placeholder="Buscar por ID ou endereço..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-black/40 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-orange-500"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[200px] bg-black/40 border-zinc-700 text-white">
            <SelectValue placeholder="Filtrar por status" />
          </SelectTrigger>
          <SelectContent className="bg-zinc-900 border-zinc-700">
            <SelectItem value="all">Todos</SelectItem>
            {Object.entries(statusLabels).map(([value, label]) => (
              <SelectItem key={value} value={value}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <Card className="bg-black/40 border-zinc-800">
        <CardContent className="p-0">
          <ScrollArea className="h-[600px]">
            <Table>
              <TableHeader>
                <TableRow className="border-zinc-800 hover:bg-transparent">
                  <TableHead className="text-zinc-400">ID</TableHead>
                  <TableHead className="text-zinc-400">Data</TableHead>
                  <TableHead className="text-zinc-400">Status</TableHead>
                  <TableHead className="text-zinc-400">Pagamento</TableHead>
                  <TableHead className="text-zinc-400">Total</TableHead>
                  <TableHead className="text-zinc-400">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => (
                  <TableRow key={order.id} className="border-zinc-800 hover:bg-white/5">
                    <TableCell className="font-mono text-xs text-zinc-300">
                      {order.id.slice(0, 8)}...
                    </TableCell>
                    <TableCell className="text-zinc-300">
                      {format(new Date(order.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                    </TableCell>
                    <TableCell>
                      <Badge className={`${statusColors[order.status]} text-white border-0`}>
                        {statusLabels[order.status] || order.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="capitalize text-zinc-300">
                      {order.payment_method === 'pix' ? 'PIX' : 
                       order.payment_method === 'credit_card' ? 'Cartão' : 
                       order.payment_method === 'cash' ? 'Dinheiro' : order.payment_method}
                    </TableCell>
                    <TableCell className="font-semibold text-emerald-400">
                      R$ {Number(order.total).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => setSelectedOrder(order)}
                              className="border-zinc-700 bg-zinc-800/50 text-zinc-300 hover:bg-zinc-700 hover:text-white"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl bg-zinc-900 border-zinc-700">
                            <DialogHeader>
                              <DialogTitle className="text-white">Detalhes do Pedido</DialogTitle>
                            </DialogHeader>
                            {selectedOrder && (
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <p className="text-sm text-zinc-400">ID do Pedido</p>
                                    <p className="font-mono text-sm text-white">{selectedOrder.id}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-zinc-400">Data</p>
                                    <p className="text-white">{format(new Date(selectedOrder.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-zinc-400">Endereço</p>
                                    <p className="text-white">{selectedOrder.address}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-zinc-400">Pontos Ganhos</p>
                                    <p className="text-orange-400">{selectedOrder.points_earned} pontos</p>
                                  </div>
                                </div>
                                
                                <div>
                                  <p className="text-sm text-zinc-400 mb-2">Itens</p>
                                  <div className="space-y-2">
                                    {selectedOrder.items.map((item: any, index: number) => (
                                      <div key={index} className="flex justify-between items-center p-3 bg-black/40 rounded-lg border border-zinc-800">
                                        <span className="text-white">{item.quantity}x {item.name}</span>
                                        <span className="font-semibold text-emerald-400">R$ {(item.price * item.quantity).toFixed(2)}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                                
                                <div className="border-t border-zinc-700 pt-4 space-y-2">
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
                                  <div className="flex justify-between font-bold text-lg text-white pt-2 border-t border-zinc-700">
                                    <span>Total</span>
                                    <span className="text-emerald-400">R$ {Number(selectedOrder.total).toFixed(2)}</span>
                                  </div>
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                        
                        <Select
                          value={order.status}
                          onValueChange={(value) => updateOrderStatus(order.id, value)}
                        >
                          <SelectTrigger className="w-[140px] bg-zinc-800/50 border-zinc-700 text-zinc-300">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-zinc-900 border-zinc-700">
                            {Object.entries(statusLabels).map(([value, label]) => (
                              <SelectItem key={value} value={value}>{label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            {filteredOrders.length === 0 && (
              <div className="text-center py-12 text-zinc-500">
                <ShoppingBag className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Nenhum pedido encontrado</p>
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};
