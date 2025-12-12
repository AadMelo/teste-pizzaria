import { MapPin, Phone, Clock, Mail, Instagram, Facebook, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
export default function Footer() {
  return (
    <footer className="mt-12 bg-card border-t border-border safe-bottom">
      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {/* About */}
          <div className="col-span-2 md:col-span-1">
            <h3 className="text-lg md:text-xl font-bold pizza-gradient-text mb-3 md:mb-4">🍕 Expresso Delivery</h3>
            <p className="text-muted-foreground text-xs md:text-sm mb-4">
              A melhor pizza da região desde 2009. Ingredientes frescos e selecionados, 
              massa artesanal e muito amor em cada fatia!
            </p>
            <div className="flex gap-3">
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center active:bg-primary/30 transition-colors touch-target"
              >
                <Instagram className="h-6 w-6 text-primary" />
              </a>
              <a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center active:bg-primary/30 transition-colors touch-target"
              >
                <Facebook className="h-6 w-6 text-primary" />
              </a>
              <a 
                href="https://wa.me/5511999999999" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center active:bg-primary/30 transition-colors touch-target"
              >
                <MessageCircle className="h-6 w-6 text-primary" />
              </a>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-bold mb-3 md:mb-4 text-base md:text-lg">📞 Contato</h3>
            <ul className="space-y-3 md:space-y-3 text-sm md:text-base text-muted-foreground">
              <li className="flex items-center gap-2">
                <Phone className="h-5 w-5 md:h-5 md:w-5 text-primary flex-shrink-0" />
                <a href="tel:+5511999999999" className="active:text-primary">(11) 99999-9999</a>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-5 w-5 md:h-5 md:w-5 text-primary flex-shrink-0" />
                <a href="tel:+551133333333" className="active:text-primary">(11) 3333-3333</a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-5 w-5 md:h-5 md:w-5 text-primary flex-shrink-0" />
                <span className="truncate">contato@expresso.com.br</span>
              </li>
            </ul>
          </div>

          {/* Address */}
          <div>
            <h3 className="font-bold mb-3 md:mb-4 text-base md:text-lg">📍 Endereço</h3>
            <ul className="space-y-3 md:space-y-3 text-sm md:text-base text-muted-foreground">
              <li className="flex items-start gap-2">
                <MapPin className="h-5 w-5 md:h-5 md:w-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p>Rua das Pizzas, 123</p>
                  <p>Centro - São Paulo/SP</p>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <Clock className="h-5 w-5 md:h-5 md:w-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold">Horário:</p>
                  <p>Seg-Dom: 18h às 23h</p>
                </div>
              </li>
            </ul>
          </div>

          {/* Delivery Info */}
          <div className="col-span-2 md:col-span-1">
            <h3 className="font-bold mb-3 md:mb-4 text-base md:text-lg">🛵 Delivery</h3>
            <div className="grid grid-cols-2 md:grid-cols-1 gap-2 md:gap-2 text-sm md:text-base text-muted-foreground">
              <p>✅ Pedido mín: R$ 25</p>
              <p>✅ Raio: até 5km</p>
              <p>✅ Tempo: 30-45 min</p>
              <p>✅ Frete grátis +R$80</p>
              <p className="col-span-2 md:col-span-1 pt-2">
                <span className="font-semibold">Pagamento:</span> Cartão, Dinheiro, PIX
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-border bg-muted/30">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col items-center gap-3 text-xs md:text-sm text-muted-foreground">
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-2">
              <Link to="/sobre" className="active:text-primary transition-colors py-1">Sobre Nós</Link>
              <Link to="/privacidade" className="active:text-primary transition-colors py-1">Privacidade</Link>
              <Link to="/termos" className="active:text-primary transition-colors py-1">Termos</Link>
              <Link to="/trabalhe-conosco" className="active:text-primary transition-colors py-1">Trabalhe Conosco</Link>
            </div>
            <p className="text-center">© 2024 Expresso Delivery</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
