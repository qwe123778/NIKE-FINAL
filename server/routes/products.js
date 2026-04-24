import { Router } from "express";
import supabase from "../lib/supabase.js";
import requireAuth, { requireSeller } from "../middleware/requireAuth.js";

const router = Router();

// GET /api/products — public
router.get("/", async (_req, res) => {
  try {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error("[GET /products]", err.message);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/products/:id — public
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
    res.status(500).json({ error: err.message });
  }
});

// POST /api/products — seller only
router.post("/", requireSeller, async (req, res) => {
  const { name, category, price, image_url, description, is_new, stock } = req.body;

  if (!name || !category || !price || !image_url) {
    return res.status(400).json({ error: "name, category, price and image_url are required" });
  }

  try {
    const insertData = {
      name,
      category,
      price:       Number(price),
      sku:         `SP-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      image_url,
      description: description || "",
      is_new:      is_new ?? false,
      stock:       stock || 1,
      seller_id:   req.auth.userId,
      seller_name: req.auth.name,
    };

    const { data, error } = await supabase
      .from("products")
      .insert([insertData])
      .select()
      .single();

    if (error) {
      console.error("[POST /products]", error.message, error.hint);
      return res.status(500).json({ error: error.message });
    }

    // Notify followers that this seller added a new product
    const { data: followers } = await supabase
      .from("seller_follows")
      .select("buyer_id")
      .eq("seller_id", req.auth.userId);

    if (followers?.length > 0) {
      const notifs = followers.map((f) => ({
        buyer_id: f.buyer_id,
        type:     "new_product",
        title:    `${req.auth.name} added a new product`,
        message:  `${name} — $${price}`,
        link:     `/product/${data.id}`,
        read:     false,
      }));
      await supabase.from("buyer_notifications").insert(notifs);
    }

    res.status(201).json(data);
  } catch (err) {
    console.error("[POST /products] CATCH:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/products/:id — seller only, own products
router.delete("/:id", requireSeller, async (req, res) => {
  try {
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
    res.status(500).json({ error: err.message });
  }
});

export default router;