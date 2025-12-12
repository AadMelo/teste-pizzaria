import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

interface Testimonial {
  id: number;
  name: string;
  avatar: string;
  rating: number;
  text: string;
  date: string;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: 'Maria Silva',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face',
    rating: 5,
    text: 'A melhor pizza que já comi! Massa crocante e ingredientes frescos. Recomendo demais! 🍕',
    date: 'há 2 dias'
  },
  {
    id: 2,
    name: 'Carlos Oliveira',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
    rating: 5,
    text: 'Entrega super rápida e pizza quentinha. A de camarão é simplesmente incrível!',
    date: 'há 3 dias'
  },
  {
    id: 3,
    name: 'Ana Beatriz',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
    rating: 5,
    text: 'Virei cliente fiel! Peço toda semana. A Quatro Queijos derrete na boca. 😍',
    date: 'há 4 dias'
  },
  {
    id: 4,
    name: 'Roberto Santos',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face',
    rating: 5,
    text: 'Preço justo e qualidade premium. O atendimento também é nota 10!',
    date: 'há 5 dias'
  },
  {
    id: 5,
    name: 'Juliana Costa',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face',
    rating: 5,
    text: 'Pizza de chocolate com as crianças foi sucesso total! Voltaremos sempre.',
    date: 'há 1 semana'
  },
  {
    id: 6,
    name: 'Fernando Lima',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
    rating: 5,
    text: 'Calabresa acebolada perfeita! Cebola no ponto e calabresa de primeira.',
    date: 'há 1 semana'
  },
  {
    id: 7,
    name: 'Camila Rocha',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face',
    rating: 5,
    text: 'Borda recheada de catupiry é viciante! Não consigo pedir sem.',
    date: 'há 2 semanas'
  },
  {
    id: 8,
    name: 'Lucas Mendes',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop&crop=face',
    rating: 5,
    text: 'Melhor custo-benefício da região. Pizza grande alimenta a família toda!',
    date: 'há 2 semanas'
  }
];

export default function Testimonials() {
  // Duplicate for infinite loop effect
  const duplicatedTestimonials = [...testimonials, ...testimonials];

  return (
    <section className="py-6 overflow-hidden">
      <div className="px-3 md:px-4 mb-4">
        <h2 className="text-lg md:text-xl font-bold flex items-center gap-2">
          <span className="text-2xl">💬</span>
          O que nossos clientes dizem
        </h2>
        <p className="text-muted-foreground text-sm mt-1">
          Mais de 5.000 avaliações positivas
        </p>
      </div>

      {/* Marquee Container */}
      <div className="relative">
        {/* Gradient Overlays */}
        <div className="absolute left-0 top-0 bottom-0 w-12 md:w-24 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-12 md:w-24 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
        
        {/* Scrolling Track */}
        <motion.div
          className="flex gap-4 py-2"
          animate={{
            x: [0, -50 * testimonials.length * 4.5],
          }}
          transition={{
            x: {
              repeat: Infinity,
              repeatType: "loop",
              duration: 40,
              ease: "linear",
            },
          }}
        >
          {duplicatedTestimonials.map((testimonial, index) => (
            <motion.div
              key={`${testimonial.id}-${index}`}
              className="flex-shrink-0 w-[280px] md:w-[320px]"
              whileHover={{ scale: 1.02, y: -4 }}
              transition={{ duration: 0.2 }}
            >
              <div className="bg-card border border-border/50 rounded-2xl p-4 h-full shadow-lg hover:shadow-xl transition-shadow duration-300 backdrop-blur-sm">
                {/* Header */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="relative">
                    <img
                      src={testimonial.avatar}
                      alt={testimonial.name}
                      className="w-12 h-12 rounded-full object-cover ring-2 ring-primary/20"
                    />
                    <div className="absolute -bottom-1 -right-1 bg-green-500 w-4 h-4 rounded-full border-2 border-card" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm truncate">{testimonial.name}</h3>
                    <div className="flex items-center gap-1">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">{testimonial.date}</span>
                </div>
                
                {/* Content */}
                <p className="text-sm text-foreground/90 leading-relaxed">
                  "{testimonial.text}"
                </p>
                
                {/* Verified Badge */}
                <div className="mt-3 flex items-center gap-1.5 text-xs text-green-600">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Compra verificada</span>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Stats Bar */}
      <div className="px-3 md:px-4 mt-6">
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 rounded-2xl p-4 flex items-center justify-around">
          <div className="text-center">
            <p className="text-xl md:text-2xl font-bold text-primary">4.9</p>
            <p className="text-xs text-muted-foreground">Avaliação</p>
          </div>
          <div className="w-px h-8 bg-border" />
          <div className="text-center">
            <p className="text-xl md:text-2xl font-bold text-primary">5k+</p>
            <p className="text-xs text-muted-foreground">Avaliações</p>
          </div>
          <div className="w-px h-8 bg-border" />
          <div className="text-center">
            <p className="text-xl md:text-2xl font-bold text-primary">98%</p>
            <p className="text-xs text-muted-foreground">Recomendam</p>
          </div>
        </div>
      </div>
    </section>
  );
}
