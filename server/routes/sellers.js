import { Router } from "express";
import supabase from "../lib/supabase.js";
import requireAuth, { requireSeller } from "../middleware/requireAuth.js";

const router = Router();

// ── Stats ─────────────────────────────────────────────────────────────────
router.get("/stats", requireSeller, async (req, res) => {
  try {
    const { data: userData } = await supabase
      .from("users")
      .select("total_earnings")
      .eq("id", req.auth.userId)
      .single();

    const { data: notifications } = await supabase
      .from("seller_notifications")
      .select("order_id, quantity, price")
      .eq("seller_id", req.auth.userId);

    const totalOrders    = new Set(notifications?.map((n) => n.order_id)).size;
    const totalUnitsSold = notifications?.reduce((sum, n) => sum + Number(n.quantity), 0) || 0;

    res.json({
      balance:       Number(userData?.total_earnings || 0),
      totalOrders,
      totalUnitsSold,
    });
  } catch (err) {
    console.error("[GET /sellers/stats]", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── Notifications ─────────────────────────────────────────────────────────
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
    res.status(500).json({ error: err.message });
  }
});

router.patch("/notifications/:id/read", requireSeller, async (req, res) => {
  try {
    await supabase.from("seller_notifications").update({ read: true })
      .eq("id", req.params.id).eq("seller_id", req.auth.userId);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch("/notifications/read-all", requireSeller, async (req, res) => {
  try {
    await supabase.from("seller_notifications").update({ read: true })
      .eq("seller_id", req.auth.userId);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Sales ─────────────────────────────────────────────────────────────────
router.get("/orders", requireSeller, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("seller_notifications")
      .select("*")
      .eq("seller_id", req.auth.userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Public profile ────────────────────────────────────────────────────────
router.get("/profile/:sellerId", async (req, res) => {
  try {
    const { data: seller, error } = await supabase
      .from("users")
      .select("id, name, role, created_at")
      .eq("id", req.params.sellerId)
      .eq("role", "seller")
      .single();

    if (error || !seller) return res.status(404).json({ error: "Seller not found" });

    const { data: products } = await supabase
      .from("products")
      .select("*")
      .eq("seller_id", req.params.sellerId)
      .order("created_at", { ascending: false });

    const { count: followerCount } = await supabase
      .from("seller_follows")
      .select("*", { count: "exact", head: true })
      .eq("seller_id", req.params.sellerId);

    res.json({ seller, products: products || [], followerCount: followerCount || 0 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Follow / Unfollow ─────────────────────────────────────────────────────
router.post("/follow/:sellerId", requireAuth, async (req, res) => {
  try {
    const { error } = await supabase
      .from("seller_follows")
      .insert([{ buyer_id: req.auth.userId, seller_id: req.params.sellerId }]);

    if (error) throw error;
    res.json({ success: true, following: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/follow/:sellerId", requireAuth, async (req, res) => {
  try {
    await supabase.from("seller_follows")
      .delete()
      .eq("buyer_id", req.auth.userId)
      .eq("seller_id", req.params.sellerId);
    res.json({ success: true, following: false });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/follow/:sellerId", requireAuth, async (req, res) => {
  try {
    const { data } = await supabase
      .from("seller_follows")
      .select("id")
      .eq("buyer_id", req.auth.userId)
      .eq("seller_id", req.params.sellerId)
      .single();
    res.json({ following: !!data });
  } catch {
    res.json({ following: false });
  }
});

export default router;