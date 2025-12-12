import { ArrowLeft, Shield, Lock, Eye, Database, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function PrivacyPolicy() {
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
              <Shield className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-bold">Política de Privacidade</h1>
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
            <div className="flex items-center gap-2 mb-4">
              <Lock className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-bold m-0">1. Compromisso com sua Privacidade</h2>
            </div>
            <p className="text-muted-foreground">
              A Expresso Delivery está comprometida em proteger sua privacidade. Esta política descreve 
              como coletamos, usamos e protegemos suas informações pessoais quando você utiliza nossos 
              serviços de delivery.
            </p>
          </section>

          <section className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Database className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-bold m-0">2. Informações que Coletamos</h2>
            </div>
            <ul className="text-muted-foreground space-y-2">
              <li><strong>Dados de cadastro:</strong> Nome, e-mail, telefone e endereço de entrega.</li>
              <li><strong>Dados de pedidos:</strong> Histórico de pedidos, preferências e itens favoritos.</li>
              <li><strong>Dados de pagamento:</strong> Método de pagamento utilizado (não armazenamos dados de cartão).</li>
              <li><strong>Dados de navegação:</strong> Informações sobre como você usa nosso aplicativo.</li>
            </ul>
          </section>

          <section className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Eye className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-bold m-0">3. Como Usamos suas Informações</h2>
            </div>
            <ul className="text-muted-foreground space-y-2">
              <li>Processar e entregar seus pedidos</li>
              <li>Enviar atualizações sobre status de pedidos</li>
              <li>Gerenciar seu programa de fidelidade</li>
              <li>Enviar promoções e novidades (com seu consentimento)</li>
              <li>Melhorar nossos serviços e experiência do usuário</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold">4. Compartilhamento de Dados</h2>
            <p className="text-muted-foreground">
              Não vendemos suas informações pessoais. Compartilhamos dados apenas com:
            </p>
            <ul className="text-muted-foreground space-y-2">
              <li>Entregadores para realizar a entrega do seu pedido</li>
              <li>Processadores de pagamento para concluir transações</li>
              <li>Autoridades quando exigido por lei</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold">5. Segurança dos Dados</h2>
            <p className="text-muted-foreground">
              Utilizamos medidas de segurança técnicas e organizacionais para proteger suas informações, 
              incluindo criptografia, firewalls e controles de acesso restritos.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold">6. Seus Direitos</h2>
            <p className="text-muted-foreground">
              Você tem direito de acessar, corrigir ou excluir suas informações pessoais a qualquer momento. 
              Para exercer esses direitos, entre em contato conosco.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold">7. Cookies</h2>
            <p className="text-muted-foreground">
              Utilizamos cookies para melhorar sua experiência, lembrar suas preferências e analisar 
              como nosso site é utilizado.
            </p>
          </section>

          <section className="bg-card rounded-xl p-6 border border-border">
            <div className="flex items-center gap-2 mb-4">
              <Mail className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-bold m-0">Dúvidas?</h2>
            </div>
            <p className="text-muted-foreground mb-4">
              Se você tiver dúvidas sobre nossa política de privacidade, entre em contato:
            </p>
            <p className="text-muted-foreground">
              📧 privacidade@expressodelivery.com.br<br />
              📞 (11) 3333-3333
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
