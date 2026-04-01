// import { Router } from "express";
// import requireAuth from "../middleware/requireAuth.js";
// import { clerkClient } from "../lib/clerk.js";
// import supabase from "../lib/supabase.js";

// const router = Router();

// router.get("/me", requireAuth, async (req, res) => {
//   try {
//     const { userId, role, email, name } = req.auth;

//     await supabase.from("users").upsert(
//       { id: userId, email, name, role, updated_at: new Date().toISOString() },
//       { onConflict: "id" }
//     );

//     res.json({ id: userId, email, name, role });
//   } catch (err) {
//     console.error("[GET /auth/me]", err.message);
//     res.status(500).json({ error: "Failed to fetch user" });
//   }
// });

// router.post("/set-role", requireAuth, async (req, res) => {
//   const { role } = req.body;

//   if (!["buyer", "seller"].includes(role)) {
//     return res.status(400).json({ error: "Invalid role. Must be buyer or seller." });
//   }

//   try {
//     const { userId, email, name } = req.auth;

//     // update role in Clerk
//     await clerkClient.users.updateUser(userId, {
//       publicMetadata: { role },
//     });

//     // update role in Supabase
//     await supabase
//       .from("users")
//       .upsert(
//         { id: userId, email, name, role, updated_at: new Date().toISOString() },
//         { onConflict: "id" }
//       );

//     res.json({ success: true, role });
//   } catch (err) {
//     console.error("[POST /auth/set-role]", err.message);
//     res.status(500).json({ error: "Failed to update role" });
//   }
// });

// export default router;
import express from "express";
import { clerkClient, verifyToken } from "../lib/clerk.js";
import requireAuth from "../middleware/requireAuth.js";

const router = express.Router();

// Get current user info
router.get("/me", requireAuth, async (req, res) => {
  res.json(req.auth);
});

// Switch role
router.post("/set-role", requireAuth, async (req, res) => {
  const { role } = req.body;
  if (!["buyer", "seller"].includes(role)) {
    return res.status(400).json({ error: "Invalid role" });
  }

  try {
    await clerkClient.users.updateUserMetadata(req.auth.userId, {
      publicMetadata: { role },
    });
    res.json({ role });
  } catch (err) {
    console.error("[set-role]", err.message);
    res.status(500).json({ error: "Failed to update role" });
  }
});

export default router;