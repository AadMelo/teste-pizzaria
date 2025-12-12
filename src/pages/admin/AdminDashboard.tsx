import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useAdmin } from '@/hooks/useAdmin';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { 
  ShoppingBag, 
  Pizza, 
  Users, 
  TrendingUp,
  LogOut,
  Loader2,
  DollarSign,
  Package,
  Clock,
  ChefHat,
  Flame,
  Settings,
  BarChart3
} from 'lucide-react';
import { AdminOrders } from '@/components/admin/AdminOrders';
import { AdminProducts } from '@/components/admin/AdminProducts';
import { AdminCustomers } from '@/components/admin/AdminCustomers';
import { AdminRevenue } from '@/components/admin/AdminRevenue';
import { AdminSettings } from '@/components/admin/AdminSettings';
import { AdminStats } from '@/components/admin/AdminStats';
import { toast } from 'sonner';

interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  totalCustomers: number;
  ordersToday: number;
  revenueToday: number;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdmin();
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    totalRevenue: 0,
    totalCustomers: 0,
    ordersToday: 0,
    revenueToday: 0
  });
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!adminLoading && !isAdmin) {
      toast.error('Acesso negado. Você não tem permissão de administrador.');
      navigate('/');
    }
  }, [isAdmin, adminLoading, navigate]);

  useEffect(() => {
    if (isAdmin) {
      fetchStats();
      
      const channel = supabase
        .channel('admin-orders')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'orders' },
          () => {
            fetchStats();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [isAdmin]);

  const fetchStats = async () => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('*');

      if (ordersError) throw ordersError;

      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*');

      if (profilesError) throw profilesError;

      const todayOrders = orders?.filter(
        order => new Date(order.created_at) >= today
      ) || [];

      setStats({
        totalOrders: orders?.length || 0,
        totalRevenue: orders?.reduce((sum, order) => sum + Number(order.total), 0) || 0,
        totalCustomers: profiles?.length || 0,
        ordersToday: todayOrders.length,
        revenueToday: todayOrders.reduce((sum, order) => sum + Number(order.total), 0)
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast.error('Erro ao carregar estatísticas');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (adminLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-950 via-orange-950 to-red-950 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-gradient-to-r from-orange-500 to-red-500 animate-pulse flex items-center justify-center mx-auto mb-4">
              <Pizza className="h-10 w-10 text-white animate-spin" />
            </div>
            <Flame className="absolute -top-2 -right-2 h-8 w-8 text-orange-400 animate-bounce" />
          </div>
          <p className="text-orange-200 font-medium">Carregando painel...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-neutral-950">
      {/* Decorative Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-red-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-amber-500/5 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-orange-500/20 bg-black/40 backdrop-blur-xl sticky top-0">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Logo */}
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 via-red-500 to-amber-600 p-0.5 shadow-lg shadow-orange-500/30">
                  <div className="w-full h-full rounded-2xl bg-black/80 flex items-center justify-center">
                    <ChefHat className="h-7 w-7 text-orange-400" />
                  </div>
                </div>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-green-500 border-2 border-zinc-900 flex items-center justify-center">
                  <Flame className="h-3 w-3 text-white" />
                </div>
              </div>
              
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-400 via-red-400 to-amber-400 bg-clip-text text-transparent">
                  Painel Administrativo
                </h1>
                <div className="flex items-center gap-3 text-sm text-zinc-400">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {currentTime.toLocaleTimeString('pt-BR')}
                  </span>
                  <span className="w-1 h-1 rounded-full bg-zinc-600" />
                  <span>{currentTime.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
                </div>
              </div>
            </div>
            
            <Button 
              variant="outline" 
              onClick={handleSignOut}
              className="border-orange-500/30 bg-orange-500/10 text-orange-300 hover:bg-orange-500/20 hover:text-orange-200 hover:border-orange-500/50"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      <main className="relative z-10 container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          {/* Pedidos Hoje */}
          <Card className="bg-gradient-to-br from-orange-500/20 to-orange-600/10 border-orange-500/30 overflow-hidden group hover:border-orange-500/50 transition-all duration-300">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-orange-300/80 font-medium">Pedidos Hoje</p>
                  <p className="text-3xl font-bold text-white mt-1">{stats.ordersToday}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <ShoppingBag className="h-6 w-6 text-orange-400" />
                </div>
              </div>
              <div className="mt-3 flex items-center gap-1 text-xs text-orange-300/60">
                <Package className="h-3.5 w-3.5" />
                <span>pedidos ativos</span>
              </div>
            </CardContent>
          </Card>
          
          {/* Faturamento Hoje */}
          <Card className="bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border-emerald-500/30 overflow-hidden group hover:border-emerald-500/50 transition-all duration-300">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-emerald-300/80 font-medium">Faturamento Hoje</p>
                  <p className="text-3xl font-bold text-white mt-1">
                    R$ {stats.revenueToday.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <DollarSign className="h-6 w-6 text-emerald-400" />
                </div>
              </div>
              <div className="mt-3 flex items-center gap-1 text-xs text-emerald-300/60">
                <TrendingUp className="h-3.5 w-3.5" />
                <span>receita do dia</span>
              </div>
            </CardContent>
          </Card>
          
          {/* Total Pedidos */}
          <Card className="bg-gradient-to-br from-violet-500/20 to-violet-600/10 border-violet-500/30 overflow-hidden group hover:border-violet-500/50 transition-all duration-300">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-violet-300/80 font-medium">Total de Pedidos</p>
                  <p className="text-3xl font-bold text-white mt-1">{stats.totalOrders}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-violet-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Package className="h-6 w-6 text-violet-400" />
                </div>
              </div>
              <div className="mt-3 flex items-center gap-1 text-xs text-violet-300/60">
                <Clock className="h-3.5 w-3.5" />
                <span>histórico completo</span>
              </div>
            </CardContent>
          </Card>
          
          {/* Faturamento Total */}
          <Card className="bg-gradient-to-br from-amber-500/20 to-amber-600/10 border-amber-500/30 overflow-hidden group hover:border-amber-500/50 transition-all duration-300">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-amber-300/80 font-medium">Faturamento Total</p>
                  <p className="text-3xl font-bold text-white mt-1">
                    R$ {stats.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <TrendingUp className="h-6 w-6 text-amber-400" />
                </div>
              </div>
              <div className="mt-3 flex items-center gap-1 text-xs text-amber-300/60">
                <DollarSign className="h-3.5 w-3.5" />
                <span>receita acumulada</span>
              </div>
            </CardContent>
          </Card>
          
          {/* Clientes */}
          <Card className="bg-gradient-to-br from-rose-500/20 to-rose-600/10 border-rose-500/30 overflow-hidden group hover:border-rose-500/50 transition-all duration-300">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-rose-300/80 font-medium">Clientes</p>
                  <p className="text-3xl font-bold text-white mt-1">{stats.totalCustomers}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-rose-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Users className="h-6 w-6 text-rose-400" />
                </div>
              </div>
              <div className="mt-3 flex items-center gap-1 text-xs text-rose-300/60">
                <Users className="h-3.5 w-3.5" />
                <span>cadastrados</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="stats" className="space-y-6">
          <TabsList className="bg-black/40 border border-orange-500/20 p-1.5 h-auto flex-wrap">
            <TabsTrigger 
              value="stats" 
              className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-orange-500/30 px-5 py-2.5 rounded-lg transition-all"
            >
              <BarChart3 className="h-4 w-4" />
              <span>Dashboard</span>
            </TabsTrigger>
            <TabsTrigger 
              value="orders" 
              className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-orange-500/30 px-5 py-2.5 rounded-lg transition-all"
            >
              <ShoppingBag className="h-4 w-4" />
              <span>Pedidos</span>
            </TabsTrigger>
            <TabsTrigger 
              value="products" 
              className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-orange-500/30 px-5 py-2.5 rounded-lg transition-all"
            >
              <Pizza className="h-4 w-4" />
              <span>Cardápio</span>
            </TabsTrigger>
            <TabsTrigger 
              value="customers" 
              className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-orange-500/30 px-5 py-2.5 rounded-lg transition-all"
            >
              <Users className="h-4 w-4" />
              <span>Clientes</span>
            </TabsTrigger>
            <TabsTrigger 
              value="revenue" 
              className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-orange-500/30 px-5 py-2.5 rounded-lg transition-all"
            >
              <TrendingUp className="h-4 w-4" />
              <span>Faturamento</span>
            </TabsTrigger>
            <TabsTrigger 
              value="settings" 
              className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-orange-500/30 px-5 py-2.5 rounded-lg transition-all"
            >
              <Settings className="h-4 w-4" />
              <span>Configurações</span>
            </TabsTrigger>
          </TabsList>

          <div className="bg-black/30 border border-orange-500/20 rounded-2xl backdrop-blur-sm p-6">
            <TabsContent value="stats" className="mt-0">
              <AdminStats />
            </TabsContent>

            <TabsContent value="orders" className="mt-0">
              <AdminOrders />
            </TabsContent>

            <TabsContent value="products" className="mt-0">
              <AdminProducts />
            </TabsContent>

            <TabsContent value="customers" className="mt-0">
              <AdminCustomers />
            </TabsContent>

            <TabsContent value="revenue" className="mt-0">
              <AdminRevenue />
            </TabsContent>

            <TabsContent value="settings" className="mt-0">
              <AdminSettings />
            </TabsContent>
          </div>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminDashboard;