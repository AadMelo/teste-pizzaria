import { useState } from 'react';
import { ArrowLeft, Briefcase, Send, ChefHat, Truck, Headphones, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const positions = [
  {
    icon: ChefHat,
    title: 'Pizzaiolo',
    description: 'Experiência com forno a lenha e massas artesanais',
    requirements: ['Experiência mínima de 2 anos', 'Disponibilidade noturna', 'Conhecimento em massas'],
  },
  {
    icon: Truck,
    title: 'Entregador',
    description: 'Moto própria e CNH válida',
    requirements: ['Moto própria', 'CNH categoria A', 'Conhecimento da região', 'Celular com GPS'],
  },
  {
    icon: Headphones,
    title: 'Atendente',
    description: 'Bom relacionamento interpessoal',
    requirements: ['Experiência com atendimento', 'Boa comunicação', 'Disponibilidade de horários'],
  },
];

const benefits = [
  '💰 Salário competitivo',
  '🍕 Refeição no local',
  '📈 Plano de carreira',
  '🎉 Ambiente descontraído',
  '💳 Vale transporte',
  '🏥 Assistência médica após período de experiência',
];

export default function WorkWithUs() {
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    position: '',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.phone || !formData.position) {
      toast.error('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    // Simular envio
    setSubmitted(true);
    toast.success('Currículo enviado com sucesso!');
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur">
          <div className="container mx-auto px-4">
            <div className="flex h-16 items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-xl font-bold">Trabalhe Conosco</h1>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-16 text-center">
          <div className="max-w-md mx-auto">
            <CheckCircle className="h-20 w-20 text-green-500 mx-auto mb-6" />
            <h2 className="text-2xl font-bold mb-4">Currículo Enviado!</h2>
            <p className="text-muted-foreground mb-6">
              Obrigado pelo seu interesse em fazer parte da família Expresso Delivery! 
              Analisaremos seu currículo e entraremos em contato em breve.
            </p>
            <Button onClick={() => navigate('/')}>
              Voltar ao Cardápio
            </Button>
          </div>
        </main>
      </div>
    );
  }

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
              <Briefcase className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-bold">Trabalhe Conosco</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Hero */}
        <section className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Faça parte da nossa <span className="pizza-gradient-text">família!</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Estamos sempre em busca de pessoas apaixonadas por gastronomia e atendimento. 
            Se você quer crescer em um ambiente divertido e desafiador, venha trabalhar conosco!
          </p>
        </section>

        {/* Open Positions */}
        <section className="mb-12">
          <h3 className="text-xl font-bold mb-6 text-center">Vagas Abertas</h3>
          <div className="grid md:grid-cols-3 gap-6">
            {positions.map((position) => (
              <div 
                key={position.title}
                className="bg-card rounded-xl p-6 border border-border/50 hover:border-primary/30 transition-all"
              >
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <position.icon className="h-6 w-6 text-primary" />
                </div>
                <h4 className="font-bold text-lg mb-2">{position.title}</h4>
                <p className="text-muted-foreground text-sm mb-4">{position.description}</p>
                <ul className="space-y-1">
                  {position.requirements.map((req, idx) => (
                    <li key={idx} className="text-xs text-muted-foreground flex items-center gap-2">
                      <span className="text-primary">•</span> {req}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Benefits */}
        <section className="mb-12">
          <div className="pizza-gradient rounded-2xl p-8 text-white">
            <h3 className="text-xl font-bold mb-6 text-center">Nossos Benefícios</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
              {benefits.map((benefit, idx) => (
                <div key={idx} className="text-center text-sm">
                  {benefit}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Application Form */}
        <section className="max-w-2xl mx-auto">
          <div className="bg-card rounded-xl p-6 md:p-8 border border-border/50">
            <h3 className="text-xl font-bold mb-6 text-center">Envie seu Currículo</h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome Completo *</Label>
                  <Input 
                    id="name"
                    placeholder="Seu nome"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail *</Label>
                  <Input 
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone *</Label>
                  <Input 
                    id="phone"
                    placeholder="(11) 99999-9999"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="position">Vaga de Interesse *</Label>
                  <select
                    id="position"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  >
                    <option value="">Selecione uma vaga</option>
                    <option value="pizzaiolo">Pizzaiolo</option>
                    <option value="entregador">Entregador</option>
                    <option value="atendente">Atendente</option>
                    <option value="outro">Outra área</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Conte um pouco sobre você</Label>
                <Textarea 
                  id="message"
                  placeholder="Sua experiência, disponibilidade, por que quer trabalhar conosco..."
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                />
              </div>

              <Button type="submit" className="w-full" size="lg">
                <Send className="h-4 w-4 mr-2" />
                Enviar Candidatura
              </Button>
            </form>
          </div>
        </section>
      </main>

      <footer className="border-t border-border mt-12 py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2024 Expresso Delivery. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
