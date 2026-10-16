"use client";

import { createContext, useContext, useReducer, type ReactNode } from "react";
import { currentPrice, type Product } from "@/lib/products";

// 1. Describe the state and every way it can change.
interface CartItem {
  product: Product;
  quantity: number;
}

interface CartState {
  items: CartItem[];
}

type CartAction =
  | { type: "add"; product: Product }
  | { type: "remove"; productId: number }
  | { type: "clear" };

// 2. A reducer: (currentState, action) => nextState.
//    Pure function, no side effects, easy to unit test.
function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "add": {
      const existing = state.items.find((i) => i.product.id === action.product.id);
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.product.id === action.product.id ? { ...i, quantity: i.quantity + 1 } : i,
          ),
        };
      }
      return { items: [...state.items, { product: action.product, quantity: 1 }] };
    }
    case "remove":
      return { items: state.items.filter((i) => i.product.id !== action.productId) };
    case "clear":
      return { items: [] };
  }
}

// 3. What consumers of the context get access to.
interface CartContextValue {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  addToCart: (product: Product) => void;
  removeFromCart: (productId: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

// 4. The Provider owns the state and wraps (part of) the app.
export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [] });

  const value: CartContextValue = {
    items: state.items,
    totalItems: state.items.reduce((sum, i) => sum + i.quantity, 0),
    totalPrice: state.items.reduce((sum, i) => sum + currentPrice(i.product) * i.quantity, 0),
    addToCart: (product) => dispatch({ type: "add", product }),
    removeFromCart: (productId) => dispatch({ type: "remove", productId }),
    clearCart: () => dispatch({ type: "clear" }),
  };

  return <CartContext value={value}>{children}</CartContext>;
}

// 5. A custom hook so consumers never touch the raw context,
//    and get a clear error if the Provider is missing.
export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
