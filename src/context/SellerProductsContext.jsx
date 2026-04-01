import { createContext, useContext, useState } from "react";

const SellerProductsContext = createContext(undefined);

export const SellerProductsProvider = ({ children }) => {
  const [sellerProducts, setSellerProducts] = useState(() => {
    try { const s = localStorage.getItem("nike-seller-products"); return s ? JSON.parse(s) : []; } catch { return []; }
  });

  const persist = (products) => {
    setSellerProducts(products);
    localStorage.setItem("nike-seller-products", JSON.stringify(products));
  };

  const addProduct = (product) => persist([product, ...sellerProducts]);
  const removeProduct = (id) => persist(sellerProducts.filter((p) => p.id !== id));

  return (
    <SellerProductsContext.Provider value={{ sellerProducts, addProduct, removeProduct }}>
      {children}
    </SellerProductsContext.Provider>
  );
};

export const useSellerProducts = () => {
  const ctx = useContext(SellerProductsContext);
  if (!ctx) throw new Error("useSellerProducts must be used within SellerProductsProvider");
  return ctx;
};
