import { Clock, MapPin, Phone, Star, Truck, Timer, Award, Flame, Users, ThumbsUp } from 'lucide-react';
import avatarMulher1 from '@/assets/avatar-mulher-1.jpg';
import avatarMulher2 from '@/assets/avatar-mulher-2.jpg';
import avatarHomem from '@/assets/avatar-homem.jpg';

const features = [
  {
    icon: Truck,
    title: 'Entrega Rápida',
    description: '30-45 min na sua porta',
  },
  {
    icon: Award,
    title: 'Qualidade Premium',
    description: 'Ingredientes selecionados',
  },
  {
    icon: Flame,
    title: 'Feita na Hora',
    description: 'Pizza quentinha sempre',
  },
  {
    icon: ThumbsUp,
    title: 'Satisfação Garantida',
    description: 'Ou seu dinheiro de volta',
  },
];

const stats = [
  { value: '10k+', label: 'Pizzas Entregues' },
  { value: '4.9', label: 'Avaliação Média', icon: Star },
  { value: '15+', label: 'Anos de Tradição' },
  { value: '30min', label: 'Tempo Médio' },
];

const testimonials = [
  {
    name: 'Maria Silva',
    text: 'Melhor pizza da região! Sempre quentinha e deliciosa. O atendimento é impecável!',
    rating: 5,
    avatar: avatarMulher1,
  },
  {
    name: 'João Santos',
    text: 'Peço toda semana! A pizza de calabresa é sensacional. Entrega super rápida.',
    rating: 5,
    avatar: avatarHomem,
  },
  {
    name: 'Ana Costa',
    text: 'As pizzas doces são incríveis! Minha família toda adora. Recomendo muito!',
    rating: 5,
    avatar: avatarMulher2,
  },
];

export default function StoreInfo() {
  const isStoreOpen = () => {
    const now = new Date();
    const hours = now.getHours();
    return hours >= 18 && hours < 23;
  };

  return (
    <div className="space-y-4 mt-4">
      {/* Store Status Bar */}
      <div className="mx-3 md:mx-4 bg-card rounded-xl p-3 md:p-4 shadow-md border border-border/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full animate-pulse ${isStoreOpen() ? 'bg-green-500' : 'bg-red-500'}`} />
            <div>
              <p className={`font-bold text-sm md:text-base ${isStoreOpen() ? 'text-green-600' : 'text-red-500'}`}>
                {isStoreOpen() ? '🟢 Aberto!' : '🔴 Fechado'}
              </p>
              <p className="text-xs md:text-sm text-muted-foreground">18h às 23h</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-xs md:text-sm">
            <div className="flex items-center gap-1.5 bg-muted px-2.5 py-1.5 rounded-full">
              <Timer className="h-5 w-5 md:h-4 md:w-4 text-primary" />
              <span className="font-semibold">30-45min</span>
            </div>
            <div className="flex items-center gap-1.5 bg-muted px-2.5 py-1.5 rounded-full">
              <Truck className="h-5 w-5 md:h-4 md:w-4 text-primary" />
              <span className="font-semibold">R$25 mín</span>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid - 2x2 */}
      <div className="mx-3 md:mx-4 grid grid-cols-2 gap-2 md:gap-3">
        {features.map((feature) => (
          <div
            key={feature.title}
            className="bg-card rounded-lg p-3 md:p-4 text-center shadow-sm border border-border/50"
          >
            <div className="w-12 h-12 md:w-14 md:h-14 mx-auto mb-2 rounded-full bg-primary/10 flex items-center justify-center">
              <feature.icon className="h-6 w-6 md:h-7 md:w-7 text-primary" />
            </div>
            <h3 className="font-bold text-sm md:text-base">{feature.title}</h3>
            <p className="text-xs md:text-sm text-muted-foreground leading-tight">{feature.description}</p>
          </div>
        ))}
      </div>

      {/* Stats - 2x2 */}
      <div className="mx-3 md:mx-4 pizza-gradient rounded-xl p-4 md:p-5">
        <div className="grid grid-cols-2 gap-3 text-center text-white">
          {stats.map((stat) => (
            <div key={stat.label}>
              <p className="text-xl md:text-2xl font-bold flex items-center justify-center gap-1">
                {stat.value}
                {stat.icon && <Star className="h-5 w-5 md:h-6 md:w-6 fill-yellow-300 text-yellow-300" />}
              </p>
              <p className="text-xs md:text-sm text-white/80">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Testimonials - Horizontal scroll */}
      <div className="mx-3 md:mx-4">
        <h2 className="text-base md:text-lg font-bold mb-2 flex items-center gap-1.5">
          <Users className="h-6 w-6 md:h-5 md:w-5 text-primary" />
          Avaliações
        </h2>
        <div className="flex gap-2 md:gap-3 overflow-x-auto pb-2 -mx-3 px-3 scroll-container">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.name}
              className="bg-card rounded-lg p-3 md:p-4 shadow-sm border border-border/50 min-w-[220px] md:min-w-[260px] flex-shrink-0 scroll-item"
            >
              <div className="flex items-center gap-2 mb-2">
                <img 
                  src={testimonial.avatar} 
                  alt={testimonial.name}
                  className="w-11 h-11 md:w-12 md:h-12 rounded-full object-cover"
                />
                <div>
                  <p className="font-bold text-sm md:text-base">{testimonial.name}</p>
                  <div className="flex">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 md:h-5 md:w-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-xs md:text-sm text-muted-foreground italic line-clamp-2">"{testimonial.text}"</p>
            </div>
          ))}
        </div>
      </div>

      {/* Contact Info - Compact */}
      <div className="mx-3 md:mx-4 bg-card rounded-xl p-3 md:p-4 shadow-sm border border-border/50">
        <h2 className="text-base md:text-lg font-bold mb-2">📍 Onde Estamos</h2>
        <div className="grid grid-cols-3 gap-2 text-center">
          <a href="https://maps.google.com" className="flex flex-col items-center gap-1.5 p-2.5 md:p-3 rounded-lg bg-muted/50 active:bg-muted">
            <MapPin className="h-6 w-6 md:h-7 md:w-7 text-primary" />
            <span className="text-xs md:text-sm text-muted-foreground leading-tight">Rua das Pizzas, 123</span>
          </a>
          <a href="tel:+5511999999999" className="flex flex-col items-center gap-1.5 p-2.5 md:p-3 rounded-lg bg-muted/50 active:bg-muted">
            <Phone className="h-6 w-6 md:h-7 md:w-7 text-primary" />
            <span className="text-xs md:text-sm text-muted-foreground">(11) 99999-9999</span>
          </a>
          <div className="flex flex-col items-center gap-1.5 p-2.5 md:p-3 rounded-lg bg-muted/50">
            <Clock className="h-6 w-6 md:h-7 md:w-7 text-primary" />
            <span className="text-xs md:text-sm text-muted-foreground">18h às 23h</span>
          </div>
        </div>
      </div>
    </div>
  );
}
