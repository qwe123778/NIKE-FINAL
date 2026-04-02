import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Trash2, Package, DollarSign, Upload, X, Store } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";
import { useProducts } from "@/hooks/use-products";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Navigate, Link } from "react-router-dom";
import apiFetch from "@/lib/api";
import { supabaseClient } from "@/lib/supabaseClient";

const SellerDashboard = () => {
  const { user, isSeller, isLoaded } = useAuth();
  const { products, loading, refetch } = useProducts();
  const { toast } = useToast();

  const [name, setName]                 = useState("");
  const [category, setCategory]         = useState("");
  const [price, setPrice]               = useState("");
  const [description, setDescription]   = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [imageFile, setImageFile]       = useState(null);
  const [showForm, setShowForm]         = useState(false);
  const [submitting, setSubmitting]     = useState(false);
  const [deleting, setDeleting]         = useState(null);

  const myProducts = products.filter((p) => p.seller_id === user?.id);

  if (!isLoaded) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (!isSeller) return (
    <>
      <Navbar />
      <main className="pt-16 min-h-screen flex flex-col items-center justify-center px-6 gap-5">
        <div className="w-14 h-14 text-muted-foreground/30 flex items-center justify-center">
          <Store className="w-14 h-14" />
        </div>
        <h2 className="font-display text-3xl not-italic">Seller Mode Required</h2>
        <p className="font-mono-tech text-muted-foreground text-center max-w-sm">
          You're currently in Buyer Mode. Switch to Seller Mode in your account settings.
        </p>
        <Link to="/account" className="action-button">
          <span>Switch in Account Settings</span>
          <span className="font-mono text-sm">→</span>
        </Link>
      </main>
      <Footer />
    </>
  );

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "Error", description: "Image must be under 5MB." });
      return;
    }
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !category || !price || !description) {
      toast({ title: "Error", description: "Please fill in all required fields." });
      return;
    }

    setSubmitting(true);
    try {
      let image_url = "/placeholder.svg";

      if (imageFile) {
        if (!supabaseClient) {
          throw new Error("Supabase client not initialized — check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env");
        }

        const safeName = imageFile.name.replace(/[^a-zA-Z0-9.-]/g, "_");
        const fileName = `${Date.now()}-${safeName}`;

        const { error: uploadError } = await supabaseClient
          .storage
          .from("products")
          .upload(fileName, imageFile, { upsert: true });

        if (uploadError) throw new Error(`Image upload failed: ${uploadError.message}`);

        const { data } = supabaseClient.storage.from("products").getPublicUrl(fileName);
        image_url = data.publicUrl;
      }

      await apiFetch("/api/products", {
        method: "POST",
        body: JSON.stringify({
          name,
          category,
          price:       parseFloat(price),
          description,
          image_url,
          sizes:       [7, 8, 9, 10, 11, 12],
          is_new:      true,
        }),
      });

      toast({ title: "Product listed!", description: `${name} is now live.` });
      setName(""); setCategory(""); setPrice(""); setDescription("");
      setImageFile(null); setImagePreview(""); setShowForm(false);
      await refetch();
    } catch (err) {
      console.error("handleSubmit error:", err);
      toast({ title: "Failed to list product", description: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, productName) => {
    setDeleting(id);
    try {
      await apiFetch(`/api/products/${id}`, { method: "DELETE" });
      toast({ title: "Removed", description: `${productName} has been delisted.` });
      await refetch();
    } catch (err) {
      toast({ title: "Failed to remove", description: err.message });
    } finally {
      setDeleting(null);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen pt-20 bg-background">
        <div className="px-6 md:px-12 py-8 border-b border-border">
          <span className="font-mono-tech text-primary text-sm">Seller</span>
          <h1 className="font-display text-4xl md:text-5xl mt-1 not-italic">Dashboard</h1>
          <p className="text-muted-foreground font-mono-tech text-sm mt-2">Welcome, {user.name}</p>
        </div>

        {/* Stats */}
        <div className="px-6 md:px-12 py-6 grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="border border-border p-4">
            <Package className="w-5 h-5 text-muted-foreground mb-2" />
            <p className="font-display text-2xl not-italic">{myProducts.length}</p>
            <p className="font-mono-tech text-xs text-muted-foreground">Listed Products</p>
          </div>
          <div className="border border-border p-4">
            <DollarSign className="w-5 h-5 text-muted-foreground mb-2" />
            <p className="font-display text-2xl not-italic">
              ${myProducts.reduce((s, p) => s + p.price, 0).toFixed(0)}
            </p>
            <p className="font-mono-tech text-xs text-muted-foreground">Total Value Listed</p>
          </div>
        </div>

        <div className="px-6 md:px-12 py-6">
          <button onClick={() => setShowForm(!showForm)} className="action-button mb-6">
            <Plus className="w-4 h-4" />
            <span>{showForm ? "Cancel" : "Add New Product"}</span>
          </button>

          {showForm && (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              onSubmit={handleSubmit}
              className="border border-border p-6 mb-8 space-y-4"
            >
              <h2 className="font-display text-xl not-italic">New Product</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="font-mono-tech text-muted-foreground text-xs block mb-1">Product Name *</label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Air Max Pro" className="bg-muted/50" />
                </div>
                <div>
                  <label className="font-mono-tech text-muted-foreground text-xs block mb-1">Category *</label>
                  <Input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Running" className="bg-muted/50" />
                </div>
                <div>
                  <label className="font-mono-tech text-muted-foreground text-xs block mb-1">Price ($) *</label>
                  <Input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="199" className="bg-muted/50" />
                </div>
                <div className="md:col-span-2">
                  <label className="font-mono-tech text-muted-foreground text-xs block mb-1">Product Image</label>
                  {imagePreview ? (
                    <div className="relative w-32 h-32 border border-border overflow-hidden group">
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => { setImagePreview(""); setImageFile(null); }}
                        className="absolute top-1 right-1 p-1 bg-background/80 text-muted-foreground hover:text-destructive rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border hover:border-primary/50 cursor-pointer transition-colors bg-muted/30">
                      <Upload className="w-6 h-6 text-muted-foreground mb-2" />
                      <span className="font-mono-tech text-xs text-muted-foreground">Click to upload (max 5MB)</span>
                      <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    </label>
                  )}
                </div>
              </div>
              <div>
                <label className="font-mono-tech text-muted-foreground text-xs block mb-1">Description *</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your product..."
                  className="w-full h-24 bg-muted/50 border border-border px-4 py-3 font-mono-tech text-sm text-foreground rounded-[4px] focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                />
              </div>
              <button type="submit" disabled={submitting} className="action-button disabled:opacity-50">
                <span>{submitting ? "Publishing..." : "Publish Product"}</span>
                <span className="font-mono text-sm">→</span>
              </button>
            </motion.form>
          )}

          {/* Product list */}
          <div className="space-y-0 border-t border-border">
            {loading ? (
              <div className="py-16 text-center font-mono-tech text-muted-foreground">Loading products...</div>
            ) : myProducts.length === 0 ? (
              <div className="py-16 text-center font-mono-tech text-muted-foreground">No products listed yet.</div>
            ) : myProducts.map((product, i) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center justify-between border-b border-border py-4 gap-4"
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="w-16 h-16 bg-muted flex-shrink-0 overflow-hidden">
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-display text-sm not-italic truncate">{product.name}</p>
                    <p className="font-mono-tech text-xs text-muted-foreground">{product.category} · ${product.price}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(product.id, product.name)}
                  disabled={deleting === product.id}
                  className="p-2 text-muted-foreground hover:text-destructive transition-colors disabled:opacity-40"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default SellerDashboard;