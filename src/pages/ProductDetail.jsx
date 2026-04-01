import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Heart } from "lucide-react";
import { useProducts } from "@/hooks/use-products";
import SizePicker from "@/components/SizePicker";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const ProductDetail = () => {
  const { id } = useParams();
  const { products } = useProducts();
  const product = products.find((p) => p.id === id);
  const [selectedSize, setSelectedSize] = useState(null);
  const { addItem } = useCart();
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlist();
  const { toast } = useToast();

  if (!product) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="font-mono-tech text-muted-foreground">Product not found.</p>
    </div>
  );

  const wishlisted = isInWishlist(product.id);

  const handleAddToCart = () => {
    if (!selectedSize) { toast({ title: "Select a size", description: "Choose your size before adding to cart." }); return; }
    addItem(product, selectedSize);
    toast({ title: "Added to cart", description: `${product.name} — Size ${selectedSize}` });
  };

  const toggleWishlist = () => {
    if (wishlisted) { removeFromWishlist(product.id); toast({ title: "Removed from wishlist", description: product.name }); }
    else { addToWishlist(product); toast({ title: "Added to wishlist", description: product.name }); }
  };

  return (
    <>
      <Navbar />
      <main className="pt-16 min-h-screen">
        <div className="px-6 md:px-12 py-8">
          <Link to="/" className="inline-flex items-center gap-2 font-mono-tech text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />Back
          </Link>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 px-6 md:px-12 pb-[12vh]">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, ease: [0.22,1,0.36,1] }}
            className="lg:col-span-7 aspect-square lg:aspect-auto lg:h-[80vh] bg-secondary overflow-hidden sticky top-16">
            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2, ease: [0.22,1,0.36,1] }}
            className="lg:col-span-5 py-8 lg:py-0 lg:pl-12 flex flex-col justify-center">
            <span className="font-mono-tech text-muted-foreground">SKU: {product.sku}</span>
            <p className="font-mono-tech text-primary mt-2">{product.category}</p>
            <h1 className="font-display text-4xl md:text-5xl mt-2 not-italic leading-tight">{product.name}</h1>
            <p className="font-mono text-2xl tabular-nums mt-4 text-primary">${product.price.toFixed(2)}</p>
            <p className="text-muted-foreground mt-6 leading-relaxed">{product.description}</p>
            <div className="flex gap-8 mt-6 py-4 border-t border-b border-foreground/10">
              <div><span className="font-mono-tech text-muted-foreground block">Weight</span><span className="font-mono text-sm tabular-nums">{product.weight}</span></div>
              <div><span className="font-mono-tech text-muted-foreground block">Offset</span><span className="font-mono text-sm tabular-nums">{product.offset}</span></div>
            </div>
            <div className="mt-6">
              <div className="flex justify-between items-center mb-3">
                <span className="font-mono-tech text-foreground">Select Size</span>
                {selectedSize && <span className="font-mono-tech text-primary">US {selectedSize}</span>}
              </div>
              <SizePicker sizes={product.sizes} selectedSize={selectedSize} onSelectSize={setSelectedSize} />
            </div>
            <div className="flex gap-3 mt-8">
              <button onClick={handleAddToCart} className="action-button flex-1"><span>Add to Cart</span><span className="font-mono text-sm">→</span></button>
              <button onClick={toggleWishlist} className={`w-[60px] border border-foreground/10 flex items-center justify-center rounded-[4px] transition-colors ${wishlisted ? "bg-primary text-primary-foreground" : "hover:bg-secondary"}`}>
                <Heart className={`w-5 h-5 ${wishlisted ? "fill-current" : ""}`} />
              </button>
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default ProductDetail;
