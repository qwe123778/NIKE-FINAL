import { Router } from "express";
import supabase from "../lib/supabase.js";
import requireAuth from "../middleware/requireAuth.js";

const router = Router();

// GET /api/chat/:orderId — get all messages for an order
router.get("/:orderId", requireAuth, async (req, res) => {
  try {
    // Verify user is part of this order (buyer or seller)
    const { data: order } = await supabase
      .from("orders")
      .select("user_id")
      .eq("id", req.params.orderId)
      .single();

    const { data: sellerNotif } = await supabase
      .from("seller_notifications")
      .select("seller_id")
      .eq("order_id", req.params.orderId)
      .limit(1)
      .single();

    const isBuyer  = order?.user_id === req.auth.userId;
    const isSeller = sellerNotif?.seller_id === req.auth.userId;

    if (!isBuyer && !isSeller) {
      return res.status(403).json({ error: "Access denied" });
    }

    const { data, error } = await supabase
      .from("order_messages")
      .select("*")
      .eq("order_id", req.params.orderId)
      .order("created_at", { ascending: true });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error("[GET /chat/:orderId]", err.message);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/chat/:orderId — send a message
router.post("/:orderId", requireAuth, async (req, res) => {
  const { message } = req.body;
  if (!message?.trim()) {
    return res.status(400).json({ error: "Message cannot be empty" });
  }

  try {
    // Verify user is part of this order
    const { data: order } = await supabase
      .from("orders")
      .select("user_id")
      .eq("id", req.params.orderId)
      .single();

    const { data: sellerNotif } = await supabase
      .from("seller_notifications")
      .select("seller_id")
      .eq("order_id", req.params.orderId)
      .limit(1)
      .single();

    const isBuyer  = order?.user_id === req.auth.userId;
    const isSeller = sellerNotif?.seller_id === req.auth.userId;

    if (!isBuyer && !isSeller) {
      return res.status(403).json({ error: "Access denied" });
    }

    // Insert message
    const { data, error } = await supabase
      .from("order_messages")
      .insert([{
        order_id:    req.params.orderId,
        sender_id:   req.auth.userId,
        sender_name: req.auth.name,
        message:     message.trim(),
      }])
      .select()
      .single();

    if (error) throw error;

    // Notify the other party
    const recipientId = isBuyer ? sellerNotif?.seller_id : order?.user_id;
    if (recipientId) {
      await supabase.from("buyer_notifications").insert([{
        buyer_id: recipientId,
        type:     "message",
        title:    `New message from ${req.auth.name}`,
        message:  message.trim().slice(0, 100),
        link:     `/orders/${req.params.orderId}/chat`,
        read:     false,
      }]);
    }

    res.status(201).json(data);
  } catch (err) {
    console.error("[POST /chat/:orderId]", err.message);
    res.status(500).json({ error: err.message });
  }
});

export default router;