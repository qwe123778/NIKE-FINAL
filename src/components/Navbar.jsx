import { Link } from "react-router-dom";
import { ShoppingBag, Heart, User, Menu, X } from "lucide-react";
import { SignedIn, SignedOut } from "@clerk/clerk-react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const sprintSpring = { type: "spring", stiffness: 300, damping: 30 };

const Navbar = () => {
  const { totalItems, setIsCartOpen } = useCart();
  const { totalItems: wishlistTotal } = useWishlist();
  const { isSeller } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { label: "Home", to: "/" },
    { label: "Shop", to: "/shop" },
    { label: "New", to: "/#new" },
    ...(isSeller ? [{ label: "Seller", to: "/sellerdashboard" }] : []),
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-md border-b border-foreground/10">
      {/* Desktop navbar */}
      <div className="flex items-center justify-between h-16 px-6 md:px-12">
        <Link to="/" className="font-display text-2xl not-italic">
          SONACT
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              to={link.to}
              className="font-mono-tech text-muted-foreground hover:text-foreground transition-colors duration-150"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {/* Wishlist */}
          <Link
            to="/wishlist"
            className="relative p-2 hover:bg-secondary transition-colors rounded-[4px]"
          >
            <Heart className="w-5 h-5" />
            {wishlistTotal > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={sprintSpring}
                className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground font-mono text-[10px] flex items-center justify-center rounded-full"
              >
                {wishlistTotal}
              </motion.span>
            )}
          </Link>

          {/* Cart */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative p-2 hover:bg-secondary transition-colors rounded-[4px]"
          >
            <ShoppingBag className="w-5 h-5" />
            {totalItems > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={sprintSpring}
                className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground font-mono text-[10px] flex items-center justify-center rounded-full"
              >
                {totalItems}
              </motion.span>
            )}
          </button>

          {/* Auth */}
          <SignedIn>
            <Link
              to="/account"
              className="p-2 hover:bg-secondary rounded-[4px]"
            >
              <User className="w-5 h-5" />
            </Link>
          </SignedIn>
          <SignedOut>
            <Link
              to="/login"
              className="p-2 hover:bg-secondary transition-colors rounded-[4px]"
            >
              <User className="w-5 h-5" />
            </Link>
          </SignedOut>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="md:hidden overflow-hidden border-t border-foreground/10"
          >
            <div className="flex flex-col px-6 py-4 gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className="font-mono-tech text-muted-foreground hover:text-foreground transition-colors"
                >
                  {link.label}
                </Link>
              ))}

              <Link
                to="/wishlist"
                onClick={() => setMobileOpen(false)}
                className="font-mono-tech text-muted-foreground hover:text-foreground"
              >
                Wishlist
              </Link>

              <SignedOut>
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="font-mono-tech text-muted-foreground hover:text-foreground"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setMobileOpen(false)}
                  className="font-mono-tech text-primary"
                >
                  Create Account
                </Link>
              </SignedOut>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;