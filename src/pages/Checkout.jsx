// import { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { motion } from "framer-motion";
// import { ArrowLeft, CreditCard, Truck, CheckCircle, Lock, Store } from "lucide-react";
// import { Link } from "react-router-dom";
// import { loadStripe } from "@stripe/stripe-js";
// import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
// import Navbar from "@/components/Navbar";
// import Footer from "@/components/Footer";
// import { useCart } from "@/context/CartContext";
// import { useAuth } from "@/context/AuthContext";
// import { useToast } from "@/hooks/use-toast";
// import apiFetch from "@/lib/api";

// const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

// const STEPS = ["shipping", "payment", "confirmation"];

// // ── Order Summary sidebar ─────────────────────────────────────────────────
// const OrderSummary = ({ items, totalPrice }) => {
//   const shippingCost = totalPrice > 150 ? 0 : 12.99;
//   const tax          = totalPrice * 0.08;
//   const grandTotal   = totalPrice + shippingCost + tax;

//   return (
//     <div className="bg-secondary border border-foreground/10 p-6 rounded-[4px] sticky top-24">
//       <h3 className="font-display text-lg not-italic mb-4">Order Summary</h3>
//       <div className="space-y-4 mb-6">
//         {items.map((item) => (
//           <div key={`${item.product.id}-${item.size}`} className="flex gap-3">
//             <div className="w-14 h-14 bg-background overflow-hidden shrink-0 rounded-[4px]">
//               <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
//             </div>
//             <div className="flex-1 min-w-0">
//               <p className="font-mono-tech text-sm truncate">{item.product.name}</p>
//               <p className="font-mono-tech text-xs text-muted-foreground">Size {item.size} × {item.quantity}</p>
//             </div>
//             <p className="font-mono text-sm tabular-nums">${(item.product.price * item.quantity).toFixed(2)}</p>
//           </div>
//         ))}
//       </div>
//       <div className="border-t border-foreground/10 pt-4 space-y-2">
//         <div className="flex justify-between font-mono-tech text-sm">
//           <span className="text-muted-foreground">Subtotal</span>
//           <span className="tabular-nums">${totalPrice.toFixed(2)}</span>
//         </div>
//         <div className="flex justify-between font-mono-tech text-sm">
//           <span className="text-muted-foreground">Shipping</span>
//           <span className="tabular-nums">{shippingCost === 0 ? "Free" : `$${shippingCost.toFixed(2)}`}</span>
//         </div>
//         <div className="flex justify-between font-mono-tech text-sm">
//           <span className="text-muted-foreground">Tax (8%)</span>
//           <span className="tabular-nums">${tax.toFixed(2)}</span>
//         </div>
//         <div className="flex justify-between font-mono text-lg pt-2 border-t border-foreground/10">
//           <span>Total</span>
//           <span className="tabular-nums text-primary">${grandTotal.toFixed(2)}</span>
//         </div>
//       </div>
//       {totalPrice <= 150 && (
//         <p className="font-mono-tech text-xs text-muted-foreground mt-3">
//           Add ${(150 - totalPrice).toFixed(2)} more for free shipping
//         </p>
//       )}
//     </div>
//   );
// };

// // ── Stripe Payment Form ───────────────────────────────────────────────────
// const StripePaymentForm = ({ onSuccess, totalPrice }) => {
//   const stripe      = useStripe();
//   const elements    = useElements();
//   const { toast }   = useToast();
//   const [loading, setLoading] = useState(false);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!stripe || !elements) return;

//     setLoading(true);
//     try {
//       const { error, paymentIntent } = await stripe.confirmPayment({
//         elements,
//         confirmParams: { return_url: `${window.location.origin}/account` },
//         redirect: "if_required",
//       });

