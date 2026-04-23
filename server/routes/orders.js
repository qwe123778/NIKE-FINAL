import { Router } from "express";
import supabase from "../lib/supabase.js";
import requireAuth from "../middleware/requireAuth.js";

const router = Router();

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
    res.status(500).json({ error: err.message });
  }
});

router.post("/", requireAuth, async (req, res) => {
  const { items, shipping, total, stripe_payment_intent_id } = req.body;

  if (!items?.length || !total) {
    return res.status(400).json({ error: "items and total are required" });
  }

  try {
    const { userId, email, name, role } = req.auth;

    // Ensure buyer exists in users table
    await supabase
      .from("users")
      .upsert(
        { id: userId, email, name, role, updated_at: new Date().toISOString() },
        { onConflict: "id" }
      );

    // Create the order
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert([{
        user_id:                  userId,
        total:                    Number(total),
        status:                   "processing",
        shipping_address:         shipping || null,
        stripe_payment_intent_id: stripe_payment_intent_id || null,
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

    // ── Notify each seller whose product was purchased ──────────────
    for (const item of items) {
      if (!item.product_id) continue;

      // Get the product to find the seller
      const { data: product } = await supabase
        .from("products")
        .select("seller_id, name, price")
        .eq("id", item.product_id)
        .single();

      if (!product?.seller_id) continue;

      // Don't notify if the buyer is the seller
      if (product.seller_id === userId) continue;

      const itemTotal = Number(item.price) * Number(item.quantity);

      // Create notification for the seller
      const { error: notifError } = await supabase
        .from("seller_notifications")
        .insert([{
          seller_id:        product.seller_id,
          order_id:         order.id,
          product_id:       item.product_id,
          product_name:     item.name,
          buyer_name:       name,
          quantity:         item.quantity,
          size:             item.size,
          price:            itemTotal,
          shipping_address: shipping || null,
          read:             false,
        }]);

      if (notifError) {
        console.error("[POST /orders] notification error:", notifError.message);
      }

      // Update seller's total earnings
      const { data: sellerData } = await supabase
        .from("users")
        .select("total_earnings")
        .eq("id", product.seller_id)
        .single();

      const currentEarnings = Number(sellerData?.total_earnings || 0);

      await supabase
        .from("users")
        .update({ total_earnings: currentEarnings + itemTotal })
        .eq("id", product.seller_id);
    }

    res.status(201).json({ ...order, order_items: orderItems });
  } catch (err) {
    console.error("[POST /orders]", err.message);
    res.status(500).json({ error: err.message });
  }
});

export default router;