import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Search, Eye, Loader2, Star, Users } from 'lucide-react';
import { toast } from 'sonner';
import adminCustomersHero from '@/assets/admin-customers-hero.jpg';

interface Profile {
  id: string;
  user_id: string;
  name: string | null;
  phone: string | null;
  loyalty_points: number;
  created_at: string;
}

interface Order {
  id: string;
  total: number;
  status: string;
  created_at: string;
}

export const AdminCustomers = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Profile | null>(null);
  const [customerOrders, setCustomerOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProfiles(data || []);
    } catch (error) {
      console.error('Error fetching profiles:', error);
      toast.error('Erro ao carregar clientes');
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomerOrders = async (userId: string) => {
    setLoadingOrders(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('id, total, status, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCustomerOrders(data || []);
    } catch (error) {
      console.error('Error fetching customer orders:', error);
      toast.error('Erro ao carregar pedidos do cliente');
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleViewCustomer = (customer: Profile) => {
    setSelectedCustomer(customer);
    fetchCustomerOrders(customer.user_id);
  };

  const filteredProfiles = profiles.filter(profile => {
    const searchLower = searchTerm.toLowerCase();
    return (
      (profile.name?.toLowerCase().includes(searchLower) || false) ||
      (profile.phone?.includes(searchTerm) || false) ||
      profile.user_id.toLowerCase().includes(searchLower)
    );
  });

  const statusLabels: Record<string, string> = {
    pending: 'Pendente',
    pending_payment: 'Aguardando',
    confirmed: 'Confirmado',
    preparing: 'Preparando',
    ready: 'Pronto',
    delivering: 'Entregando',
    delivered: 'Entregue',
    cancelled: 'Cancelado'
  };

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
          src={adminCustomersHero} 
          alt="Clientes" 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
        <div className="absolute inset-0 flex items-center px-5">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
              <Users className="h-5 w-5 md:h-6 md:w-6 text-rose-400" />
              Gestão de Clientes
            </h2>
            <p className="text-rose-200/80 text-sm mt-1">Visualize e gerencie todos os clientes cadastrados</p>
          </div>
        </div>
      </div>
      
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-500" />
        <Input
          placeholder="Buscar por nome, telefone ou ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 bg-black/40 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-orange-500"
        />
      </div>
      
      {/* Mobile View - Cards */}
      <div className="md:hidden space-y-3">
        <ScrollArea className="h-[calc(100vh-280px)]">
          <div className="space-y-3 pr-2">
            {filteredProfiles.map((profile) => (
              <Card key={profile.id} className="bg-black/40 border-zinc-800">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-white truncate">{profile.name || 'Sem nome'}</p>
                      <p className="text-xs text-zinc-500 font-mono">{profile.user_id.slice(0, 8)}...</p>
                      <p className="text-sm text-zinc-400 mt-1">{profile.phone || 'Sem telefone'}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 flex items-center gap-1">
                        <Star className="h-3 w-3" />
                        {profile.loyalty_points}
                      </Badge>
                      <span className="text-xs text-zinc-500">
                        {format(new Date(profile.created_at), 'dd/MM/yy', { locale: ptBR })}
                      </span>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-zinc-800">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewCustomer(profile)}
                          className="w-full border-zinc-700 bg-zinc-800/50 text-zinc-300 hover:bg-zinc-700 hover:text-white"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Ver detalhes
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-[95vw] max-h-[90vh] overflow-y-auto bg-zinc-900 border-zinc-700">
                        <DialogHeader>
                          <DialogTitle className="text-white">Detalhes do Cliente</DialogTitle>
                        </DialogHeader>
                        {selectedCustomer && (
                          <div className="space-y-4">
                            <div className="grid grid-cols-1 gap-3">
                              <div>
                                <p className="text-sm text-zinc-400">Nome</p>
                                <p className="font-medium text-white">{selectedCustomer.name || 'Sem nome'}</p>
                              </div>
                              <div>
                                <p className="text-sm text-zinc-400">Telefone</p>
                                <p className="font-medium text-white">{selectedCustomer.phone || 'Não informado'}</p>
                              </div>
                              <div>
                                <p className="text-sm text-zinc-400">Pontos de Fidelidade</p>
                                <p className="font-medium flex items-center gap-1 text-amber-400">
                                  <Star className="h-4 w-4" />
                                  {selectedCustomer.loyalty_points} pontos
                                </p>
                              </div>
                              <div>
                                <p className="text-sm text-zinc-400">Cliente desde</p>
                                <p className="font-medium text-white">
                                  {format(new Date(selectedCustomer.created_at), "dd/MM/yyyy", { locale: ptBR })}
                                </p>
                              </div>
                            </div>
                            
                            <div>
                              <h4 className="font-semibold mb-3 text-white">Histórico de Pedidos</h4>
                              {loadingOrders ? (
                                <div className="flex items-center justify-center py-6">
                                  <Loader2 className="h-6 w-6 animate-spin text-orange-400" />
                                </div>
                              ) : customerOrders.length > 0 ? (
                                <div className="space-y-2 max-h-[200px] overflow-y-auto">
                                  {customerOrders.map((order) => (
                                    <div key={order.id} className="flex items-center justify-between p-2 bg-zinc-800/50 rounded-lg">
                                      <div>
                                        <p className="text-sm text-zinc-300">
                                          {format(new Date(order.created_at), 'dd/MM/yy HH:mm', { locale: ptBR })}
                                        </p>
                                        <Badge className="bg-orange-500/20 text-orange-300 border-orange-500/30 text-xs">
                                          {statusLabels[order.status] || order.status}
                                        </Badge>
                                      </div>
                                      <span className="font-semibold text-emerald-400">
                                        R$ {Number(order.total).toFixed(2)}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-zinc-500 text-center py-4 text-sm">
                                  Nenhum pedido encontrado
                                </p>
                              )}
                            </div>
                            
                            <div className="border-t border-zinc-700 pt-3">
                              <div className="flex justify-between items-center text-sm">
                                <span className="text-zinc-400">Total de pedidos</span>
                                <span className="font-semibold text-white">{customerOrders.length}</span>
                              </div>
                              <div className="flex justify-between items-center mt-2">
                                <span className="text-zinc-400 text-sm">Total gasto</span>
                                <span className="font-semibold text-emerald-400">
                                  R$ {customerOrders.reduce((sum, o) => sum + Number(o.total), 0).toFixed(2)}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {filteredProfiles.length === 0 && (
              <div className="text-center py-12 text-zinc-500">
                <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Nenhum cliente encontrado</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Desktop View - Table */}
      <Card className="hidden md:block bg-black/40 border-zinc-800">
        <CardContent className="p-0">
          <ScrollArea className="h-[600px]">
            <Table>
              <TableHeader>
                <TableRow className="border-zinc-800 hover:bg-transparent">
                  <TableHead className="text-zinc-400">Cliente</TableHead>
                  <TableHead className="text-zinc-400">Telefone</TableHead>
                  <TableHead className="text-zinc-400">Pontos</TableHead>
                  <TableHead className="text-zinc-400">Cadastro</TableHead>
                  <TableHead className="text-zinc-400">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProfiles.map((profile) => (
                  <TableRow key={profile.id} className="border-zinc-800 hover:bg-white/5">
                    <TableCell>
                      <div>
                        <p className="font-medium text-white">{profile.name || 'Sem nome'}</p>
                        <p className="text-xs text-zinc-500 font-mono">
                          {profile.user_id.slice(0, 8)}...
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="text-zinc-300">{profile.phone || '-'}</TableCell>
                    <TableCell>
                      <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 flex items-center gap-1 w-fit">
                        <Star className="h-3 w-3" />
                        {profile.loyalty_points}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-zinc-300">
                      {format(new Date(profile.created_at), 'dd/MM/yyyy', { locale: ptBR })}
                    </TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewCustomer(profile)}
                            className="border-zinc-700 bg-zinc-800/50 text-zinc-300 hover:bg-zinc-700 hover:text-white"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl bg-zinc-900 border-zinc-700">
                          <DialogHeader>
                            <DialogTitle className="text-white">Detalhes do Cliente</DialogTitle>
                          </DialogHeader>
                          {selectedCustomer && (
                            <div className="space-y-6">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <p className="text-sm text-zinc-400">Nome</p>
                                  <p className="font-medium text-white">{selectedCustomer.name || 'Sem nome'}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-zinc-400">Telefone</p>
                                  <p className="font-medium text-white">{selectedCustomer.phone || 'Não informado'}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-zinc-400">Pontos de Fidelidade</p>
                                  <p className="font-medium flex items-center gap-1 text-amber-400">
                                    <Star className="h-4 w-4" />
                                    {selectedCustomer.loyalty_points} pontos
                                  </p>
                                </div>
                                <div>
                                  <p className="text-sm text-zinc-400">Cliente desde</p>
                                  <p className="font-medium text-white">
                                    {format(new Date(selectedCustomer.created_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                                  </p>
                                </div>
                              </div>
                              
                              <div>
                                <h4 className="font-semibold mb-3 text-white">Histórico de Pedidos</h4>
                                {loadingOrders ? (
                                  <div className="flex items-center justify-center py-8">
                                    <Loader2 className="h-6 w-6 animate-spin text-orange-400" />
                                  </div>
                                ) : customerOrders.length > 0 ? (
                                  <ScrollArea className="h-[200px]">
                                    <Table>
                                      <TableHeader>
                                        <TableRow className="border-zinc-700 hover:bg-transparent">
                                          <TableHead className="text-zinc-400">Data</TableHead>
                                          <TableHead className="text-zinc-400">Status</TableHead>
                                          <TableHead className="text-zinc-400">Total</TableHead>
                                        </TableRow>
                                      </TableHeader>
                                      <TableBody>
                                        {customerOrders.map((order) => (
                                          <TableRow key={order.id} className="border-zinc-700 hover:bg-white/5">
                                            <TableCell className="text-zinc-300">
                                              {format(new Date(order.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                                            </TableCell>
                                            <TableCell>
                                              <Badge className="bg-orange-500/20 text-orange-300 border-orange-500/30">
                                                {statusLabels[order.status] || order.status}
                                              </Badge>
                                            </TableCell>
                                            <TableCell className="font-semibold text-emerald-400">
                                              R$ {Number(order.total).toFixed(2)}
                                            </TableCell>
                                          </TableRow>
                                        ))}
                                      </TableBody>
                                    </Table>
                                  </ScrollArea>
                                ) : (
                                  <p className="text-zinc-500 text-center py-4">
                                    Nenhum pedido encontrado
                                  </p>
                                )}
                              </div>
                              
                              <div className="border-t border-zinc-700 pt-4">
                                <div className="flex justify-between items-center">
                                  <span className="text-zinc-400">Total de pedidos</span>
                                  <span className="font-semibold text-white">{customerOrders.length}</span>
                                </div>
                                <div className="flex justify-between items-center mt-2">
                                  <span className="text-zinc-400">Total gasto</span>
                                  <span className="font-semibold text-lg text-emerald-400">
                                    R$ {customerOrders.reduce((sum, o) => sum + Number(o.total), 0).toFixed(2)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            {filteredProfiles.length === 0 && (
              <div className="text-center py-12 text-zinc-500">
                <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Nenhum cliente encontrado</p>
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};
