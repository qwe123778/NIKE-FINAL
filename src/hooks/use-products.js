import { useState, useEffect, useCallback } from "react";
import apiFetch from "@/lib/api";

export function useProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiFetch("/api/products");
      const mapped = (data || []).map((row) => ({
        id:          row.id,
        name:        row.name,
        category:    row.category,
        price:       Number(row.price),
        sku:         row.sku,
        image:       row.image_url,
        sizes:       Array.isArray(row.sizes) ? row.sizes : JSON.parse(row.sizes || "[]"),
        weight:      row.weight      || "N/A",
        offset:      row.offset      || "N/A",
        description: row.description || "",
        isNew:       row.is_new      ?? false,
        seller_id:   row.seller_id   || null,
      }));
      setProducts(mapped);
    } catch (err) {
      console.warn("[useProducts] Failed to fetch products:", err.message);
      setError(err.message);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  return { products, loading, error, refetch: fetchProducts };
}