import { useState } from 'react';
import { ShoppingCart, Search, Menu, X, Clock, Moon, Sun, Gift, User, LogOut, Package } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/hooks/useAuth';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useTheme } from 'next-themes';
import Cart from './Cart';
import LoyaltyProgram from './LoyaltyProgram';

interface HeaderProps {
  onSearch?: (query: string) => void;
}

export default function Header({ onSearch }: HeaderProps) {
  const { itemCount } = useCart();
  const { user, profile, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  const isStoreOpen = () => {
    const now = new Date();
    const hours = now.getHours();
    return hours >= 18 && hours < 23;
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(searchQuery);
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const userPoints = profile?.loyalty_points || 0;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 safe-top">
      <div className="container mx-auto px-3 md:px-4">
        <div className="flex h-16 md:h-18 items-center justify-between gap-2 md:gap-4">
          {/* Logo */}
          <div className="flex items-center gap-1.5 md:gap-2.5 shrink-0">
            <span className="text-xl md:text-3xl">🍕</span>
            <div>
              <h1 className="text-xs sm:text-base md:text-xl font-bold pizza-gradient-text leading-tight">Expresso</h1>
              <div className="flex items-center gap-1 text-[9px] sm:text-xs md:text-sm">
                <Clock className="h-2.5 w-2.5 md:h-3.5 md:w-3.5" />
                <span className={isStoreOpen() ? 'text-green-500' : 'text-red-500'}>
                  {isStoreOpen() ? 'Aberto' : 'Fechado'}
                </span>
              </div>
            </div>
          </div>

          {/* Search - Desktop */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-4">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar pizzas..."
                className="pl-10 bg-muted/50"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  onSearch?.(e.target.value);
                }}
              />
            </div>
          </form>

          {/* Actions */}
          <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2">
            {/* Cart - Sempre visível e primeiro no mobile */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="relative touch-target h-10 w-10 flex-shrink-0">
                  <ShoppingCart className="h-5 w-5 md:h-5 md:w-5" />
                  {itemCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-xs text-primary-foreground flex items-center justify-center font-bold animate-pulse">
                      {itemCount > 9 ? '9+' : itemCount}
                    </span>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent className="w-full sm:max-w-lg overflow-y-auto p-0">
                <Cart />
              </SheetContent>
            </Sheet>

            {/* User / Auth */}
            {user ? (
              <>
                {/* Meus Pedidos - Sempre visível */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/pedidos')}
                  className="flex-shrink-0 gap-1.5 px-2 sm:px-3 h-9 bg-orange-500/10 hover:bg-orange-500/20 text-orange-600 hover:text-orange-700 border border-orange-300/30"
                >
                  <Package className="h-4 w-4" />
                  <span className="text-xs font-semibold">Pedidos</span>
                </Button>
              
                {/* Loyalty Program - Visível em telas maiores */}
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="hidden sm:flex relative gap-1.5 px-2.5"
                    >
                      <Gift className="h-5 w-5 text-amber-500" />
                      <span className="text-sm font-bold text-amber-600">{userPoints} pts</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="text-center pizza-gradient-text">
                        🎁 Programa Fidelidade
                      </DialogTitle>
                    </DialogHeader>
                    <LoyaltyProgram />
                  </DialogContent>
                </Dialog>

                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-10 w-10 flex-shrink-0">
                      <User className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="px-2 py-1.5">
                      <p className="text-sm font-medium">{profile?.name || 'Usuário'}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                      <p className="text-xs text-amber-600 font-medium mt-1">🎁 {userPoints} pontos</p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate('/pedidos')}>
                      <Package className="h-4 w-4 mr-2" />
                      Meus Pedidos
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Dialog>
                        <DialogTrigger className="flex w-full items-center px-2 py-1.5 text-sm cursor-pointer hover:bg-accent rounded-sm">
                          <Gift className="h-4 w-4 mr-2 text-amber-500" />
                          Programa Fidelidade
                        </DialogTrigger>
                        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle className="text-center pizza-gradient-text">
                              🎁 Programa Fidelidade
                            </DialogTitle>
                          </DialogHeader>
                          <LoyaltyProgram />
                        </DialogContent>
                      </Dialog>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut}>
                      <LogOut className="h-4 w-4 mr-2" />
                      Sair
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/auth')}
                className="h-10 w-10 flex-shrink-0"
              >
                <User className="h-5 w-5" />
              </Button>
            )}

            {/* Theme Toggle - Hidden on mobile */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="relative h-10 w-10 hidden sm:flex"
            >
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Alternar tema</span>
            </Button>

            {/* Mobile Menu */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden h-10 w-10 flex-shrink-0"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Search */}
        {isOpen && (
          <div className="md:hidden pb-4">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Buscar pizzas..."
                  className="pl-10 bg-muted/50"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    onSearch?.(e.target.value);
                  }}
                />
              </div>
            </form>
          </div>
        )}
      </div>
    </header>
  );
}
