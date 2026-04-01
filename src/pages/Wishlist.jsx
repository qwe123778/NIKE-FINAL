import { motion } from "framer-motion";
import { Heart, ShoppingBag, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/hooks/use-toast";

const Wishlist = () => {
  const { items, removeItem } = useWishlist();
  const { addItem } = useCart();
  const { toast } = useToast();

  const handleMoveToCart = (product) => {
    addItem(product, product.sizes[Math.floor(product.sizes.length / 2)]);
    removeItem(product.id);
    toast({ title: "Moved to cart", description: `${product.name} added to cart` });
  };

  return (
    <>
      <Navbar />
      <main className="pt-16 min-h-screen">
        <section className="px-6 md:px-12 py-12">
          <div className="flex items-center gap-3 mb-8">
            <Heart className="w-6 h-6 text-primary" />
            <h1 className="font-display text-3xl md:text-5xl not-italic">Wishlist</h1>
            <span className="font-mono-tech text-muted-foreground ml-2">({items.length})</span>
          </div>

          {items.length === 0 ? (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-24">
              <Heart className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
              <p className="font-mono-tech text-muted-foreground">No saved items yet.</p>
              <Link to="/" className="action-button inline-flex mt-6 w-auto"><span>Browse Shoes</span><span className="font-mono text-sm">→</span></Link>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-0 border-t border-l border-foreground/10">
              {items.map((product, i) => (
                <motion.div key={product.id} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i*0.08 }}
                  className="border-b border-r border-foreground/10 p-6 bg-secondary group">
                  <Link to={`/product/${product.id}`}>
                    <div className="aspect-[3/4] overflow-hidden mb-4">
                      <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                  </Link>
                  <p className="font-mono-tech text-muted-foreground">{product.category}</p>
                  <h3 className="font-display text-xl not-italic mt-1">{product.name}</h3>
                  <p className="text-primary font-mono text-sm mt-1 tabular-nums">${product.price.toFixed(2)}</p>
                  <div className="flex gap-2 mt-4">
                    <button onClick={() => handleMoveToCart(product)} className="flex-1 h-10 bg-foreground text-background font-mono-tech flex items-center justify-center gap-2 hover:bg-primary transition-colors rounded-[4px]">
                      <ShoppingBag className="w-4 h-4" />Move to Cart
                    </button>
                    <button onClick={() => removeItem(product.id)} className="w-10 h-10 border border-foreground/10 flex items-center justify-center hover:bg-destructive hover:text-destructive-foreground transition-colors rounded-[4px]">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
};

export default Wishlist;
