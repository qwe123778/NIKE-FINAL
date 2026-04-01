// middleware/requireAuth.js
import { clerkClient, verifyToken } from "../lib/clerk.js";

// Middleware to require authentication
const requireAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No token provided" });
  }

  const token = authHeader.replace("Bearer ", "");

  try {
    const payload = await verifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY,
    });

    const user = await clerkClient.users.getUser(payload.sub);

    req.auth = {
      userId: payload.sub,
      sessionId: payload.sid,
      role: user.publicMetadata?.role || "buyer",
      email: user.emailAddresses?.[0]?.emailAddress || "",
      name: user.fullName || user.username || "User",
    };

    next();
  } catch (err) {
    console.error("[requireAuth]", err.message);
    return res.status(401).json({ error: "Authentication failed" });
  }
};

// Middleware to require seller role
const requireSeller = async (req, res, next) => {
  await requireAuth(req, res, () => {
    if (req.auth.role !== "seller") {
      return res.status(403).json({ error: "Seller access required" });
    }
    next();
  });
};

// ✅ Export both default and named
export default requireAuth;
export { requireSeller };