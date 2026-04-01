// import "dotenv/config";
// import express from "express";
// import cors from "cors";

// import authRoutes    from "./routes/auth.js";
// import productRoutes from "./routes/products.js";
// import orderRoutes   from "./routes/orders.js";
// import stripeRoutes  from "./routes/stripe.js";

// const app  = express();
// const PORT = process.env.PORT || 4000;

// // ─── CORS ────────────────────────────────────────────────────────────────────
// app.use(cors({
//   origin:       [/^http:\/\/localhost:\d+$/],
//   credentials: true,
// }));

// // ─── Body parsing ─────────────────────────────────────────────────────────────
// // Stripe webhook needs the raw buffer — register it BEFORE express.json()
// app.post(
//   "/api/stripe/webhook",
//   express.raw({ type: "application/json" }),
//   (req, _res, next) => { next(); }
// );

// app.use(express.json());

// // ─── Health check ─────────────────────────────────────────────────────────────
// app.get("/api/health", (_req, res) => {
//   res.json({ status: "ok", timestamp: new Date().toISOString() });
// });

// // ─── Routes ───────────────────────────────────────────────────────────────────
// app.use("/api/auth",     authRoutes);
// app.use("/api/products", productRoutes);
// app.use("/api/orders",   orderRoutes);
// app.use("/api/stripe",   stripeRoutes);

// // ─── Global error handler ────────────────────────────────────────────────────
// app.use((err, _req, res, _next) => {
//   console.error("[Server error]", err.message);
//   res.status(500).json({ error: "Internal server error" });
// });

// app.listen(PORT, () => {
//   console.log(`\n🚀  Server running on http://localhost:${PORT}`);
//   console.log(`   Health: http://localhost:${PORT}/api/health\n`);
// });
// server.js
import "dotenv/config";
import express from "express";
import cors from "cors";

import authRoutes from "./routes/auth.js";
import productRoutes from "./routes/products.js";
import orderRoutes from "./routes/orders.js";
import stripeRoutes from "./routes/stripe.js";

const app = express();
const PORT = process.env.PORT || 4000;

// ─── CORS ────────────────────────────────────────────────────────────────────
app.use(cors({
  origin: [/^http:\/\/localhost:\d+$/, "https://nike-final-ten.vercel.app/" ],
  credentials: true,
}));

// ─── Body parsing ─────────────────────────────────────────────────────────────
// Stripe webhook needs the raw buffer — register it BEFORE express.json()
app.post(
  "/api/stripe/webhook",
  express.raw({ type: "application/json" }),
  (req, _res, next) => { next(); }
);

// Increase JSON and URL-encoded payload size to allow large product uploads
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// ─── Health check ─────────────────────────────────────────────────────────────
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/stripe", stripeRoutes);

// ─── Global error handler ────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error("[Server error]", err.message);
  res.status(500).json({ error: "Internal server error" });
});

// ─── Start server ─────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀  Server running on http://localhost:${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/api/health\n`);
});