//       if (error) {
//         toast({ title: "Payment failed", description: error.message });
//       } else if (paymentIntent?.status === "succeeded") {
//         onSuccess(paymentIntent.id);
//       }
//     } catch (err) {
//       toast({ title: "Error", description: err.message });
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <form onSubmit={handleSubmit} className="space-y-5">
//       <h2 className="font-display text-2xl not-italic mb-6">Payment</h2>
//       <div className="flex items-center gap-2 text-muted-foreground mb-4">
//         <Lock className="w-3 h-3" />
//         <span className="font-mono-tech text-xs">Secured by Stripe — no card data touches our server</span>
//       </div>
//       <div className="bg-secondary border border-foreground/10 p-4 rounded-[4px]">
//         <PaymentElement
//           options={{
//             layout: "tabs",
//             appearance: {
//               theme: "night",
//               variables: {
//                 colorPrimary:      "#ccff33",
//                 colorBackground:   "#1e1e1e",
//                 colorText:         "#f9f9f9",
//                 colorDanger:       "#ff4466",
//                 borderRadius:      "4px",
//                 fontFamily:        "inherit",
//               },
//             },
//           }}
//         />
//       </div>
//       <button
//         type="submit"
//         disabled={!stripe || loading}
//         className="action-button w-full disabled:opacity-50 disabled:cursor-not-allowed"
//       >
//         <span>{loading ? "Processing..." : `Pay $${(totalPrice + (totalPrice > 150 ? 0 : 12.99) + totalPrice * 0.08).toFixed(2)}`}</span>
//         <span className="font-mono text-sm">→</span>
//       </button>
//     </form>
//   );
// };

// // ── Main Checkout Page ────────────────────────────────────────────────────
// const Checkout = () => {
//   const { items, totalPrice, clearCart } = useCart();
//   const { user, addOrder, isSeller }     = useAuth();
//   const { toast }                        = useToast();
//   const navigate                         = useNavigate();

//   const [step, setStep]               = useState("shipping");
//   const [clientSecret, setClientSecret] = useState(null);
//   const [orderNumber, setOrderNumber]   = useState(null);
//   const [shipping, setShipping]         = useState({
//     fullName: user?.name || "",
//     address: "", city: "", state: "", zip: "", phone: "",
//   });

//   const shippingCost = totalPrice > 150 ? 0 : 12.99;
//   const tax          = totalPrice * 0.08;
//   const grandTotal   = totalPrice + shippingCost + tax;

//   const inputClass =
//     "w-full bg-secondary border border-foreground/10 px-4 py-3 font-mono text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors rounded-[4px]";

//   // Sellers cannot checkout
//   if (isSeller) {
//     return (
//       <>
//         <Navbar />
//         <main className="pt-16 min-h-screen flex flex-col items-center justify-center px-6 gap-5">
//           <Store className="w-14 h-14 text-muted-foreground/30" />
//           <h2 className="font-display text-3xl not-italic">Seller Mode Active</h2>
//           <p className="font-mono-tech text-muted-foreground text-center max-w-sm">
//             You can't checkout while in Seller Mode. Switch to Buyer Mode in your account settings.
//           </p>
//           <Link to="/account" className="action-button">
//             <span>Go to Account Settings</span>
//             <span className="font-mono text-sm">→</span>
//           </Link>
//         </main>
//         <Footer />
//       </>
//     );
//   }

//   if (items.length === 0 && step !== "confirmation") {
//     return (
//       <>
//         <Navbar />
//         <main className="pt-16 min-h-screen flex flex-col items-center justify-center px-6">
//           <p className="font-mono-tech text-muted-foreground text-lg">Your cart is empty.</p>
//           <button onClick={() => navigate("/shop")} className="action-button mt-6">
//             <span>Browse Shop</span>
//             <span className="font-mono text-sm">→</span>
//           </button>
//         </main>
//         <Footer />
//       </>
//     );
//   }

