import { Router } from "express";
import supabase from "../lib/supabase.js";
import requireAuth, { requireSeller } from "../middleware/requireAuth.js";

const router = Router();

/**
 * GET /api/products
 * Public — returns all products ordered by newest first.
 */
router.get("/", async (_req, res) => {
  try {
    console.log("[GET /products] Supabase URL:", process.env.SUPABASE_URL ? "set" : "MISSING");
    console.log("[GET /products] Service key:", process.env.SUPABASE_SERVICE_ROLE_KEY ? "set" : "MISSING");

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    console.log("[GET /products] data:", data);
    console.log("[GET /products] error:", error);

    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error("[GET /products] CATCH:", err.message, err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/products/:id
 * Public — single product by id.
 */
router.get("/:id", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", req.params.id)
      .single();

    if (error || !data) return res.status(404).json({ error: "Product not found" });
    res.json(data);
  } catch (err) {
    console.error("[GET /products/:id]", err.message);
    res.status(500).json({ error: "Failed to fetch product" });
  }
});

/**
 * POST /api/products
 * Seller only — create a new product listing.
 * Body: { name, category, price, sku, image_url, sizes, weight, offset, description, is_new }
 */
router.post("/", requireSeller, async (req, res) => {
  const { name, category, price, sku, image_url, sizes, weight, offset, description, is_new } = req.body;

  if (!name || !category || !price || !image_url) {
    return res.status(400).json({ error: "name, category, price and image_url are required" });
  }

  try {
    const { data, error } = await supabase
      .from("products")
      .insert([{
        name,
        category,
        price:       Number(price),
        sku:         sku || `SP-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        image_url,
        sizes:       sizes || [7, 8, 9, 10, 11, 12],
        weight:      weight || "N/A",
        offset:      offset || "N/A",
        description: description || "",
        is_new:      is_new ?? false,
        seller_id:   req.auth.userId,
      }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    console.error("[POST /products]", err.message);
    res.status(500).json({ error: "Failed to create product" });
  }
});

/**
 * DELETE /api/products/:id
 * Seller only — delete own product.
 */
router.delete("/:id", requireSeller, async (req, res) => {
  try {
    // Verify ownership
    const { data: product } = await supabase
      .from("products")
      .select("seller_id")
      .eq("id", req.params.id)
      .single();

    if (!product) return res.status(404).json({ error: "Product not found" });
    if (product.seller_id !== req.auth.userId) {
      return res.status(403).json({ error: "You can only delete your own products" });
    }

    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", req.params.id);

    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    console.error("[DELETE /products/:id]", err.message);
    res.status(500).json({ error: "Failed to delete product" });
  }
});

export default router;
