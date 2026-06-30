import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { toast } from "sonner";

export interface CartItem {
  id: string;
  type: "test" | "package";
  name: string;
  price: number;
  image: string;
}

interface CartContextValue {
  items: CartItem[];
  add: (item: CartItem) => void;
  remove: (id: string) => void;
  clear: () => void;
  count: number;
  total: number;
}

const CartContext = createContext<CartContextValue | null>(null);
const KEY = "nusfa_cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    try {
      const raw = typeof window !== "undefined" ? localStorage.getItem(KEY) : null;
      if (raw) setItems(JSON.parse(raw));
    } catch {}
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") localStorage.setItem(KEY, JSON.stringify(items));
  }, [items]);

  const add = (item: CartItem) => {
    setItems(prev => {
      if (prev.find(p => p.id === item.id)) {
        toast.info(`${item.name} is already in your cart`);
        return prev;
      }
      toast.success(`${item.name} added to cart`);
      return [...prev, item];
    });
  };
  const remove = (id: string) => setItems(prev => prev.filter(p => p.id !== id));
  const clear = () => setItems([]);

  return (
    <CartContext.Provider
      value={{
        items, add, remove, clear,
        count: items.length,
        total: items.reduce((s, i) => s + i.price, 0),
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
