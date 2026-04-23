import { Router } from "express";
import supabase from "../lib/supabase.js";
import requireAuth, { requireSeller } from "../middleware/requireAuth.js";

const router = Router();

// GET /api/sellers/notifications — get unread notifications for this seller
router.get("/notifications", requireSeller, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("seller_notifications")
      .select("*")
      .eq("seller_id", req.auth.userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error("[GET /sellers/notifications]", err.message);
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/sellers/notifications/:id/read — mark notification as read
router.patch("/notifications/:id/read", requireSeller, async (req, res) => {
  try {
    const { error } = await supabase
      .from("seller_notifications")
      .update({ read: true })
      .eq("id", req.params.id)
      .eq("seller_id", req.auth.userId);

    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    console.error("[PATCH /sellers/notifications/:id/read]", err.message);
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/sellers/notifications/read-all — mark all as read
router.patch("/notifications/read-all", requireSeller, async (req, res) => {
  try {
    const { error } = await supabase
      .from("seller_notifications")
      .update({ read: true })
      .eq("seller_id", req.auth.userId);

    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    console.error("[PATCH /sellers/notifications/read-all]", err.message);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/sellers/stats — balance, total orders, total products sold
router.get("/stats", requireSeller, async (req, res) => {
  try {
    // Get seller's total earnings from users table
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("total_earnings")
      .eq("id", req.auth.userId)
      .single();

    if (userError) throw userError;

    // Get total number of orders containing this seller's products
    const { data: notifications } = await supabase
      .from("seller_notifications")
      .select("order_id, quantity, price")
      .eq("seller_id", req.auth.userId);

    const totalOrders   = new Set(notifications?.map((n) => n.order_id)).size;
    const totalUnitsSold = notifications?.reduce((sum, n) => sum + Number(n.quantity), 0) || 0;

    res.json({
      balance:        Number(userData?.total_earnings || 0),
      totalOrders,
      totalUnitsSold,
    });
  } catch (err) {
    console.error("[GET /sellers/stats]", err.message);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/sellers/orders — all orders containing this seller's products
router.get("/orders", requireSeller, async (req, res) => {
  try {
    const { data: notifications, error } = await supabase
      .from("seller_notifications")
      .select("*")
      .eq("seller_id", req.auth.userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    res.json(notifications);
  } catch (err) {
    console.error("[GET /sellers/orders]", err.message);
    res.status(500).json({ error: err.message });
  }
});

export default router;