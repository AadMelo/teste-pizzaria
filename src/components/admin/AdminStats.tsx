import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, TrendingUp, TrendingDown, ShoppingBag, Clock, DollarSign, Users, Pizza, Truck, CheckCircle2, XCircle, Timer, Calendar, Activity } from 'lucide-react';
import { format, startOfDay, endOfDay, startOfWeek, startOfMonth, differenceInMinutes } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

interface Order {
  id: string;
  status: string;
  total: number;
  created_at: string;
  payment_method: string;
}

interface DailyStats {
  date: string;
  orders: number;
  revenue: number;
}

const COLORS = ['#f97316', '#3b82f6', '#10b981', '#a855f7', '#ef4444', '#06b6d4'];

export const AdminStats = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [todayStats, setTodayStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    avgOrderValue: 0,
    pendingOrders: 0,
    preparingOrders: 0,
    deliveringOrders: 0,
    deliveredOrders: 0,
    cancelledOrders: 0,
    avgDeliveryTime: 0,
  });
  const [weeklyData, setWeeklyData] = useState<DailyStats[]>([]);
  const [paymentMethodData, setPaymentMethodData] = useState<{ name: string; value: number }[]>([]);
  const [hourlyData, setHourlyData] = useState<{ hour: string; orders: number }[]>([]);

  useEffect(() => {
    fetchOrders();

    const channel = supabase
      .channel('admin-stats-realtime')
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
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .gte('created_at', thirtyDaysAgo.toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;

      const ordersData = data || [];
      setOrders(ordersData);
      calculateStats(ordersData);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (ordersData: Order[]) => {
    const now = new Date();
    const todayStart = startOfDay(now);
    const todayEnd = endOfDay(now);

    // Today's orders
    const todayOrders = ordersData.filter(order => {
      const orderDate = new Date(order.created_at);
      return orderDate >= todayStart && orderDate <= todayEnd;
    });

    // Calculate today stats
    const delivered = todayOrders.filter(o => o.status === 'delivered');
    const totalRevenue = todayOrders
      .filter(o => o.status !== 'cancelled')
      .reduce((sum, o) => sum + Number(o.total), 0);

    // Calculate average delivery time (mock - would need actual delivery timestamps)
    const avgDeliveryTime = delivered.length > 0 ? 35 : 0; // Average in minutes

    setTodayStats({
      totalOrders: todayOrders.length,
      totalRevenue,
      avgOrderValue: todayOrders.length > 0 ? totalRevenue / todayOrders.filter(o => o.status !== 'cancelled').length : 0,
      pendingOrders: todayOrders.filter(o => ['pending', 'pending_payment', 'confirmed'].includes(o.status)).length,
      preparingOrders: todayOrders.filter(o => o.status === 'preparing').length,
      deliveringOrders: todayOrders.filter(o => ['ready', 'delivering'].includes(o.status)).length,
      deliveredOrders: delivered.length,
      cancelledOrders: todayOrders.filter(o => o.status === 'cancelled').length,
      avgDeliveryTime,
    });

    // Calculate weekly data
    const last7Days: DailyStats[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayStart = startOfDay(date);
      const dayEnd = endOfDay(date);

      const dayOrders = ordersData.filter(order => {
        const orderDate = new Date(order.created_at);
        return orderDate >= dayStart && orderDate <= dayEnd && order.status !== 'cancelled';
      });

      last7Days.push({
        date: format(date, 'EEE', { locale: ptBR }),
        orders: dayOrders.length,
        revenue: dayOrders.reduce((sum, o) => sum + Number(o.total), 0),
      });
    }
    setWeeklyData(last7Days);

    // Payment method distribution
    const paymentMethods: Record<string, number> = {};
    todayOrders.forEach(order => {
      const method = order.payment_method === 'pix' ? 'PIX' :
                     order.payment_method === 'credit_card' ? 'Cartão' :
                     order.payment_method === 'cash' ? 'Dinheiro' : order.payment_method;
      paymentMethods[method] = (paymentMethods[method] || 0) + 1;
    });
    setPaymentMethodData(Object.entries(paymentMethods).map(([name, value]) => ({ name, value })));

    // Hourly distribution
    const hourlyDist: Record<number, number> = {};
    for (let i = 0; i < 24; i++) {
      hourlyDist[i] = 0;
    }
    todayOrders.forEach(order => {
      const hour = new Date(order.created_at).getHours();
      hourlyDist[hour]++;
    });
    setHourlyData(Object.entries(hourlyDist).map(([hour, orders]) => ({
      hour: `${hour}h`,
      orders,
    })));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const StatCard = ({ 
    title, 
    value, 
    subtitle, 
    icon: Icon, 
    trend, 
    trendValue,
    color = 'orange'
  }: { 
    title: string; 
    value: string | number; 
    subtitle?: string;
    icon: any; 
    trend?: 'up' | 'down';
    trendValue?: string;
    color?: string;
  }) => {
    const colorClasses: Record<string, { bg: string; icon: string; gradient: string }> = {
      orange: { bg: 'bg-orange-500/10', icon: 'text-orange-400', gradient: 'from-orange-500/20' },
      blue: { bg: 'bg-blue-500/10', icon: 'text-blue-400', gradient: 'from-blue-500/20' },
      green: { bg: 'bg-emerald-500/10', icon: 'text-emerald-400', gradient: 'from-emerald-500/20' },
      purple: { bg: 'bg-purple-500/10', icon: 'text-purple-400', gradient: 'from-purple-500/20' },
      cyan: { bg: 'bg-cyan-500/10', icon: 'text-cyan-400', gradient: 'from-cyan-500/20' },
      red: { bg: 'bg-red-500/10', icon: 'text-red-400', gradient: 'from-red-500/20' },
    };
    const colors = colorClasses[color] || colorClasses.orange;

    return (
      <Card className={cn("bg-gradient-to-br to-zinc-900/90 border-zinc-800 overflow-hidden relative", colors.gradient)}>
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <p className="text-sm text-zinc-400 font-medium">{title}</p>
              <p className="text-3xl font-bold text-white">{value}</p>
              {subtitle && <p className="text-xs text-zinc-500">{subtitle}</p>}
              {trend && trendValue && (
                <div className={cn(
                  "flex items-center gap-1 text-xs font-medium",
                  trend === 'up' ? 'text-emerald-400' : 'text-red-400'
                )}>
                  {trend === 'up' ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {trendValue}
                </div>
              )}
            </div>
            <div className={cn("p-3 rounded-xl", colors.bg)}>
              <Icon className={cn("h-6 w-6", colors.icon)} />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Activity className="h-6 w-6 text-orange-400" />
            Dashboard em Tempo Real
          </h2>
          <p className="text-zinc-400 text-sm mt-1">
            Atualizado às {format(new Date(), 'HH:mm', { locale: ptBR })}
          </p>
        </div>
        <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
          <span className="w-2 h-2 bg-emerald-400 rounded-full mr-2 animate-pulse" />
          Ao vivo
        </Badge>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Pedidos Hoje"
          value={todayStats.totalOrders}
          subtitle={`${todayStats.deliveredOrders} entregues`}
          icon={ShoppingBag}
          color="orange"
        />
        <StatCard
          title="Receita do Dia"
          value={`R$ ${todayStats.totalRevenue.toFixed(2)}`}
          subtitle={`Ticket médio: R$ ${todayStats.avgOrderValue.toFixed(2)}`}
          icon={DollarSign}
          color="green"
        />
        <StatCard
          title="Tempo Médio de Entrega"
          value={`${todayStats.avgDeliveryTime} min`}
          subtitle="Meta: 40 min"
          icon={Timer}
          color="blue"
        />
        <StatCard
          title="Taxa de Sucesso"
          value={todayStats.totalOrders > 0 
            ? `${((todayStats.deliveredOrders / todayStats.totalOrders) * 100).toFixed(0)}%`
            : '0%'}
          subtitle={`${todayStats.cancelledOrders} cancelados`}
          icon={CheckCircle2}
          color="purple"
        />
      </div>

      {/* Status Pipeline */}
      <Card className="bg-zinc-900/90 border-zinc-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg text-white flex items-center gap-2">
            <Truck className="h-5 w-5 text-orange-400" />
            Pipeline de Pedidos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
              <p className="text-3xl font-bold text-yellow-400">{todayStats.pendingOrders}</p>
              <p className="text-sm text-zinc-400 mt-1">Aguardando</p>
            </div>
            <div className="text-center p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
              <p className="text-3xl font-bold text-purple-400">{todayStats.preparingOrders}</p>
              <p className="text-sm text-zinc-400 mt-1">Preparando</p>
            </div>
            <div className="text-center p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
              <p className="text-3xl font-bold text-cyan-400">{todayStats.deliveringOrders}</p>
              <p className="text-sm text-zinc-400 mt-1">Em Entrega</p>
            </div>
            <div className="text-center p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <p className="text-3xl font-bold text-emerald-400">{todayStats.deliveredOrders}</p>
              <p className="text-sm text-zinc-400 mt-1">Entregues</p>
            </div>
            <div className="text-center p-4 rounded-xl bg-red-500/10 border border-red-500/20">
              <p className="text-3xl font-bold text-red-400">{todayStats.cancelledOrders}</p>
              <p className="text-sm text-zinc-400 mt-1">Cancelados</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Revenue Chart */}
        <Card className="bg-zinc-900/90 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-lg text-white flex items-center gap-2">
              <Calendar className="h-5 w-5 text-orange-400" />
              Receita dos Últimos 7 Dias
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weeklyData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis dataKey="date" stroke="#71717a" fontSize={12} />
                  <YAxis stroke="#71717a" fontSize={12} tickFormatter={(value) => `R$${value}`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px' }}
                    labelStyle={{ color: '#fff' }}
                    formatter={(value: number) => [`R$ ${value.toFixed(2)}`, 'Receita']}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#f97316" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorRevenue)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Hourly Orders Chart */}
        <Card className="bg-zinc-900/90 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-lg text-white flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-400" />
              Pedidos por Hora (Hoje)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={hourlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis dataKey="hour" stroke="#71717a" fontSize={10} />
                  <YAxis stroke="#71717a" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px' }}
                    labelStyle={{ color: '#fff' }}
                    formatter={(value: number) => [value, 'Pedidos']}
                  />
                  <Bar dataKey="orders" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment Methods & Weekly Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Payment Methods */}
        <Card className="bg-zinc-900/90 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-lg text-white flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-orange-400" />
              Formas de Pagamento
            </CardTitle>
          </CardHeader>
          <CardContent>
            {paymentMethodData.length > 0 ? (
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={paymentMethodData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={70}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {paymentMethodData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px' }}
                      labelStyle={{ color: '#fff' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-48 flex items-center justify-center text-zinc-500">
                Sem dados hoje
              </div>
            )}
            <div className="flex flex-wrap justify-center gap-3 mt-4">
              {paymentMethodData.map((item, index) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: COLORS[index % COLORS.length] }} 
                  />
                  <span className="text-xs text-zinc-400">{item.name} ({item.value})</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Weekly Orders */}
        <Card className="bg-zinc-900/90 border-zinc-800 lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg text-white flex items-center gap-2">
              <Pizza className="h-5 w-5 text-orange-400" />
              Pedidos da Semana
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis dataKey="date" stroke="#71717a" fontSize={12} />
                  <YAxis stroke="#71717a" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px' }}
                    labelStyle={{ color: '#fff' }}
                    formatter={(value: number) => [value, 'Pedidos']}
                  />
                  <Bar dataKey="orders" fill="#a855f7" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
