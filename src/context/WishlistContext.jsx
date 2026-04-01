import { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";

const WishlistContext = createContext(undefined);

export const WishlistProvider = ({ children }) => {
  const { user } = useAuth();
  const storageKey = user?.id ? `nike-wishlist-${user.id}` : "nike-wishlist-guest";

  const [items, setItems] = useState(() => {
    try {
      const s = localStorage.getItem(storageKey);
      return s ? JSON.parse(s) : [];
    } catch { return []; }
  });

  // Reload wishlist whenever the user changes (login, logout, switch account)
  useEffect(() => {
    try {
      const s = localStorage.getItem(storageKey);
      setItems(s ? JSON.parse(s) : []);
    } catch { setItems([]); }
  }, [storageKey]);

  // Persist on every change
  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(items));
  }, [items, storageKey]);

  const addItem      = (product) => setItems((prev) => prev.find((p) => p.id === product.id) ? prev : [...prev, product]);
  const removeItem   = (productId) => setItems((prev) => prev.filter((p) => p.id !== productId));
  const isInWishlist = (productId) => items.some((p) => p.id === productId);

  return (
    <WishlistContext.Provider value={{ items, addItem, removeItem, isInWishlist, totalItems: items.length }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
};