//   // Step 1 — shipping form → calls server to create Stripe PaymentIntent
//   const handleShippingSubmit = async (e) => {
//     e.preventDefault();
//     if (!shipping.fullName || !shipping.address || !shipping.city || !shipping.state || !shipping.zip) {
//       toast({ title: "Missing info", description: "Please fill in all shipping fields." });
//       return;
//     }

//     try {
//       const payload = await apiFetch("/api/stripe/create-payment-intent", {
//         method: "POST",
//         body: JSON.stringify({
//           items: items.map((i) => ({
//             product_id: i.product.id,
//             quantity:   i.quantity,
//             size:       i.size,
//           })),
//         }),
//       });

//       setClientSecret(payload.clientSecret);
//       setStep("payment");
//     } catch (err) {
//       toast({ title: "Error", description: err.message });
//     }
//   };

//   // Step 2 — after Stripe confirms, save order to server
//   const handlePaymentSuccess = async (stripePaymentIntentId) => {
//     try {
//       const order = await apiFetch("/api/orders", {
//         method: "POST",
//         body: JSON.stringify({
//           items: items.map((i) => ({
//             product_id: i.product.id,
//             name:       i.product.name,
//             size:       i.size,
//             quantity:   i.quantity,
//             price:      i.product.price,
//             image:      i.product.image,
//           })),
//           shipping,
//           total:                      grandTotal,
//           stripe_payment_intent_id:   stripePaymentIntentId,
//         }),
//       });

//       setOrderNumber(order.id);
//       addOrder(order);
//       clearCart();
//       setStep("confirmation");
//       toast({ title: "Order confirmed!", description: `Order ${order.id}` });
//     } catch (err) {
//       // Payment succeeded but order save failed — still show confirmation
//       setOrderNumber(`ORD-${Date.now().toString(36).toUpperCase()}`);
//       clearCart();
//       setStep("confirmation");
//       toast({ title: "Order placed!", description: "Payment received." });
//     }
//   };

//   const stepDefs = [
//     { key: "shipping",     label: "Shipping",  Icon: Truck },
//     { key: "payment",      label: "Payment",   Icon: CreditCard },
//     { key: "confirmation", label: "Confirmed", Icon: CheckCircle },
//   ];

//   return (
//     <>
//       <Navbar />
//       <main className="pt-16 min-h-screen">
//         <div className="max-w-5xl mx-auto px-6 md:px-12 py-8">

//           {/* Back */}
//           {step !== "confirmation" && (
//             <button
//               onClick={() => step === "payment" ? setStep("shipping") : navigate(-1)}
//               className="inline-flex items-center gap-2 font-mono-tech text-muted-foreground hover:text-foreground transition-colors mb-8"
//             >
//               <ArrowLeft className="w-4 h-4" />
//               {step === "payment" ? "Back to Shipping" : "Back"}
//             </button>
//           )}

//           {/* Progress steps */}
//           <div className="flex items-center gap-3 mb-10">
//             {stepDefs.map(({ key, label, Icon }, i) => {
//               const isActive = STEPS.indexOf(key) <= STEPS.indexOf(step);
//               return (
//                 <div key={key} className="flex items-center gap-3">
//                   {i > 0 && <div className={`h-px w-8 md:w-16 transition-colors ${isActive ? "bg-primary" : "bg-foreground/10"}`} />}
//                   <div className="flex items-center gap-2">
//                     <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isActive ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>
//                       <Icon className="w-4 h-4" />
//                     </div>
//                     <span className={`font-mono-tech text-sm hidden md:inline ${isActive ? "text-foreground" : "text-muted-foreground"}`}>{label}</span>
//                   </div>
//                 </div>
//               );
//             })}
//           </div>

//           <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
//             <div className="lg:col-span-7">

