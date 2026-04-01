import { Heart, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { useWishlist } from "@/context/WishlistContext";

const ProductListItem = ({ product }) => {
  const { addItem, removeItem, isInWishlist } = useWishlist();
  const wishlisted = isInWishlist(product.id);

  const toggleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    wishlisted ? removeItem(product.id) : addItem(product);
  };

  return (
    <Link to={`/product/${product.id}`}
      className="flex items-center gap-6 p-4 border-b border-foreground/10 bg-secondary hover:bg-muted/50 transition-colors group">
      <div className="w-24 h-24 shrink-0 overflow-hidden">
        <img src={product.image} alt={product.name}
          className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" loading="lazy" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-mono-tech text-xs text-muted-foreground">{product.category}</span>
          {product.isNew && <span className="font-mono-tech text-xs text-primary">New</span>}
        </div>
        <h3 className="font-display text-lg not-italic truncate">{product.name}</h3>
        <p className="text-muted-foreground text-sm line-clamp-1 mt-1">{product.description}</p>
      </div>
      <div className="flex items-center gap-4 shrink-0">
        <p className="text-primary font-mono-tech text-sm tabular-nums">${product.price.toFixed(2)}</p>
        <button onClick={toggleWishlist} className="p-2 hover:scale-110 transition-transform">
          <Heart className={`w-4 h-4 transition-colors ${wishlisted ? "fill-primary text-primary" : "text-muted-foreground"}`} />
        </button>
        <div className="w-10 h-10 bg-foreground flex items-center justify-center group-hover:bg-primary transition-colors rounded-[4px]">
          <Plus className="w-4 h-4 text-background" />
        </div>
      </div>
    </Link>
  );
};

export default ProductListItem;
