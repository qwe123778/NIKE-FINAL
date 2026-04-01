import { motion } from "framer-motion";
import { Plus, Heart, ArrowUpRight, Store } from "lucide-react";
import { Link } from "react-router-dom";
import { useWishlist } from "@/context/WishlistContext";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/hooks/use-toast";

const ProductCard = ({ product }) => {
  const { addItem: addToWishlist, removeItem, isInWishlist } = useWishlist();
  const { addItem: addToCart } = useCart();
  const { isSeller, isLoggedIn } = useAuth();
  const { toast } = useToast();
  const wishlisted = isInWishlist(product.id);

  const toggleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    wishlisted ? removeItem(product.id) : addToWishlist(product);
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isSeller) {
      toast({ title: "Seller Mode active", description: "Switch to Buyer Mode in account settings to shop." });
      return;
    }
    // Go to product detail to pick a size
  };

  return (
    <motion.div whileHover={{ y: -6 }} transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="group relative border-b border-r border-foreground/10 bg-secondary flex flex-col overflow-hidden">
      <Link to={`/product/${product.id}`} className="flex flex-col h-full">
        <div className="relative aspect-[4/5] overflow-hidden">
          <img src={product.image} alt={product.name}
            className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 scale-105 group-hover:scale-100" loading="lazy" />
          <div className="absolute inset-0 bg-gradient-to-t from-background/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          {product.isNew && (
            <span className="absolute top-4 left-4 font-mono-tech bg-primary text-primary-foreground px-2.5 py-1 text-[10px] z-10">New</span>
          )}
          <button onClick={toggleWishlist}
            className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center bg-background/75 backdrop-blur-sm hover:bg-background transition-all z-10">
            <Heart className={`w-4 h-4 transition-colors ${wishlisted ? "fill-primary text-primary" : "text-foreground/60"}`} />
          </button>
          <div className="absolute bottom-4 right-4 w-10 h-10 bg-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 translate-y-3 group-hover:translate-y-0 transition-all duration-300 z-10">
            <ArrowUpRight className="w-4 h-4 text-background" />
          </div>
        </div>
        <div className="flex flex-col flex-1 px-5 pt-5 pb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono-tech text-primary text-xs">{product.category}</span>
            <span className="font-mono-tech text-muted-foreground/40 text-xs">{product.sku}</span>
          </div>
          <h3 className="font-display text-xl not-italic leading-tight mb-2 line-clamp-2">{product.name}</h3>
          <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2 flex-1 mb-5">{product.description}</p>
          <div className="flex items-center justify-between pt-4 border-t border-foreground/10">
            <p className="font-mono text-xl tabular-nums">${product.price.toFixed(2)}</p>
            {isSeller ? (
              <div className="h-9 px-3 bg-secondary border border-foreground/10 flex items-center gap-1.5 rounded-[4px] opacity-60">
                <Store className="w-3 h-3 text-muted-foreground" />
                <span className="font-mono-tech text-xs text-muted-foreground">Seller</span>
              </div>
            ) : (
              <div className="h-9 px-5 bg-foreground flex items-center group-hover:bg-primary transition-colors duration-200 rounded-[4px]">
                <span className="font-mono-tech text-xs text-background">Add</span>
              </div>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default ProductCard;
