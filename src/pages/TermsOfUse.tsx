import { ArrowLeft, FileText, AlertCircle, ShoppingBag, CreditCard, Truck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function TermsOfUse() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <FileText className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-bold">Termos de Uso</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none">
          <p className="text-muted-foreground mb-8">
            Última atualização: Dezembro de 2024
          </p>

          <section className="mb-8">
            <h2 className="text-xl font-bold">1. Aceitação dos Termos</h2>
            <p className="text-muted-foreground">
              Ao utilizar os serviços da Expresso Delivery, você concorda com estes termos de uso. 
              Se não concordar, por favor não utilize nossos serviços.
            </p>
          </section>

          <section className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <ShoppingBag className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-bold m-0">2. Pedidos</h2>
            </div>
            <ul className="text-muted-foreground space-y-2">
              <li>O pedido mínimo é de R$ 25,00</li>
              <li>Os preços podem ser alterados sem aviso prévio</li>
              <li>A disponibilidade dos produtos está sujeita ao estoque</li>
              <li>Após confirmado, o pedido não pode ser cancelado se já estiver em preparo</li>
              <li>Imagens são ilustrativas e podem diferir do produto real</li>
            </ul>
          </section>

          <section className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Truck className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-bold m-0">3. Entrega</h2>
            </div>
            <ul className="text-muted-foreground space-y-2">
              <li>Área de entrega limitada a 5km do nosso estabelecimento</li>
              <li>Tempo estimado de entrega: 30-45 minutos (pode variar)</li>
              <li>Taxa de entrega calculada conforme a distância</li>
              <li>Frete grátis para pedidos acima de R$ 80,00</li>
              <li>É necessário que alguém esteja presente para receber o pedido</li>
            </ul>
          </section>

          <section className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <CreditCard className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-bold m-0">4. Pagamento</h2>
            </div>
            <ul className="text-muted-foreground space-y-2">
              <li>Aceitamos cartões de débito e crédito, dinheiro e PIX</li>
              <li>O pagamento online é processado de forma segura</li>
              <li>Para pagamento em dinheiro, informe o valor para troco</li>
              <li>Cupons de desconto não são cumulativos</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold">5. Programa de Fidelidade</h2>
            <ul className="text-muted-foreground space-y-2">
              <li>A cada R$ 1,00 gasto, você ganha 1 ponto</li>
              <li>Os pontos podem ser trocados por descontos e brindes</li>
              <li>Pontos expiram após 12 meses de inatividade</li>
              <li>O programa pode ser alterado ou descontinuado</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold">6. Garantia de Satisfação</h2>
            <p className="text-muted-foreground">
              Se houver algum problema com seu pedido, entre em contato em até 24 horas. 
              Avaliaremos cada caso e, se procedente, ofereceremos reembolso ou crédito.
            </p>
          </section>

          <section className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-bold m-0">7. Limitações</h2>
            </div>
            <ul className="text-muted-foreground space-y-2">
              <li>Não nos responsabilizamos por atrasos causados por fatores externos</li>
              <li>A qualidade do produto pode ser afetada após a entrega</li>
              <li>Alergias: consulte os ingredientes antes de pedir</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold">8. Conta de Usuário</h2>
            <p className="text-muted-foreground">
              Você é responsável por manter a confidencialidade de sua conta. Qualquer atividade 
              realizada com suas credenciais é de sua responsabilidade.
            </p>
          </section>

          <section className="bg-card rounded-xl p-6 border border-border">
            <h2 className="text-xl font-bold mb-4">Alterações nos Termos</h2>
            <p className="text-muted-foreground">
              Reservamos o direito de modificar estes termos a qualquer momento. Alterações significativas 
              serão comunicadas por e-mail ou aviso no aplicativo.
            </p>
          </section>
        </div>
      </main>

      <footer className="border-t border-border mt-12 py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2024 Expresso Delivery. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
