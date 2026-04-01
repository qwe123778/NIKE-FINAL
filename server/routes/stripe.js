import { Router } from "express";
import Stripe from "stripe";
import supabase from "../lib/supabase.js";
import requireAuth from "../middleware/requireAuth.js";

const router = Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

/**
 * POST /api/stripe/create-payment-intent
 * Auth required — creates a Stripe PaymentIntent.
 * Body: { items: [{ product_id, quantity, size }] }
 * Returns: { clientSecret }
 */
router.post("/create-payment-intent", requireAuth, async (req, res) => {
  const { items } = req.body;

  if (!items?.length) {
    return res.status(400).json({ error: "items array is required" });
  }

  try {
    // Fetch live prices from Supabase so the client can't tamper
    const ids = items.map((i) => i.product_id);
    const { data: products, error } = await supabase
      .from("products")
      .select("id, price, name")
      .in("id", ids);

    if (error) throw error;

    const priceMap = Object.fromEntries(products.map((p) => [p.id, p]));

    let subtotal = 0;
    for (const item of items) {
      const product = priceMap[item.product_id];
      if (!product) return res.status(400).json({ error: `Product ${item.product_id} not found` });
      subtotal += product.price * item.quantity;
    }

    const shippingCost = subtotal > 150 ? 0 : 12.99;
    const tax          = subtotal * 0.08;
    const total        = subtotal + shippingCost + tax;

    // Stripe amounts are in cents
    const amountCents = Math.round(total * 100);

    const paymentIntent = await stripe.paymentIntents.create({
      amount:   amountCents,
      currency: "usd",
      metadata: {
        user_id: req.auth.userId,
        items:   JSON.stringify(items.map((i) => ({
          product_id: i.product_id,
          name:       priceMap[i.product_id]?.name,
          quantity:   i.quantity,
          size:       i.size,
        }))),
      },
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      total,
      subtotal,
      shippingCost,
      tax,
    });
  } catch (err) {
    console.error("[POST /stripe/create-payment-intent]", err.message);
    res.status(500).json({ error: "Failed to create payment intent" });
  }
});

/**
 * POST /api/stripe/webhook
 * Stripe webhook — listens for payment_intent.succeeded to mark orders as paid.
 * IMPORTANT: this route needs raw body (not JSON-parsed), set in index.js.
 */
router.post("/webhook", async (req, res) => {
  const sig = req.headers["stripe-signature"];

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,          // raw buffer
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("[Stripe webhook] Signature verification failed:", err.message);
    return res.status(400).json({ error: `Webhook error: ${err.message}` });
  }

  if (event.type === "payment_intent.succeeded") {
    const intent = event.data.object;
    console.log("[Stripe webhook] Payment succeeded:", intent.id);

    // Update order status to "paid"
    const { error } = await supabase
      .from("orders")
      .update({ status: "paid", updated_at: new Date().toISOString() })
      .eq("stripe_payment_intent_id", intent.id);

    if (error) {
      console.error("[Stripe webhook] Failed to update order:", error.message);
    }
  }

  if (event.type === "payment_intent.payment_failed") {
    const intent = event.data.object;
    console.warn("[Stripe webhook] Payment failed:", intent.id);

    await supabase
      .from("orders")
      .update({ status: "failed", updated_at: new Date().toISOString() })
      .eq("stripe_payment_intent_id", intent.id);
  }

  res.json({ received: true });
});

export default router;
