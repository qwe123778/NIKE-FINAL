import "dotenv/config";
import express from "express";
import cors from "cors";

import authRoutes    from "./routes/auth.js";
import productRoutes from "./routes/products.js";
import orderRoutes   from "./routes/orders.js";
import stripeRoutes  from "./routes/stripe.js";

const app  = express();
const PORT = process.env.PORT || 4000;

// ─── CORS ────────────────────────────────────────────────────────────────────
const isAllowedOrigin = (origin) => {
  if (!origin) return true;                              // Postman, curl, server-to-server
  if (origin.endsWith(".vercel.app")) return true;       // all Vercel deployments forever
  if (origin === "http://localhost:5173") return true;   // local frontend
  if (origin === "http://localhost:4000") return true;   // local server
  if (origin === process.env.CLIENT_URL) return true;    // explicit env override
  return false;
};

const corsOptions = {
  origin: (origin, callback) => {
    if (isAllowedOrigin(origin)) return callback(null, true);
    console.error(`[CORS] Blocked: ${origin}`);
    return callback(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

// Handle preflight for ALL routes — must be before any other middleware
app.options("*", cors(corsOptions));
app.use(cors(corsOptions));

// ─── Body parsing ─────────────────────────────────────────────────────────────
// Stripe webhook needs raw buffer — must be registered BEFORE express.json()
app.post(
  "/api/stripe/webhook",
  express.raw({ type: "application/json" }),
  (req, _res, next) => next()
);

app.use(express.json());

// ─── Health check ─────────────────────────────────────────────────────────────
app.get("/api/health", (_req, res) => {
  res.json({
    status:   "ok",
    timestamp: new Date().toISOString(),
  });
});

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use("/api/auth",     authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders",   orderRoutes);
app.use("/api/stripe",   stripeRoutes);

// ─── Global error handler ────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error("[Server error]", err.message);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`\n🚀  Server running on http://localhost:${PORT}\n`);
});