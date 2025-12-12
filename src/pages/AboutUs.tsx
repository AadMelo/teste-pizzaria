import { Award, Heart, Users, ChefHat, Clock, Star, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import chefFundador from '@/assets/chef-fundador.jpg';
import pizzariaInterior from '@/assets/pizzaria-interior.jpg';
import equipePizzaria from '@/assets/equipe-pizzaria.jpg';

const timeline = [
  { year: '2009', title: 'O Início', description: 'Giuseppe abre a primeira pizzaria com apenas um forno a lenha e um sonho.' },
  { year: '2012', title: 'Expansão', description: 'Inauguração do sistema de delivery, levando pizzas quentinhas para toda a região.' },
  { year: '2015', title: 'Reconhecimento', description: 'Prêmio de Melhor Pizza da Região pelo 3º ano consecutivo.' },
  { year: '2018', title: 'Renovação', description: 'Reforma completa com novo forno italiano e área de atendimento ampliada.' },
  { year: '2022', title: 'Inovação', description: 'Lançamento do app de pedidos e programa de fidelidade.' },
  { year: '2024', title: 'Presente', description: 'Mais de 10.000 pizzas entregues e nota 4.9 de avaliação!' },
];

const values = [
  { icon: Heart, title: 'Paixão', description: 'Cada pizza é feita com amor e dedicação' },
  { icon: Award, title: 'Qualidade', description: 'Ingredientes frescos e selecionados diariamente' },
  { icon: Users, title: 'Família', description: 'Tratamos cada cliente como parte da nossa família' },
  { icon: ChefHat, title: 'Tradição', description: 'Receitas passadas de geração em geração' },
];

const team = [
  { name: 'Giuseppe Rossi', role: 'Fundador & Chef Principal', description: 'Com mais de 30 anos de experiência, Giuseppe trouxe as receitas tradicionais da Itália.' },
  { name: 'Maria Santos', role: 'Gerente Geral', description: 'Responsável por garantir que cada pedido seja perfeito e entregue no prazo.' },
  { name: 'Carlos Silva', role: 'Chef de Cozinha', description: 'Especialista em pizzas premium e criação de novos sabores.' },
  { name: 'Ana Paula', role: 'Atendimento', description: 'Sempre com um sorriso, cuida de cada detalhe do seu pedido.' },
  { name: 'Pedro Lima', role: 'Entregas', description: 'Nosso entregador mais rápido, garantindo sua pizza sempre quentinha.' },
];

export default function AboutUs() {
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
              <span className="text-3xl">🍕</span>
              <h1 className="text-xl font-bold pizza-gradient-text">Sobre Nós</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <section className="relative rounded-3xl overflow-hidden mb-12">
          <img 
            src={pizzariaInterior} 
            alt="Interior da Pizzaria Expresso Delivery"
            className="w-full h-[300px] md:h-[400px] object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12 text-white">
            <h2 className="text-3xl md:text-5xl font-bold mb-2">Nossa História</h2>
            <p className="text-lg md:text-xl text-white/90 max-w-2xl">
              Desde 2009, servindo a melhor pizza da região com amor, tradição e ingredientes selecionados.
            </p>
          </div>
        </section>

        {/* Founder Section */}
        <section className="grid md:grid-cols-2 gap-8 items-center mb-16">
          <div>
            <img 
              src={chefFundador} 
              alt="Chef Giuseppe Rossi - Fundador"
              className="rounded-2xl shadow-xl w-full max-w-md mx-auto"
            />
          </div>
          <div className="space-y-4">
            <h3 className="text-2xl md:text-3xl font-bold">O Sonho de Giuseppe</h3>
            <p className="text-muted-foreground">
              Tudo começou em 2009, quando Giuseppe Rossi, um apaixonado por gastronomia italiana, 
              decidiu realizar seu sonho de abrir uma pizzaria autêntica em São Paulo. Com receitas 
              trazidas diretamente da Napoli, onde sua família produz pizzas há gerações, Giuseppe 
              montou seu primeiro forno a lenha em uma pequena loja no centro da cidade.
            </p>
            <p className="text-muted-foreground">
              "A pizza não é apenas comida, é uma experiência. Cada mordida deve transportar você 
              para a Itália", costuma dizer Giuseppe. Essa filosofia guia nosso trabalho até hoje.
            </p>
            <div className="flex gap-4 pt-4">
              <div className="text-center">
                <p className="text-3xl font-bold pizza-gradient-text">15+</p>
                <p className="text-sm text-muted-foreground">Anos de tradição</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold pizza-gradient-text">10k+</p>
                <p className="text-sm text-muted-foreground">Pizzas entregues</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold pizza-gradient-text">4.9</p>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" /> Avaliação
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="mb-16">
          <h3 className="text-2xl md:text-3xl font-bold text-center mb-8">Nossos Valores</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {values.map((value) => (
              <div 
                key={value.title}
                className="bg-card rounded-xl p-6 text-center shadow-md border border-border/50 hover:shadow-lg hover:border-primary/30 transition-all"
              >
                <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                  <value.icon className="h-7 w-7 text-primary" />
                </div>
                <h4 className="font-bold mb-2">{value.title}</h4>
                <p className="text-sm text-muted-foreground">{value.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Timeline */}
        <section className="mb-16">
          <h3 className="text-2xl md:text-3xl font-bold text-center mb-8">Nossa Jornada</h3>
          <div className="relative">
            <div className="absolute left-1/2 -translate-x-1/2 w-0.5 h-full bg-border hidden md:block" />
            <div className="space-y-8">
              {timeline.map((item, index) => (
                <div 
                  key={item.year}
                  className={`flex flex-col md:flex-row gap-4 items-center ${
                    index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                  }`}
                >
                  <div className={`flex-1 ${index % 2 === 0 ? 'md:text-right' : 'md:text-left'}`}>
                    <div className="bg-card rounded-xl p-4 shadow-md border border-border/50 inline-block">
                      <p className="text-sm text-primary font-bold">{item.year}</p>
                      <h4 className="font-bold">{item.title}</h4>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                  </div>
                  <div className="w-4 h-4 rounded-full bg-primary border-4 border-background shadow-lg z-10 hidden md:block" />
                  <div className="flex-1" />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="mb-16">
          <h3 className="text-2xl md:text-3xl font-bold text-center mb-4">Nossa Equipe</h3>
          <p className="text-center text-muted-foreground mb-8 max-w-2xl mx-auto">
            Conheça as pessoas que trabalham todos os dias para levar a melhor pizza até você.
          </p>
          
          <div className="mb-8">
            <img 
              src={equipePizzaria} 
              alt="Equipe Expresso Delivery"
              className="rounded-2xl shadow-xl w-full max-w-4xl mx-auto"
            />
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {team.map((member) => (
              <div 
                key={member.name}
                className="bg-card rounded-xl p-4 shadow-md border border-border/50"
              >
                <h4 className="font-bold">{member.name}</h4>
                <p className="text-sm text-primary font-medium mb-2">{member.role}</p>
                <p className="text-sm text-muted-foreground">{member.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="pizza-gradient rounded-2xl p-8 text-center text-white">
          <h3 className="text-2xl md:text-3xl font-bold mb-4">Venha fazer parte dessa história!</h3>
          <p className="mb-6 text-white/90 max-w-xl mx-auto">
            Peça agora e descubra por que somos a pizzaria favorita da região há mais de 15 anos.
          </p>
          <Button 
            size="lg" 
            variant="secondary"
            onClick={() => navigate('/')}
            className="bg-white text-primary hover:bg-white/90"
          >
            Ver Cardápio
          </Button>
        </section>
      </main>

      {/* Simple Footer */}
      <footer className="border-t border-border mt-12 py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2024 Expresso Delivery. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
