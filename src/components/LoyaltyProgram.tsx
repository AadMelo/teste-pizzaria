import { Gift, Star, Coffee, Pizza, Cake, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/hooks/useAuth';
import { useLoyalty } from '@/hooks/useLoyalty';
import { toast } from 'sonner';

interface LoyaltyReward {
  id: string;
  name: string;
  description: string;
  pointsCost: number;
  icon: React.ReactNode;
}

const rewards: LoyaltyReward[] = [
  {
    id: '1',
    name: 'Refrigerante Grátis',
    description: 'Ganhe um refrigerante 350ml',
    pointsCost: 50,
    icon: <Coffee className="h-6 w-6" />,
  },
  {
    id: '2',
    name: 'Sobremesa Grátis',
    description: 'Escolha uma sobremesa do cardápio',
    pointsCost: 100,
    icon: <Cake className="h-6 w-6" />,
  },
  {
    id: '3',
    name: 'Pizza Broto Grátis',
    description: 'Uma pizza broto de qualquer sabor',
    pointsCost: 200,
    icon: <Pizza className="h-6 w-6" />,
  },
  {
    id: '4',
    name: 'Entrega Grátis',
    description: 'Frete grátis no próximo pedido',
    pointsCost: 30,
    icon: <Truck className="h-6 w-6" />,
  },
];

export default function LoyaltyProgram() {
  const { profile } = useAuth();
  const { points, transactions, loading, redeemPoints } = useLoyalty();
  
  const currentPoints = points;
  const nextReward = rewards.find(r => r.pointsCost > currentPoints) || rewards[rewards.length - 1];
  const progress = Math.min((currentPoints / nextReward.pointsCost) * 100, 100);

  const handleRedeem = async (reward: LoyaltyReward) => {
    const { error } = await redeemPoints(reward.pointsCost, `Resgate: ${reward.name}`);
    if (error) {
      toast.error('Erro ao resgatar recompensa');
    } else {
      toast.success(`${reward.name} resgatado com sucesso! 🎉`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Points Balance */}
      <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Star className="h-6 w-6 fill-yellow-300 text-yellow-300" />
            <span className="font-semibold">Programa Fidelidade</span>
          </div>
          <Gift className="h-8 w-8 opacity-50" />
        </div>
        
        <div className="text-center mb-4">
          <p className="text-sm opacity-80">Seus pontos</p>
          <p className="text-5xl font-bold">{currentPoints}</p>
          {profile?.name && (
            <p className="text-sm opacity-80 mt-1">Olá, {profile.name}!</p>
          )}
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Próxima recompensa</span>
            <span>{Math.max(nextReward.pointsCost - currentPoints, 0)} pts restantes</span>
          </div>
          <Progress value={progress} className="h-2 bg-white/30" />
          <p className="text-xs text-center opacity-80">
            🎁 {nextReward.name}
          </p>
        </div>
      </div>

      {/* How it works */}
      <div className="bg-card rounded-xl p-4 border border-border">
        <h3 className="font-bold mb-3 flex items-center gap-2">
          <Star className="h-4 w-4 text-primary" />
          Como funciona
        </h3>
        <div className="space-y-2 text-sm text-muted-foreground">
          <p>✓ A cada R$ 1 gasto, você ganha 1 ponto</p>
          <p>✓ Acumule pontos e troque por recompensas</p>
          <p>✓ Pontos nunca expiram</p>
          <p>✓ Ganhe 50 pontos de boas-vindas no cadastro!</p>
        </div>
      </div>

      {/* Available Rewards */}
      <div>
        <h3 className="font-bold mb-3 flex items-center gap-2">
          <Gift className="h-4 w-4 text-primary" />
          Recompensas Disponíveis
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {rewards.map((reward) => {
            const canRedeem = currentPoints >= reward.pointsCost;
            return (
              <div
                key={reward.id}
                className={`p-4 rounded-xl border transition-all ${
                  canRedeem 
                    ? 'border-primary bg-primary/5 hover:shadow-md' 
                    : 'border-border bg-muted/30 opacity-60'
                }`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                  canRedeem ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                }`}>
                  {reward.icon}
                </div>
                <h4 className="font-semibold text-sm">{reward.name}</h4>
                <p className="text-xs text-muted-foreground mb-2">{reward.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-primary">{reward.pointsCost} pts</span>
                  {canRedeem && (
                    <Button size="sm" className="h-7 text-xs" onClick={() => handleRedeem(reward)}>
                      Resgatar
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Points History */}
      <div className="bg-muted/50 rounded-xl p-4">
        <h3 className="font-bold mb-3 text-sm">Histórico Recente</h3>
        {loading ? (
          <p className="text-sm text-muted-foreground">Carregando...</p>
        ) : transactions.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhuma transação ainda</p>
        ) : (
          <div className="space-y-2 text-sm">
            {transactions.slice(0, 5).map((transaction) => (
              <div key={transaction.id} className="flex justify-between">
                <span className="text-muted-foreground">{transaction.description}</span>
                <span className={transaction.points > 0 ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                  {transaction.points > 0 ? '+' : ''}{transaction.points} pts
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
