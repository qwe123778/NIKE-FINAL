import { Router } from "express";
import supabase from "../lib/supabase.js";
import requireAuth from "../middleware/requireAuth.js";

const router = Router();

/**
 * GET /api/orders
 * Auth required — returns all orders for the current user.
 */
router.get("/", requireAuth, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .eq("user_id", req.auth.userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error("[GET /orders]", err.message);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

/**
 * POST /api/orders
 * Auth required — creates a new order after Stripe payment confirms.
 * Body: { items: [{ product_id, name, size, quantity, price, image }], shipping, total, stripe_payment_intent_id }
 */
router.post("/", requireAuth, async (req, res) => {
  const { items, shipping, total, stripe_payment_intent_id } = req.body;

  if (!items?.length || !total) {
    return res.status(400).json({ error: "items and total are required" });
  }

  try {
    // Insert the order
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert([{
        user_id:                    req.auth.userId,
        total:                      Number(total),
        status:                     "processing",
        shipping_address:           shipping || null,
        stripe_payment_intent_id:   stripe_payment_intent_id || null,
      }])
      .select()
      .single();

    if (orderError) throw orderError;

    // Insert order items
    const orderItems = items.map((item) => ({
      order_id:   order.id,
      product_id: item.product_id,
      name:       item.name,
      size:       item.size,
      quantity:   item.quantity,
      price:      item.price,
      image:      item.image || "",
    }));

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(orderItems);

    if (itemsError) throw itemsError;

    res.status(201).json({ ...order, order_items: orderItems });
  } catch (err) {
    console.error("[POST /orders]", err.message);
    res.status(500).json({ error: "Failed to create order" });
  }
});

export default router;
