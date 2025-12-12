import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Pizza, PizzaSize, PizzaCrust, PizzaDough, PizzaExtra, Product } from '@/data/pizzaData';

export interface CartPizza {
  id: string;
  type: 'pizza';
  size: PizzaSize;
  flavors: Pizza[];
  crust: PizzaCrust;
  dough: PizzaDough;
  extras: PizzaExtra[];
  quantity: number;
  totalPrice: number;
  observations?: string;
}

export interface CartProduct {
  id: string;
  type: 'product';
  product: Product;
  quantity: number;
  totalPrice: number;
}

export type CartItem = CartPizza | CartProduct;

interface CartContextType {
  items: CartItem[];
  addToCart: (item: CartItem) => void;
  addProductToCart: (product: Product) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  coupon: string | null;
  setCoupon: (coupon: string | null) => void;
  discount: number;
  subtotal: number;
  deliveryFee: number;
  total: number;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [coupon, setCoupon] = useState<string | null>(null);
  const deliveryFee = 5.90;

  const addToCart = (item: CartItem) => {
    setItems((prev) => [...prev, item]);
  };

  const addProductToCart = (product: Product) => {
    // Check if product already exists in cart
    const existingItem = items.find(
      (item) => item.type === 'product' && item.product.id === product.id
    ) as CartProduct | undefined;

    if (existingItem) {
      updateQuantity(existingItem.id, existingItem.quantity + 1);
    } else {
      const cartProduct: CartProduct = {
        id: `product-${product.id}-${Date.now()}`,
        type: 'product',
        product,
        quantity: 1,
        totalPrice: product.price,
      };
      setItems((prev) => [...prev, cartProduct]);
    }
  };

  const removeFromCart = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
    setCoupon(null);
  };

  const subtotal = items.reduce((acc, item) => {
    return acc + item.totalPrice * item.quantity;
  }, 0);

  const discount = coupon === 'PROMO10' ? subtotal * 0.1 : 0;

  const total = subtotal - discount + (items.length > 0 ? deliveryFee : 0);

  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        addProductToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        coupon,
        setCoupon,
        discount,
        subtotal,
        deliveryFee,
        total,
        itemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
