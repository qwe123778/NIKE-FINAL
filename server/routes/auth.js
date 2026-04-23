import express from "express";
import { clerkClient } from "../lib/clerk.js";
import requireAuth from "../middleware/requireAuth.js";
import supabase from "../lib/supabase.js";

const router = express.Router();

router.get("/me", requireAuth, async (req, res) => {
  const { userId, role, email, name } = req.auth;

  // Upsert user into Supabase — log any errors but don't block response
  const { error: upsertError } = await supabase
    .from("users")
    .upsert(
      { id: userId, email, name, role, updated_at: new Date().toISOString() },
      { onConflict: "id" }
    );

  if (upsertError) {
    console.error("[GET /auth/me] Supabase upsert failed:", upsertError.message, upsertError.details, upsertError.hint);
  } else {
    console.log("[GET /auth/me] User upserted:", userId, email, role);
  }

  res.json({ id: userId, email, name, role });
});

router.post("/set-role", requireAuth, async (req, res) => {
  const { role } = req.body;

  if (!["buyer", "seller"].includes(role)) {
    return res.status(400).json({ error: "Invalid role. Must be buyer or seller." });
  }

  try {
    const { userId, email, name } = req.auth;

    // Update role in Clerk
    await clerkClient.users.updateUser(userId, {
      publicMetadata: { role },
    });

    // Upsert into Supabase
    const { error: upsertError } = await supabase
      .from("users")
      .upsert(
        { id: userId, email, name, role, updated_at: new Date().toISOString() },
        { onConflict: "id" }
      );

    if (upsertError) {
      console.error("[POST /auth/set-role] Supabase upsert failed:", upsertError.message, upsertError.details, upsertError.hint);
    } else {
      console.log("[POST /auth/set-role] Role updated:", userId, role);
    }

    res.json({ success: true, role });
  } catch (err) {
    console.error("[POST /auth/set-role]", err.message);
    res.status(500).json({ error: "Failed to update role" });
  }
});

export default router;