//               {/* Step 1 — Shipping */}
//               {step === "shipping" && (
//                 <motion.form key="shipping" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
//                   onSubmit={handleShippingSubmit} className="space-y-5">
//                   <h2 className="font-display text-2xl not-italic mb-6">Shipping Address</h2>
//                   <input className={inputClass} placeholder="Full Name" value={shipping.fullName} onChange={(e) => setShipping({ ...shipping, fullName: e.target.value })} />
//                   <input className={inputClass} placeholder="Street Address" value={shipping.address} onChange={(e) => setShipping({ ...shipping, address: e.target.value })} />
//                   <div className="grid grid-cols-2 gap-4">
//                     <input className={inputClass} placeholder="City" value={shipping.city} onChange={(e) => setShipping({ ...shipping, city: e.target.value })} />
//                     <input className={inputClass} placeholder="State" value={shipping.state} onChange={(e) => setShipping({ ...shipping, state: e.target.value })} />
//                   </div>
//                   <div className="grid grid-cols-2 gap-4">
//                     <input className={inputClass} placeholder="ZIP Code" value={shipping.zip} onChange={(e) => setShipping({ ...shipping, zip: e.target.value })} />
//                     <input className={inputClass} placeholder="Phone (optional)" value={shipping.phone} onChange={(e) => setShipping({ ...shipping, phone: e.target.value })} />
//                   </div>
//                   <button type="submit" className="action-button w-full mt-4">
//                     <span>Continue to Payment</span>
//                     <span className="font-mono text-sm">→</span>
//                   </button>
//                 </motion.form>
//               )}

//               {/* Step 2 — Stripe Payment */}
//               {step === "payment" && clientSecret && (
//                 <motion.div key="payment" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
//                   <Elements
//                     stripe={stripePromise}
//                     options={{
//                       clientSecret,
//                       appearance: { theme: "night" },
//                     }}
//                   >
//                     <StripePaymentForm onSuccess={handlePaymentSuccess} totalPrice={totalPrice} />
//                   </Elements>
//                 </motion.div>
//               )}

//               {/* Step 3 — Confirmation */}
//               {step === "confirmation" && (
//                 <motion.div key="confirmation" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
//                   className="text-center py-12">
//                   <CheckCircle className="w-16 h-16 text-primary mx-auto mb-6" />
//                   <h2 className="font-display text-3xl not-italic mb-2">Order Confirmed</h2>
//                   {orderNumber && <p className="font-mono text-muted-foreground mb-1">{orderNumber}</p>}
//                   <p className="text-muted-foreground mt-4 max-w-md mx-auto">
//                     Payment received. Your order is being processed and you'll receive a confirmation email shortly.
//                   </p>
//                   <div className="flex gap-3 justify-center mt-8">
//                     <button onClick={() => navigate("/account")} className="action-button">
//                       <span>View Orders</span>
//                       <span className="font-mono text-sm">→</span>
//                     </button>
//                     <button onClick={() => navigate("/shop")}
//                       className="h-[60px] border border-foreground/20 bg-transparent font-bold uppercase tracking-tighter flex items-center justify-between px-6 hover:bg-foreground/10 transition-colors rounded-[4px]">
//                       Continue Shopping
//                     </button>
//                   </div>
//                 </motion.div>
//               )}
//             </div>

//             {/* Order summary */}
//             {step !== "confirmation" && (
//               <div className="lg:col-span-5">
//                 <OrderSummary items={items} totalPrice={totalPrice} />
//               </div>
//             )}
//           </div>
//         </div>
//       </main>
//       <Footer />
//     </>
//   );
// };

// export default Checkout;
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, CreditCard, Truck, CheckCircle, Lock, Store, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import apiFetch from "@/lib/api";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const STEPS = ["shipping", "payment", "confirmation"];

