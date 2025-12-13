import { useState } from 'react';
import { ArrowLeft, MapPin, CreditCard, Banknote, QrCode, Loader2, Gift, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';
import { useCart, CartPizza, CartProduct } from '@/contexts/CartContext';
import { useAuth } from '@/hooks/useAuth';
import { useLoyalty } from '@/hooks/useLoyalty';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import PixPaymentModal from '@/components/PixPaymentModal';

interface CheckoutProps {
  onBack: () => void;
}

type PaymentMethod = 'pix' | 'card' | 'cash';

// 10 points = R$1 discount
const POINTS_TO_CURRENCY_RATE = 0.1;

export default function Checkout({ onBack }: CheckoutProps) {
  const { items, total, subtotal, deliveryFee, clearCart } = useCart();
  const { user } = useAuth();
  const { points, addPoints, redeemPoints } = useLoyalty();
  
  const [address, setAddress] = useState({
    cep: '',
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
  });
  
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix');
  const [changeFor, setChangeFor] = useState('');
  const [observations, setObservations] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pointsToRedeem, setPointsToRedeem] = useState(0);
  const [showPixModal, setShowPixModal] = useState(false);

  // Calculate max points that can be redeemed (max 50% of subtotal)
  const maxDiscount = subtotal * 0.5;
  const maxPointsToRedeem = Math.min(points, Math.floor(maxDiscount / POINTS_TO_CURRENCY_RATE));
  
  // Calculate discount from points
  const pointsDiscount = pointsToRedeem * POINTS_TO_CURRENCY_RATE;
  
  // Calculate final total with points discount
  const finalTotal = total - pointsDiscount;

  const formatOrderMessage = () => {
    let message = '🍕 *NOVO PEDIDO - EXPRESSO DELIVERY*\n\n';
    
    message += '*📋 ITENS DO PEDIDO:*\n';
    items.forEach((item, index) => {
      if (item.type === 'pizza') {
        const pizza = item as CartPizza;
        message += `${index + 1}. 🍕 Pizza ${pizza.size.name}\n`;
        message += `   Sabores: ${pizza.flavors.map((f) => f.name).join(' + ')}\n`;
        if (pizza.crust.price > 0) {
          message += `   Borda: ${pizza.crust.name}\n`;
        }
        if (pizza.extras.length > 0) {
          message += `   Adicionais: ${pizza.extras.map((e) => e.name).join(', ')}\n`;
        }
        message += `   Qtd: ${pizza.quantity} - R$ ${(pizza.totalPrice * pizza.quantity).toFixed(2).replace('.', ',')}\n\n`;
      } else {
        const product = item as CartProduct;
        const emoji = product.product.category === 'bebida' ? '🥤' : product.product.category === 'sobremesa' ? '🍰' : '🍟';
        message += `${index + 1}. ${emoji} ${product.product.name}`;
        if (product.product.size) message += ` (${product.product.size})`;
        message += `\n   Qtd: ${product.quantity} - R$ ${(product.totalPrice * product.quantity).toFixed(2).replace('.', ',')}\n\n`;
      }
    });
    
    message += `*💰 TOTAL: R$ ${finalTotal.toFixed(2).replace('.', ',')}*\n`;
    if (pointsToRedeem > 0) {
      message += `(Desconto de ${pointsToRedeem} pontos: -R$ ${pointsDiscount.toFixed(2).replace('.', ',')})\n`;
    }
    message += '\n';
    
    message += '*📍 ENDEREÇO DE ENTREGA:*\n';
    message += `${address.street}, ${address.number}\n`;
    if (address.complement) message += `${address.complement}\n`;
    message += `${address.neighborhood}\n`;
    message += `CEP: ${address.cep}\n\n`;
    
    message += '*💳 PAGAMENTO:*\n';
    if (paymentMethod === 'pix') {
      message += 'Pix\n';
    } else if (paymentMethod === 'card') {
      message += 'Cartão na entrega\n';
    } else {
      message += `Dinheiro - Troco para R$ ${changeFor}\n`;
    }
    
    if (observations) {
      message += `\n*📝 OBSERVAÇÕES:*\n${observations}`;
    }
    
    return encodeURIComponent(message);
  };

  const validateForm = () => {
    if (!address.street || !address.number || !address.neighborhood || !address.cep) {
      toast.error('Preencha todos os campos do endereço');
      return false;
    }
    
    if (paymentMethod === 'cash' && !changeFor) {
      toast.error('Informe o valor para troco');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    // If PIX is selected, show the PIX modal
    if (paymentMethod === 'pix') {
      setShowPixModal(true);
      return;
    }
    
    await processOrder();
  };

  const handlePixConfirm = async () => {
    setShowPixModal(false);
    await processOrder(true); // true = paid online
  };

  const handlePixExpire = () => {
    setShowPixModal(false);
    toast.error('Pedido cancelado por falta de pagamento', {
      description: 'O tempo para pagamento expirou.',
    });
  };

  const processOrder = async (paidOnline = false) => {
    setIsSubmitting(true);

    try {
      // Calculate points earned (1 point per R$10 spent)
      const pointsEarned = Math.floor(total / 10);
      
      // Format items for database storage
      const orderItems = items.map((item) => {
        if (item.type === 'pizza') {
          const pizza = item as CartPizza;
          return {
            type: 'pizza',
            size: pizza.size.name,
            flavors: pizza.flavors.map((f) => f.name),
            flavorImages: pizza.flavors.map((f) => f.image),
            crust: pizza.crust.name,
            extras: pizza.extras.map((e) => e.name),
            quantity: pizza.quantity,
            price: pizza.totalPrice * pizza.quantity,
          };
        } else {
          const product = item as CartProduct;
          return {
            type: 'product',
            name: product.product.name,
            category: product.product.category,
            image: product.product.image,
            size: product.product.size,
            quantity: product.quantity,
            price: product.totalPrice * product.quantity,
          };
        }
      });

      const fullAddress = `${address.street}, ${address.number}${address.complement ? ` - ${address.complement}` : ''}, ${address.neighborhood}, CEP: ${address.cep}`;

      if (user) {
        // Save order to database
        const { data: orderData, error: orderError } = await supabase
          .from('orders')
          .insert({
            user_id: user.id,
            items: orderItems,
            subtotal,
            discount: pointsDiscount,
            delivery_fee: deliveryFee,
            total: finalTotal,
            address: fullAddress,
            payment_method: paymentMethod,
            points_earned: pointsEarned,
            status: paidOnline ? 'confirmed' : 'pending',
          })
          .select()
          .single();

        if (orderError) throw orderError;

        // Redeem points if any
        if (pointsToRedeem > 0) {
          await redeemPoints(pointsToRedeem, `Resgate no pedido #${orderData.id.slice(0, 8)}`);
        }

        // Add loyalty points using the hook
        if (pointsEarned > 0) {
          await addPoints(pointsEarned, `Pontos ganhos no pedido #${orderData.id.slice(0, 8)}`, orderData.id);
        }

        const netPoints = pointsEarned - pointsToRedeem;
        if (netPoints > 0) {
          toast.success(`Pedido salvo! Você ganhou ${pointsEarned} pontos de fidelidade!`);
        } else if (netPoints < 0) {
          toast.success(`Pedido salvo! Você usou ${pointsToRedeem} pontos e ganhou ${pointsEarned} novos pontos!`);
        } else {
          toast.success('Pedido salvo com sucesso!');
        }
      }

      // For online payments (PIX), don't redirect to WhatsApp
      if (paidOnline) {
        toast.success('Pagamento confirmado! Seu pedido está sendo preparado. 🍕');
      } else {
        // Send to WhatsApp for payment on delivery
        const message = formatOrderMessage();
        const phoneNumber = '5589994130455';
        const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;
        
        window.open(whatsappUrl, '_blank');
        
        if (!user) {
          toast.success('Pedido enviado! Faça login para acumular pontos de fidelidade.');
        }
      }
      
      clearCart();
    } catch (error) {
      console.error('Erro ao salvar pedido:', error);
      toast.error('Erro ao processar pedido. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h2 className="text-xl font-bold">Finalizar Pedido</h2>
      </div>

      <div className="flex-1 overflow-y-auto space-y-6">
        {/* Address */}
        <div className="space-y-4">
          <h3 className="font-semibold flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" />
            Endereço de Entrega
          </h3>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <Label htmlFor="cep">CEP</Label>
              <Input
                id="cep"
                placeholder="00000-000"
                value={address.cep}
                onChange={(e) => setAddress({ ...address, cep: e.target.value })}
              />
            </div>
            <div className="col-span-2">
              <Label htmlFor="street">Rua</Label>
              <Input
                id="street"
                placeholder="Nome da rua"
                value={address.street}
                onChange={(e) => setAddress({ ...address, street: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="number">Número</Label>
              <Input
                id="number"
                placeholder="Nº"
                value={address.number}
                onChange={(e) => setAddress({ ...address, number: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="complement">Complemento</Label>
              <Input
                id="complement"
                placeholder="Apto, bloco..."
                value={address.complement}
                onChange={(e) => setAddress({ ...address, complement: e.target.value })}
              />
            </div>
            <div className="col-span-2">
              <Label htmlFor="neighborhood">Bairro</Label>
              <Input
                id="neighborhood"
                placeholder="Bairro"
                value={address.neighborhood}
                onChange={(e) => setAddress({ ...address, neighborhood: e.target.value })}
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Payment */}
        <div className="space-y-4">
          <h3 className="font-semibold flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-primary" />
            Forma de Pagamento
          </h3>
          
          <RadioGroup
            value={paymentMethod}
            onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}
            className="space-y-4"
          >
            {/* Online Payment */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                💳 Pagamento Online
              </p>
              <div className={`flex items-center space-x-3 p-3 rounded-xl border-2 transition-all ${
                paymentMethod === 'pix' 
                  ? 'border-primary bg-primary/5' 
                  : 'border-border hover:border-primary/50'
              }`}>
                <RadioGroupItem value="pix" id="pix" />
                <Label htmlFor="pix" className="flex items-center gap-2 cursor-pointer flex-1">
                  <QrCode className="h-5 w-5 text-primary" />
                  <div className="flex-1">
                    <p className="font-medium">Pix</p>
                    <p className="text-xs text-muted-foreground">Pague agora pelo app • QR Code</p>
                  </div>
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                    Rápido
                  </span>
                </Label>
              </div>
            </div>
            
            {/* Payment on Delivery */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                🚚 Pagamento na Entrega
              </p>
              
              <div className={`flex items-center space-x-3 p-3 rounded-xl border-2 transition-all ${
                paymentMethod === 'card' 
                  ? 'border-primary bg-primary/5' 
                  : 'border-border hover:border-primary/50'
              }`}>
                <RadioGroupItem value="card" id="card" />
                <Label htmlFor="card" className="flex items-center gap-2 cursor-pointer flex-1">
                  <CreditCard className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Cartão</p>
                    <p className="text-xs text-muted-foreground">Débito ou crédito na entrega</p>
                  </div>
                </Label>
              </div>
              
              <div className={`flex items-center space-x-3 p-3 rounded-xl border-2 transition-all ${
                paymentMethod === 'cash' 
                  ? 'border-primary bg-primary/5' 
                  : 'border-border hover:border-primary/50'
              }`}>
                <RadioGroupItem value="cash" id="cash" />
                <Label htmlFor="cash" className="flex items-center gap-2 cursor-pointer flex-1">
                  <Banknote className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Dinheiro</p>
                    <p className="text-xs text-muted-foreground">Informe o troco abaixo</p>
                  </div>
                </Label>
              </div>
            </div>
          </RadioGroup>
          
          {paymentMethod === 'cash' && (
            <div>
              <Label htmlFor="change">Troco para</Label>
              <Input
                id="change"
                placeholder="R$ 100,00"
                value={changeFor}
                onChange={(e) => setChangeFor(e.target.value)}
              />
            </div>
          )}
        </div>

        <Separator />

        {/* Loyalty Points Redemption */}
        {user && points > 0 && (
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Gift className="h-4 w-4 text-primary" />
              Usar Pontos de Fidelidade
            </h3>
            
            <div className="p-4 rounded-xl bg-gradient-to-r from-primary/10 to-amber-500/10 border border-primary/20">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                  <span className="text-sm font-medium">Seus pontos: {points}</span>
                </div>
                <span className="text-xs text-muted-foreground">
                  10 pts = R$ 1,00
                </span>
              </div>
              
              {maxPointsToRedeem > 0 ? (
                <>
                  <div className="space-y-3">
                    <Slider
                      value={[pointsToRedeem]}
                      onValueChange={(value) => setPointsToRedeem(value[0])}
                      max={maxPointsToRedeem}
                      step={10}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm">
                      <span>Usar: <strong>{pointsToRedeem} pontos</strong></span>
                      <span className="text-green-600 font-medium">
                        -R$ {pointsDiscount.toFixed(2).replace('.', ',')}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Máximo de 50% do pedido pode ser pago com pontos
                  </p>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Você precisa de pelo menos 10 pontos para resgatar descontos.
                </p>
              )}
            </div>
          </div>
        )}

        <Separator />

        {/* Observations */}
        <div className="space-y-2">
          <Label htmlFor="obs">Observações do pedido</Label>
          <Textarea
            id="obs"
            placeholder="Alguma observação para o entregador?"
            value={observations}
            onChange={(e) => setObservations(e.target.value)}
            className="resize-none"
          />
        </div>
      </div>

      {/* Summary and Submit */}
      <div className="pt-4 mt-4 border-t space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Subtotal</span>
            <span>R$ {subtotal.toFixed(2).replace('.', ',')}</span>
          </div>
          {pointsDiscount > 0 && (
            <div className="flex justify-between text-sm text-green-600">
              <span>Desconto pontos ({pointsToRedeem} pts)</span>
              <span>-R$ {pointsDiscount.toFixed(2).replace('.', ',')}</span>
            </div>
          )}
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Taxa de entrega</span>
            <span>R$ {deliveryFee.toFixed(2).replace('.', ',')}</span>
          </div>
          <Separator />
          <div className="flex justify-between text-lg font-bold">
            <span>Total</span>
            <span className="text-primary">R$ {finalTotal.toFixed(2).replace('.', ',')}</span>
          </div>
        </div>
        
        <Button
          className={`w-full ${paymentMethod === 'pix' ? 'bg-primary hover:bg-primary/90' : 'bg-green-600 hover:bg-green-700'}`}
          size="lg"
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processando...
            </>
          ) : paymentMethod === 'pix' ? (
            <>
              <QrCode className="mr-2 h-4 w-4" />
              Pagar com PIX
            </>
          ) : (
            'Enviar Pedido via WhatsApp'
          )}
        </Button>
      </div>

      {/* PIX Payment Modal */}
      <PixPaymentModal
        open={showPixModal}
        onClose={() => setShowPixModal(false)}
        onConfirm={handlePixConfirm}
        onExpire={handlePixExpire}
        amount={finalTotal}
      />
    </div>
  );
}
