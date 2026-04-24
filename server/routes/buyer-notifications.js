import { Router } from "express";
import supabase from "../lib/supabase.js";
import requireAuth from "../middleware/requireAuth.js";

const router = Router();

// GET /api/buyer-notifications
router.get("/", requireAuth, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("buyer_notifications")
      .select("*")
      .eq("buyer_id", req.auth.userId)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/buyer-notifications/:id/read
router.patch("/:id/read", requireAuth, async (req, res) => {
  try {
    await supabase.from("buyer_notifications")
      .update({ read: true })
      .eq("id", req.params.id)
      .eq("buyer_id", req.auth.userId);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/buyer-notifications/read-all
router.patch("/read-all", requireAuth, async (req, res) => {
  try {
    await supabase.from("buyer_notifications")
      .update({ read: true })
      .eq("buyer_id", req.auth.userId);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;