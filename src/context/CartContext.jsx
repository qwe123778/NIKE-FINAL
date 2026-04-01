import { createContext, useContext, useState } from "react";

const CartContext = createContext(undefined);

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const addItem = (product, size) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.product.id === product.id && i.size === size);
      if (existing) return prev.map((i) => i.product.id === product.id && i.size === size ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { product, size, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const decreaseItem = (productId, size) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.product.id === productId && i.size === size);
      if (!existing) return prev;
      if (existing.quantity <= 1) return prev.filter((i) => !(i.product.id === productId && i.size === size));
      return prev.map((i) => i.product.id === productId && i.size === size ? { ...i, quantity: i.quantity - 1 } : i);
    });
  };

  const removeItem = (productId, size) => setItems((prev) => prev.filter((i) => !(i.product.id === productId && i.size === size)));
  const clearCart = () => setItems([]);
  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addItem, decreaseItem, removeItem, clearCart, totalItems, totalPrice, isCartOpen, setIsCartOpen }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
};
