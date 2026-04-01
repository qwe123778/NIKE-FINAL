import { clerkClient, verifyToken } from "../lib/clerk.js";

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

export default requireAuth;