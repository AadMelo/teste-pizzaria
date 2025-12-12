import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format, subDays, startOfDay, endOfDay, eachDayOfInterval, startOfMonth, endOfMonth, eachHourOfInterval, startOfHour, endOfHour } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Loader2, TrendingUp, TrendingDown, DollarSign, ShoppingBag, Pizza } from 'lucide-react';
import { toast } from 'sonner';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend } from 'recharts';

interface Order {
  id: string;
  total: number;
  subtotal: number;
  status: string;
  created_at: string;
  items: any[];
}

interface DailyData {
  date: string;
  revenue: number;
  orders: number;
}

interface ProductSales {
  name: string;
  quantity: number;
  revenue: number;
}

const COLORS = ['#f97316', '#fb923c', '#fdba74', '#fed7aa', '#ffedd5', '#fff7ed'];

export const AdminRevenue = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('7');
  const [dailyData, setDailyData] = useState<DailyData[]>([]);
  const [hourlyData, setHourlyData] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<ProductSales[]>([]);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    averageTicket: 0,
    growthRate: 0
  });

  useEffect(() => {
    fetchOrders();

    // Realtime subscription
    const channel = supabase
      .channel('admin-revenue-realtime')
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
  }, [period]);

  const fetchOrders = async () => {
    try {
      const daysAgo = parseInt(period);
      const startDate = startOfDay(subDays(new Date(), daysAgo));

      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: true });

      if (error) throw error;
      
      const ordersWithParsedItems = data?.map(order => ({
        ...order,
        items: typeof order.items === 'string' ? JSON.parse(order.items) : order.items
      })) || [];
      
      setOrders(ordersWithParsedItems);
      processData(ordersWithParsedItems, daysAgo);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Erro ao carregar dados de faturamento');
    } finally {
      setLoading(false);
    }
  };

  const processData = (orders: Order[], daysAgo: number) => {
    // Filter only completed orders for revenue calculation
    const completedOrders = orders.filter(o => 
      !['cancelled', 'pending_payment'].includes(o.status)
    );

    // Calculate stats
    const totalRevenue = completedOrders.reduce((sum, o) => sum + Number(o.total), 0);
    const totalOrders = completedOrders.length;
    const averageTicket = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Calculate growth rate (compare to previous period)
    const halfPeriod = Math.floor(daysAgo / 2);
    const midDate = subDays(new Date(), halfPeriod);
    const recentOrders = completedOrders.filter(o => new Date(o.created_at) >= midDate);
    const olderOrders = completedOrders.filter(o => new Date(o.created_at) < midDate);
    const recentRevenue = recentOrders.reduce((sum, o) => sum + Number(o.total), 0);
    const olderRevenue = olderOrders.reduce((sum, o) => sum + Number(o.total), 0);
    const growthRate = olderRevenue > 0 ? ((recentRevenue - olderRevenue) / olderRevenue) * 100 : 0;

    setStats({ totalRevenue, totalOrders, averageTicket, growthRate });

    // Process daily data
    const startDate = startOfDay(subDays(new Date(), daysAgo));
    const endDate = endOfDay(new Date());
    const days = eachDayOfInterval({ start: startDate, end: endDate });

    const daily = days.map(day => {
      const dayOrders = completedOrders.filter(o => {
        const orderDate = new Date(o.created_at);
        return orderDate >= startOfDay(day) && orderDate <= endOfDay(day);
      });

      return {
        date: format(day, 'dd/MM', { locale: ptBR }),
        revenue: dayOrders.reduce((sum, o) => sum + Number(o.total), 0),
        orders: dayOrders.length
      };
    });

    setDailyData(daily);

    // Process hourly data for today
    const today = new Date();
    const hours = eachHourOfInterval({
      start: startOfDay(today),
      end: endOfHour(today)
    });

    const hourly = hours.map(hour => {
      const hourOrders = completedOrders.filter(o => {
        const orderDate = new Date(o.created_at);
        return orderDate >= startOfHour(hour) && orderDate <= endOfHour(hour);
      });

      return {
        hour: format(hour, 'HH:mm', { locale: ptBR }),
        orders: hourOrders.length,
        revenue: hourOrders.reduce((sum, o) => sum + Number(o.total), 0)
      };
    });

    setHourlyData(hourly);

    // Process top products
    const productMap = new Map<string, { quantity: number; revenue: number }>();
    
    completedOrders.forEach(order => {
      if (Array.isArray(order.items)) {
        order.items.forEach((item: any) => {
          const existing = productMap.get(item.name) || { quantity: 0, revenue: 0 };
          productMap.set(item.name, {
            quantity: existing.quantity + (item.quantity || 1),
            revenue: existing.revenue + ((item.price || 0) * (item.quantity || 1))
          });
        });
      }
    });

    const products: ProductSales[] = Array.from(productMap.entries())
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 6);

    setTopProducts(products);
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
      {/* Period selector */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-orange-400" />
            Dashboard de Faturamento
          </h2>
          <p className="text-zinc-400 text-sm mt-1">Acompanhe as métricas de vendas em tempo real</p>
        </div>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-[180px] bg-black/40 border-zinc-700 text-white">
            <SelectValue placeholder="Selecionar período" />
          </SelectTrigger>
          <SelectContent className="bg-zinc-900 border-zinc-700">
            <SelectItem value="7">Últimos 7 dias</SelectItem>
            <SelectItem value="14">Últimos 14 dias</SelectItem>
            <SelectItem value="30">Últimos 30 dias</SelectItem>
            <SelectItem value="60">Últimos 60 dias</SelectItem>
            <SelectItem value="90">Últimos 90 dias</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border-emerald-500/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-emerald-300/80 flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Faturamento Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              R$ {stats.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-orange-500/20 to-orange-600/10 border-orange-500/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-orange-300/80 flex items-center gap-2">
              <ShoppingBag className="h-4 w-4" />
              Total de Pedidos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.totalOrders}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-violet-500/20 to-violet-600/10 border-violet-500/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-violet-300/80 flex items-center gap-2">
              <Pizza className="h-4 w-4" />
              Ticket Médio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              R$ {stats.averageTicket.toFixed(2)}
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-cyan-500/20 to-cyan-600/10 border-cyan-500/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-cyan-300/80 flex items-center gap-2">
              {stats.growthRate >= 0 ? (
                <TrendingUp className="h-4 w-4" />
              ) : (
                <TrendingDown className="h-4 w-4" />
              )}
              Crescimento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${stats.growthRate >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {stats.growthRate >= 0 ? '+' : ''}{stats.growthRate.toFixed(1)}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue chart */}
        <Card className="bg-black/40 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white">Faturamento por Dia</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dailyData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f97316" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="date" stroke="#666" />
                  <YAxis stroke="#666" />
                  <Tooltip 
                    formatter={(value: number) => [`R$ ${value.toFixed(2)}`, 'Faturamento']}
                    contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '8px' }}
                    labelStyle={{ color: '#fff' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#f97316" 
                    fillOpacity={1} 
                    fill="url(#colorRevenue)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Orders chart */}
        <Card className="bg-black/40 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white">Pedidos por Dia</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="date" stroke="#666" />
                  <YAxis stroke="#666" />
                  <Tooltip 
                    formatter={(value: number) => [value, 'Pedidos']}
                    contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '8px' }}
                    labelStyle={{ color: '#fff' }}
                  />
                  <Bar dataKey="orders" fill="#f97316" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Hourly chart */}
        <Card className="bg-black/40 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white">Pedidos por Hora (Hoje)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={hourlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="hour" stroke="#666" />
                  <YAxis stroke="#666" />
                  <Tooltip 
                    formatter={(value: number, name: string) => [
                      name === 'orders' ? value : `R$ ${value.toFixed(2)}`,
                      name === 'orders' ? 'Pedidos' : 'Faturamento'
                    ]}
                    contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '8px' }}
                    labelStyle={{ color: '#fff' }}
                  />
                  <Bar dataKey="orders" fill="#fb923c" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Top products */}
        <Card className="bg-black/40 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white">Produtos Mais Vendidos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {topProducts.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={topProducts}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="revenue"
                      label={({ name, percent }) => `${name.slice(0, 15)}${name.length > 15 ? '...' : ''} (${(percent * 100).toFixed(0)}%)`}
                    >
                      {topProducts.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number, name: string, entry: any) => [
                        `R$ ${value.toFixed(2)} (${entry.payload.quantity} un)`,
                        entry.payload.name
                      ]}
                      contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '8px' }}
                    />
                    <Legend wrapperStyle={{ color: '#999' }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-zinc-500">
                  <Pizza className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Sem dados de produtos</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