// ── Order Summary sidebar ─────────────────────────────────────────────────
const OrderSummary = ({ items, totalPrice }) => {
  const shippingCost = totalPrice > 150 ? 0 : 12.99;
  const tax          = totalPrice * 0.08;
  const grandTotal   = totalPrice + shippingCost + tax;

  return (
    <div className="bg-secondary border border-foreground/10 p-6 rounded-[4px] sticky top-24">
      <h3 className="font-display text-lg not-italic mb-4">Order Summary</h3>
      <div className="space-y-4 mb-6">
        {items.map((item) => (
          <div key={`${item.product.id}-${item.size}`} className="flex gap-3">
            <div className="w-14 h-14 bg-background overflow-hidden shrink-0 rounded-[4px]">
              <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-mono-tech text-sm truncate">{item.product.name}</p>
              <p className="font-mono-tech text-xs text-muted-foreground">Size {item.size} × {item.quantity}</p>
            </div>
            <p className="font-mono text-sm tabular-nums">${(item.product.price * item.quantity).toFixed(2)}</p>
          </div>
        ))}
      </div>
      <div className="border-t border-foreground/10 pt-4 space-y-2">
        <div className="flex justify-between font-mono-tech text-sm">
          <span className="text-muted-foreground">Subtotal</span>
          <span className="tabular-nums">${totalPrice.toFixed(2)}</span>
        </div>
        <div className="flex justify-between font-mono-tech text-sm">
          <span className="text-muted-foreground">Shipping</span>
          <span className="tabular-nums">{shippingCost === 0 ? "Free" : `$${shippingCost.toFixed(2)}`}</span>
        </div>
        <div className="flex justify-between font-mono-tech text-sm">
          <span className="text-muted-foreground">Tax (8%)</span>
          <span className="tabular-nums">${tax.toFixed(2)}</span>
        </div>
        <div className="flex justify-between font-mono text-lg pt-2 border-t border-foreground/10">
          <span>Total</span>
          <span className="tabular-nums text-primary">${grandTotal.toFixed(2)}</span>
        </div>
      </div>
      {totalPrice <= 150 && (
        <p className="font-mono-tech text-xs text-muted-foreground mt-3">
          Add ${(150 - totalPrice).toFixed(2)} more for free shipping
        </p>
      )}
    </div>
  );
};

