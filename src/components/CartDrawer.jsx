import { motion, AnimatePresence } from "framer-motion";
import { X, Minus, Plus, ShoppingBag, Store } from "lucide-react";
import { Link } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";

const sprintSpring = { type: "spring", stiffness: 300, damping: 30 };

const CartDrawer = () => {
  const { items, removeItem, addItem, decreaseItem, totalPrice, isCartOpen, setIsCartOpen } = useCart();
  const { isSeller, isLoggedIn } = useAuth();

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setIsCartOpen(false)}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50" />

          <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
            transition={sprintSpring}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-background border-l border-foreground/10 z-50 flex flex-col shadow-2xl">

            {/* Header */}
            <div className="flex items-center justify-between px-8 py-6 border-b border-foreground/10">
              <div>
                <h2 className="font-display text-2xl not-italic">Your Cart</h2>
                {items.length > 0 && (
                  <p className="font-mono-tech text-muted-foreground mt-0.5">
                    {items.reduce((s, i) => s + i.quantity, 0)} item{items.reduce((s,i) => s+i.quantity,0) !== 1 ? "s" : ""}
                  </p>
                )}
              </div>
              <button onClick={() => setIsCartOpen(false)}
                className="w-10 h-10 flex items-center justify-center hover:bg-secondary transition-colors rounded-[4px]">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Seller warning banner */}
            {isSeller && (
              <div className="mx-8 mt-4 flex items-start gap-3 bg-primary/5 border border-primary/20 px-4 py-3 rounded-[4px]">
                <Store className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="font-mono-tech text-xs text-foreground font-bold">You're in Seller Mode</p>
                  <p className="font-mono-tech text-xs text-muted-foreground mt-0.5">
                    Switch to Buyer Mode in your{" "}
                    <Link to="/account" onClick={() => setIsCartOpen(false)} className="text-primary underline">
                      account settings
                    </Link>{" "}
                    to checkout.
                  </p>
                </div>
              </div>
            )}

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-8 py-6">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center gap-5">
                  <div className="w-16 h-16 bg-secondary flex items-center justify-center">
                    <ShoppingBag className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-display text-xl not-italic">Cart is empty</p>
                    <p className="font-mono-tech text-muted-foreground mt-1">Add gear to move.</p>
                  </div>
                  <button onClick={() => setIsCartOpen(false)} className="action-button px-8 mt-2">
                    <span>Continue Shopping</span><span className="font-mono text-sm">→</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-7">
                  {items.map((item) => (
                    <div key={`${item.product.id}-${item.size}`} className="flex gap-5">
                      <div className="w-24 h-28 bg-secondary overflow-hidden shrink-0">
                        <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0 py-1">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-display text-base not-italic leading-tight">{item.product.name}</h3>
                          <button onClick={() => removeItem(item.product.id, item.size)}
                            className="w-7 h-7 flex items-center justify-center hover:bg-secondary transition-colors shrink-0">
                            <X className="w-3.5 h-3.5 text-muted-foreground" />
                          </button>
                        </div>
                        <p className="font-mono-tech text-muted-foreground mt-1.5">Size: US {item.size}</p>
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center gap-3 border border-foreground/12">
                            <button onClick={() => decreaseItem(item.product.id, item.size)}
                              className="w-8 h-8 flex items-center justify-center hover:bg-secondary transition-colors">
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="font-mono text-sm tabular-nums w-4 text-center">{item.quantity}</span>
                            <button onClick={() => addItem(item.product, item.size)}
                              className="w-8 h-8 flex items-center justify-center hover:bg-secondary transition-colors">
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                          <p className="font-mono text-base tabular-nums">${(item.product.price * item.quantity).toFixed(2)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="px-8 py-7 border-t border-foreground/10 space-y-5">
                <div className="space-y-2.5">
                  <div className="flex justify-between">
                    <span className="font-mono-tech text-muted-foreground">Subtotal</span>
                    <span className="font-mono tabular-nums">${totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-mono-tech text-muted-foreground">Shipping</span>
                    <span className="font-mono-tech text-muted-foreground">{totalPrice >= 150 ? "FREE" : "$12.99"}</span>
                  </div>
                  <div className="h-px bg-foreground/10" />
                  <div className="flex justify-between">
                    <span className="font-mono-tech font-bold">Total</span>
                    <span className="font-mono text-xl tabular-nums">
                      ${(totalPrice + (totalPrice >= 150 ? 0 : 12.99)).toFixed(2)}
                    </span>
                  </div>
                </div>

                {isSeller ? (
                  <div className="action-button w-full opacity-40 cursor-not-allowed justify-center">
                    <Store className="w-4 h-4" />
                    <span>Checkout unavailable in Seller Mode</span>
                  </div>
                ) : !isLoggedIn ? (
                  <Link to="/login" onClick={() => setIsCartOpen(false)} className="action-button w-full">
                    <span>Sign in to Checkout</span><span className="font-mono text-sm">→</span>
                  </Link>
                ) : (
                  <Link to="/checkout" onClick={() => setIsCartOpen(false)} className="action-button w-full">
                    <span>Checkout</span><span className="font-mono text-sm">→</span>
                  </Link>
                )}

                <p className="font-mono-tech text-muted-foreground text-center text-[10px]">
                  Free shipping on orders over $150
                </p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartDrawer;
