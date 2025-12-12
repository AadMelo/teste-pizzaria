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
import { Search, Eye, Loader2, Star } from 'lucide-react';
import { toast } from 'sonner';

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
    <Card>
      <CardHeader>
        <CardTitle>Gestão de Clientes</CardTitle>
        <div className="relative mt-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, telefone ou ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </CardHeader>
      
      <CardContent>
        <ScrollArea className="h-[600px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>Pontos</TableHead>
                <TableHead>Cadastro</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProfiles.map((profile) => (
                <TableRow key={profile.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{profile.name || 'Sem nome'}</p>
                      <p className="text-xs text-muted-foreground font-mono">
                        {profile.user_id.slice(0, 8)}...
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>{profile.phone || '-'}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="flex items-center gap-1 w-fit">
                      <Star className="h-3 w-3 text-yellow-500" />
                      {profile.loyalty_points}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {format(new Date(profile.created_at), 'dd/MM/yyyy', { locale: ptBR })}
                  </TableCell>
                  <TableCell>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewCustomer(profile)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Detalhes do Cliente</DialogTitle>
                        </DialogHeader>
                        {selectedCustomer && (
                          <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-sm text-muted-foreground">Nome</p>
                                <p className="font-medium">{selectedCustomer.name || 'Sem nome'}</p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">Telefone</p>
                                <p className="font-medium">{selectedCustomer.phone || 'Não informado'}</p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">Pontos de Fidelidade</p>
                                <p className="font-medium flex items-center gap-1">
                                  <Star className="h-4 w-4 text-yellow-500" />
                                  {selectedCustomer.loyalty_points} pontos
                                </p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">Cliente desde</p>
                                <p className="font-medium">
                                  {format(new Date(selectedCustomer.created_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                                </p>
                              </div>
                            </div>
                            
                            <div>
                              <h4 className="font-semibold mb-3">Histórico de Pedidos</h4>
                              {loadingOrders ? (
                                <div className="flex items-center justify-center py-8">
                                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                                </div>
                              ) : customerOrders.length > 0 ? (
                                <ScrollArea className="h-[200px]">
                                  <Table>
                                    <TableHeader>
                                      <TableRow>
                                        <TableHead>Data</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Total</TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {customerOrders.map((order) => (
                                        <TableRow key={order.id}>
                                          <TableCell>
                                            {format(new Date(order.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                                          </TableCell>
                                          <TableCell>
                                            <Badge variant="secondary">
                                              {statusLabels[order.status] || order.status}
                                            </Badge>
                                          </TableCell>
                                          <TableCell className="font-semibold">
                                            R$ {Number(order.total).toFixed(2)}
                                          </TableCell>
                                        </TableRow>
                                      ))}
                                    </TableBody>
                                  </Table>
                                </ScrollArea>
                              ) : (
                                <p className="text-muted-foreground text-center py-4">
                                  Nenhum pedido encontrado
                                </p>
                              )}
                            </div>
                            
                            <div className="border-t pt-4">
                              <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">Total de pedidos</span>
                                <span className="font-semibold">{customerOrders.length}</span>
                              </div>
                              <div className="flex justify-between items-center mt-2">
                                <span className="text-muted-foreground">Total gasto</span>
                                <span className="font-semibold text-lg">
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
            <div className="text-center py-12 text-muted-foreground">
              Nenhum cliente encontrado
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