// ── Stripe Payment Form ───────────────────────────────────────────────────
const StripePaymentForm = ({ onSuccess, totalPrice }) => {
  const stripe    = useStripe();
  const elements  = useElements();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: { return_url: `${window.location.origin}/account` },
        redirect: "if_required",
      });

      if (error) {
        toast({ title: "Payment failed", description: error.message });
      } else if (paymentIntent?.status === "succeeded") {
        onSuccess(paymentIntent.id);
      }
    } catch (err) {
      toast({ title: "Error", description: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <h2 className="font-display text-2xl not-italic mb-6">Payment</h2>
      <div className="flex items-center gap-2 text-muted-foreground mb-4">
        <Lock className="w-3 h-3" />
        <span className="font-mono-tech text-xs">Secured by Stripe — no card data touches our server</span>
      </div>
      <div className="bg-secondary border border-foreground/10 p-4 rounded-[4px]">
        <PaymentElement
          options={{
            layout: "tabs",
            appearance: {
              theme: "night",
              variables: {
                colorPrimary:    "#ccff33",
                colorBackground: "#1e1e1e",
                colorText:       "#f9f9f9",
                colorDanger:     "#ff4466",
                borderRadius:    "4px",
                fontFamily:      "inherit",
              },
            },
          }}
        />
      </div>
      <button
        type="submit"
        disabled={!stripe || loading}
        className="action-button w-full disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span>{loading ? "Processing..." : `Pay $${(totalPrice + (totalPrice > 150 ? 0 : 12.99) + totalPrice * 0.08).toFixed(2)}`}</span>
        <span className="font-mono text-sm">→</span>
      </button>
    </form>
  );
};

// ── Main Checkout Page ────────────────────────────────────────────────────
const Checkout = () => {
  const { items, totalPrice, clearCart } = useCart();
  const { user, addOrder, isSeller }     = useAuth();
  const { toast }                        = useToast();
  const navigate                         = useNavigate();

  // Load this user's saved addresses from localStorage
  const savedAddresses = (() => {
    if (!user?.id) return [];
    try {
      const s = localStorage.getItem(`nike-addresses-${user.id}`);
      return s ? JSON.parse(s) : [];
    } catch { return []; }
  })();

  const [showSavedAddresses, setShowSavedAddresses] = useState(false);
  const [step, setStep]                 = useState("shipping");
  const [clientSecret, setClientSecret] = useState(null);
  const [orderNumber, setOrderNumber]   = useState(null);

  // Auto-fill default address if user has one saved
  const [shipping, setShipping] = useState(() => {
    if (!user?.id) return { fullName: user?.name || "", address: "", city: "", state: "", zip: "", phone: "" };
    try {
      const s     = localStorage.getItem(`nike-addresses-${user.id}`);
      const addrs = s ? JSON.parse(s) : [];
      const def   = addrs.find((a) => a.isDefault) || addrs[0];
      if (def) return {
        fullName: def.name,
        address:  def.street,
        city:     def.city,
        state:    def.state,
        zip:      def.zip,
        phone:    "",
      };
    } catch {}
    return { fullName: user?.name || "", address: "", city: "", state: "", zip: "", phone: "" };
  });

  const shippingCost = totalPrice > 150 ? 0 : 12.99;
  const tax          = totalPrice * 0.08;
  const grandTotal   = totalPrice + shippingCost + tax;

  const inputClass =
    "w-full bg-secondary border border-foreground/10 px-4 py-3 font-mono text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors rounded-[4px]";

  // ── Sellers cannot checkout ───────────────────────────────────────────
  if (isSeller) {
    return (
      <>
        <Navbar />
        <main className="pt-16 min-h-screen flex flex-col items-center justify-center px-6 gap-5">
          <Store className="w-14 h-14 text-muted-foreground/30" />
          <h2 className="font-display text-3xl not-italic">Seller Mode Active</h2>
          <p className="font-mono-tech text-muted-foreground text-center max-w-sm">
            You can't checkout while in Seller Mode. Switch to Buyer Mode in your account settings.
          </p>
          <Link to="/account" className="action-button">
            <span>Go to Account Settings</span>
            <span className="font-mono text-sm">→</span>
          </Link>
        </main>
        <Footer />
      </>
    );
  }

  // ── Empty cart ────────────────────────────────────────────────────────
  if (items.length === 0 && step !== "confirmation") {
    return (
      <>
        <Navbar />
        <main className="pt-16 min-h-screen flex flex-col items-center justify-center px-6">
          <p className="font-mono-tech text-muted-foreground text-lg">Your cart is empty.</p>
          <button onClick={() => navigate("/shop")} className="action-button mt-6">
            <span>Browse Shop</span>
            <span className="font-mono text-sm">→</span>
          </button>
        </main>
        <Footer />
      </>
    );
  }

  // ── Step 1 — submit shipping, create Stripe PaymentIntent ─────────────
  const handleShippingSubmit = async (e) => {
    e.preventDefault();
    if (!shipping.fullName || !shipping.address || !shipping.city || !shipping.state || !shipping.zip) {
      toast({ title: "Missing info", description: "Please fill in all shipping fields." });
      return;
    }

    try {
      const payload = await apiFetch("/api/stripe/create-payment-intent", {
        method: "POST",
        body: JSON.stringify({
          items: items.map((i) => ({
            product_id: i.product.id,
            quantity:   i.quantity,
            size:       i.size,
          })),
        }),
      });

      setClientSecret(payload.clientSecret);
      setStep("payment");
    } catch (err) {
      toast({ title: "Error", description: err.message });
    }
  };

  // ── Step 2 — Stripe confirms, save order to server ────────────────────
  const handlePaymentSuccess = async (stripePaymentIntentId) => {
    try {
      const order = await apiFetch("/api/orders", {
        method: "POST",
        body: JSON.stringify({
          items: items.map((i) => ({
            product_id: i.product.id,
            name:       i.product.name,
            size:       i.size,
            quantity:   i.quantity,
            price:      i.product.price,
            image:      i.product.image,
          })),
          shipping,
          total:                    grandTotal,
          stripe_payment_intent_id: stripePaymentIntentId,
        }),
      });

      setOrderNumber(order.id);
      addOrder(order);
      clearCart();
      setStep("confirmation");
      toast({ title: "Order confirmed!", description: `Order ${order.id}` });
    } catch {
      setOrderNumber(`ORD-${Date.now().toString(36).toUpperCase()}`);
      clearCart();
      setStep("confirmation");
      toast({ title: "Order placed!", description: "Payment received." });
    }
  };

  const stepDefs = [
    { key: "shipping",     label: "Shipping",  Icon: Truck },
    { key: "payment",      label: "Payment",   Icon: CreditCard },
    { key: "confirmation", label: "Confirmed", Icon: CheckCircle },
  ];

  return (
    <>
      <Navbar />
      <main className="pt-16 min-h-screen">
        <div className="max-w-5xl mx-auto px-6 md:px-12 py-8">

          {/* Back */}
          {step !== "confirmation" && (
            <button
              onClick={() => step === "payment" ? setStep("shipping") : navigate(-1)}
              className="inline-flex items-center gap-2 font-mono-tech text-muted-foreground hover:text-foreground transition-colors mb-8"
            >
              <ArrowLeft className="w-4 h-4" />
              {step === "payment" ? "Back to Shipping" : "Back"}
            </button>
          )}

          {/* Progress steps */}
          <div className="flex items-center gap-3 mb-10">
            {stepDefs.map(({ key, label, Icon }, i) => {
              const isActive = STEPS.indexOf(key) <= STEPS.indexOf(step);
              return (
                <div key={key} className="flex items-center gap-3">
                  {i > 0 && (
                    <div className={`h-px w-8 md:w-16 transition-colors ${isActive ? "bg-primary" : "bg-foreground/10"}`} />
                  )}
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isActive ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className={`font-mono-tech text-sm hidden md:inline ${isActive ? "text-foreground" : "text-muted-foreground"}`}>
                      {label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-7">

              {/* ── Step 1 — Shipping ── */}
              {step === "shipping" && (
                <motion.form
                  key="shipping"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  onSubmit={handleShippingSubmit}
                  className="space-y-5"
                >
                  <h2 className="font-display text-2xl not-italic mb-2">Shipping Address</h2>

                  {/* ── Saved addresses picker ── */}
                  {savedAddresses.length > 0 && (
                    <div className="mb-2">
                      <button
                        type="button"
                        onClick={() => setShowSavedAddresses(!showSavedAddresses)}
                        className="flex items-center gap-2 font-mono-tech text-sm text-primary hover:underline mb-3"
                      >
                        <MapPin className="w-4 h-4" />
                        {showSavedAddresses
                          ? "Hide saved addresses"
                          : `Use a saved address (${savedAddresses.length})`}
                      </button>

                      {showSavedAddresses && (
                        <div className="grid gap-3 mb-5">
                          {savedAddresses.map((addr) => (
                            <button
                              key={addr.id}
                              type="button"
                              onClick={() => {
                                setShipping({
                                  fullName: addr.name,
                                  address:  addr.street,
                                  city:     addr.city,
                                  state:    addr.state,
                                  zip:      addr.zip,
                                  phone:    shipping.phone,
                                });
                                setShowSavedAddresses(false);
                              }}
                              className="text-left w-full border border-foreground/10 bg-secondary hover:border-primary hover:bg-primary/5 p-4 rounded-[4px] transition-all"
                            >
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-mono-tech text-xs text-primary uppercase tracking-wider">
                                  {addr.label}
                                </span>
                                {addr.isDefault && (
                                  <span className="font-mono-tech text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                                    Default
                                  </span>
                                )}
                              </div>
                              <p className="font-mono-tech text-sm text-foreground">{addr.name}</p>
                              <p className="font-mono-tech text-xs text-muted-foreground mt-0.5">
                                {addr.street}, {addr.city}, {addr.state} {addr.zip}
                              </p>
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Divider */}
                      <div className="flex items-center gap-3 my-4">
                        <div className="flex-1 h-px bg-foreground/10" />
                        <span className="font-mono-tech text-xs text-muted-foreground">or enter manually</span>
                        <div className="flex-1 h-px bg-foreground/10" />
                      </div>
                    </div>
                  )}

                  {/* Form fields */}
                  <input
                    className={inputClass}
                    placeholder="Full Name"
                    value={shipping.fullName}
                    onChange={(e) => setShipping({ ...shipping, fullName: e.target.value })}
                  />
                  <input
                    className={inputClass}
                    placeholder="Street Address"
                    value={shipping.address}
                    onChange={(e) => setShipping({ ...shipping, address: e.target.value })}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      className={inputClass}
                      placeholder="City"
                      value={shipping.city}
                      onChange={(e) => setShipping({ ...shipping, city: e.target.value })}
                    />
                    <input
                      className={inputClass}
                      placeholder="State"
                      value={shipping.state}
                      onChange={(e) => setShipping({ ...shipping, state: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      className={inputClass}
                      placeholder="ZIP Code"
                      value={shipping.zip}
                      onChange={(e) => setShipping({ ...shipping, zip: e.target.value })}
                    />
                    <input
                      className={inputClass}
                      placeholder="Phone (optional)"
                      value={shipping.phone}
                      onChange={(e) => setShipping({ ...shipping, phone: e.target.value })}
                    />
                  </div>
                  <button type="submit" className="action-button w-full mt-4">
                    <span>Continue to Payment</span>
                    <span className="font-mono text-sm">→</span>
                  </button>
                </motion.form>
              )}

              {/* ── Step 2 — Stripe Payment ── */}
              {step === "payment" && clientSecret && (
                <motion.div key="payment" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                  <Elements
                    stripe={stripePromise}
                    options={{
                      clientSecret,
                      appearance: { theme: "night" },
                    }}
                  >
                    <StripePaymentForm onSuccess={handlePaymentSuccess} totalPrice={totalPrice} />
                  </Elements>
                </motion.div>
              )}

              {/* ── Step 3 — Confirmation ── */}
              {step === "confirmation" && (
                <motion.div
                  key="confirmation"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-12"
                >
                  <CheckCircle className="w-16 h-16 text-primary mx-auto mb-6" />
                  <h2 className="font-display text-3xl not-italic mb-2">Order Confirmed</h2>
                  {orderNumber && (
                    <p className="font-mono text-muted-foreground mb-1">{orderNumber}</p>
                  )}
                  <p className="text-muted-foreground mt-4 max-w-md mx-auto">
                    Payment received. Your order is being processed and you'll receive a confirmation email shortly.
                  </p>
                  <div className="flex gap-3 justify-center mt-8">
                    <button onClick={() => navigate("/account")} className="action-button">
                      <span>View Orders</span>
                      <span className="font-mono text-sm">→</span>
                    </button>
                    <button
                      onClick={() => navigate("/shop")}
                      className="h-[60px] border border-foreground/20 bg-transparent font-bold uppercase tracking-tighter flex items-center px-6 hover:bg-foreground/10 transition-colors rounded-[4px]"
                    >
                      Continue Shopping
                    </button>
                  </div>
                </motion.div>
              )}

            </div>

            {/* Order summary */}
            {step !== "confirmation" && (
              <div className="lg:col-span-5">
                <OrderSummary items={items} totalPrice={totalPrice} />
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default Checkout;