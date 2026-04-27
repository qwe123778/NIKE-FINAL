import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Store, UserPlus, UserCheck, Package, RefreshCw } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { useAuth } from "@/context/AuthContext";
import { useAuth as useClerkAuth } from "@clerk/clerk-react";
import apiFetch from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const SellerProfile = () => {
  const { sellerId }            = useParams();
  const { isLoggedIn, isSeller, user } = useAuth();
  const { getToken }            = useClerkAuth();
  const { toast }               = useToast();

  const [seller, setSeller]         = useState(null);
  const [products, setProducts]     = useState([]);
  const [followers, setFollowers]   = useState(0);
  const [following, setFollowing]   = useState(false);
  const [loading, setLoading]       = useState(true);
  const [followLoading, setFollowLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await apiFetch(`/api/sellers/profile/${sellerId}`);
        setSeller(data.seller);
        setProducts(data.products.map((row) => ({
          id:          row.id,
          name:        row.name,
          category:    row.category,
          price:       Number(row.price),
          sku:         row.sku,
          image:       row.image_url,
          description: row.description || "",
          isNew:       row.is_new ?? false,
          seller_id:   row.seller_id,
          seller_name: row.seller_name,
        })));
        setFollowers(data.followerCount);

        // Check if current user follows this seller
        if (isLoggedIn) {
          try {
            const token = await getToken();
            const res = await apiFetch(`/api/sellers/follow/${sellerId}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            setFollowing(res.following);
          } catch {}
        }
      } catch (err) {
        console.error("[SellerProfile]", err.message);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [sellerId, isLoggedIn]);

  const handleFollow = async () => {
    if (!isLoggedIn) {
      toast({ title: "Sign in required", description: "Sign in to follow sellers." });
      return;
    }
    if (isSeller && user?.id === sellerId) return;

    setFollowLoading(true);
    try {
      const token = await getToken();
      if (following) {
        await apiFetch(`/api/sellers/follow/${sellerId}`, {
          method:  "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
        setFollowing(false);
        setFollowers((p) => p - 1);
        toast({ title: "Unfollowed", description: `You unfollowed ${seller?.name}` });
      } else {
        await apiFetch(`/api/sellers/follow/${sellerId}`, {
          method:  "POST",
          headers: { Authorization: `Bearer ${token}` },
        });
        setFollowing(true);
        setFollowers((p) => p + 1);
        toast({ title: "Following!", description: `You'll be notified when ${seller?.name} adds new products.` });
      }
    } catch (err) {
      toast({ title: "Error", description: err.message });
    } finally {
      setFollowLoading(false);
    }
  };

  if (loading) return (
    <>
      <Navbar />
      <main className="pt-16 min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </main>
    </>
  );

  if (!seller) return (
    <>
      <Navbar />
      <main className="pt-16 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="font-mono-tech text-muted-foreground mb-4">Seller not found.</p>
          <Link to="/shop" className="action-button inline-flex w-auto">
            <span>Back to Shop</span><span className="font-mono text-sm">→</span>
          </Link>
        </div>
      </main>
    </>
  );

  const isOwnProfile = user?.id === sellerId;

  return (
    <>
      <Navbar />
      <main className="pt-16 min-h-screen">
        {/* Seller header */}
        <div className="px-6 md:px-12 py-12 border-b border-border">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="flex items-start justify-between gap-6 max-w-4xl">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center shrink-0">
                <Store className="w-8 h-8 text-primary-foreground" />
              </div>
              <div>
                <h1 className="font-display text-3xl md:text-4xl not-italic">{seller.name}</h1>
                <div className="flex items-center gap-4 mt-2">
                  <span className="font-mono-tech text-xs text-muted-foreground">
                    {products.length} product{products.length !== 1 ? "s" : ""}
                  </span>
                  <span className="font-mono-tech text-xs text-muted-foreground">·</span>
                  <span className="font-mono-tech text-xs text-muted-foreground">
                    {followers} follower{followers !== 1 ? "s" : ""}
                  </span>
                  <span className="font-mono-tech text-xs text-muted-foreground">·</span>
                  <span className="font-mono-tech text-xs text-muted-foreground">
                    Member since {new Date(seller.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                  </span>
                </div>
              </div>
            </div>

            {!isOwnProfile && !isSeller && (
              <button
                onClick={handleFollow}
                disabled={followLoading}
                className={`flex items-center gap-2 h-10 px-5 font-mono-tech text-sm transition-all rounded-[4px] shrink-0 ${
                  following
                    ? "bg-secondary border border-primary/50 text-primary hover:bg-destructive/10 hover:border-destructive hover:text-destructive"
                    : "bg-primary text-primary-foreground hover:bg-primary/90"
                }`}
              >
                {followLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : following ? (
                  <><UserCheck className="w-4 h-4" />Following</>
                ) : (
                  <><UserPlus className="w-4 h-4" />Follow</>
                )}
              </button>
            )}

            {isOwnProfile && (
              <Link to="/seller" className="action-button h-10 px-5 text-sm">
                <span>My Dashboard</span>
                <span className="font-mono text-sm">→</span>
              </Link>
            )}
          </motion.div>
        </div>

        {/* Products grid */}
        <section className="px-6 md:px-12 py-12">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-display text-2xl not-italic">Products</h2>
            <span className="font-mono-tech text-sm text-muted-foreground">{products.length} listed</span>
          </div>

          {products.length === 0 ? (
            <div className="text-center py-20">
              <Package className="w-14 h-14 text-muted-foreground/20 mx-auto mb-4" />
              <p className="font-display text-2xl not-italic mb-2">No products yet</p>
              <p className="font-mono-tech text-muted-foreground text-sm">This seller hasn't listed any products.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-0 border-t border-l border-foreground/10">
              {products.map((product, i) => (
                <motion.div key={product.id} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.06 }}>
                  <ProductCard product={product} />
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

export default SellerProfile;