import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Trash2, Package, DollarSign, Upload, X, Store,
  Bell, ShoppingBag, Wallet, MapPin, Check, RefreshCw,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";
import { useProducts } from "@/hooks/use-products";
import { useToast } from "@/hooks/use-toast";
import { useSellerDashboard } from "@/hooks/use-seller-dashboard";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Navigate, Link } from "react-router-dom";
import apiFetch from "@/lib/api";
import { supabaseClient } from "@/lib/supabaseClient";

const TABS = [
  { key: "products",      label: "Products",      icon: <Package className="w-4 h-4" /> },
  { key: "orders",        label: "Sales",         icon: <ShoppingBag className="w-4 h-4" /> },
  { key: "notifications", label: "Notifications", icon: <Bell className="w-4 h-4" /> },
  { key: "balance",       label: "Balance",       icon: <Wallet className="w-4 h-4" /> },
];

const SellerDashboard = () => {
  const { user, isSeller, isLoaded }   = useAuth();
  const { products, loading, refetch } = useProducts();
  const { toast }                      = useToast();
  const {
    notifications, orders, stats,
    loading: dashLoading, unreadCount,
    markRead, markAllRead, refetch: refetchDash,
  } = useSellerDashboard();

  const [activeTab, setActiveTab]       = useState("products");
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
        <Store className="w-14 h-14 text-muted-foreground/30" />
        <h2 className="font-display text-3xl not-italic">Seller Mode Required</h2>
        <p className="font-mono-tech text-muted-foreground text-center max-w-sm">
          Switch to Seller Mode in your account settings to access the dashboard.
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
        if (!supabaseClient) throw new Error("Supabase client not initialized");
        const safeName = imageFile.name.replace(/[^a-zA-Z0-9.-]/g, "_");
        const fileName = `${Date.now()}-${safeName}`;

        const { error: uploadError } = await supabaseClient
          .storage.from("products")
          .upload(fileName, imageFile, { upsert: true });

        if (uploadError) throw new Error(`Image upload failed: ${uploadError.message}`);

        const { data } = supabaseClient.storage.from("products").getPublicUrl(fileName);
        image_url = data.publicUrl;
      }

      await apiFetch("/api/products", {
        method: "POST",
        body: JSON.stringify({ name, category, price: parseFloat(price), description, image_url, sizes: [7,8,9,10,11,12], is_new: true }),
      });

      toast({ title: "Product listed!", description: `${name} is now live.` });
      setName(""); setCategory(""); setPrice(""); setDescription("");
      setImageFile(null); setImagePreview(""); setShowForm(false);
      await refetch();
    } catch (err) {
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
        {/* Header */}
        <div className="px-6 md:px-12 py-8 border-b border-border">
          <span className="font-mono-tech text-primary text-sm">Seller</span>
          <h1 className="font-display text-4xl md:text-5xl mt-1 not-italic">Dashboard</h1>
          <p className="text-muted-foreground font-mono-tech text-sm mt-2">Welcome, {user.name}</p>
        </div>

        {/* Stats row */}
        <div className="px-6 md:px-12 py-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="border border-border p-4">
            <Package className="w-5 h-5 text-muted-foreground mb-2" />
            <p className="font-display text-2xl not-italic">{myProducts.length}</p>
            <p className="font-mono-tech text-xs text-muted-foreground">Listed Products</p>
          </div>
          <div className="border border-border p-4">
            <ShoppingBag className="w-5 h-5 text-muted-foreground mb-2" />
            <p className="font-display text-2xl not-italic">{stats.totalOrders}</p>
            <p className="font-mono-tech text-xs text-muted-foreground">Total Orders</p>
          </div>
          <div className="border border-border p-4">
            <Package className="w-5 h-5 text-muted-foreground mb-2" />
            <p className="font-display text-2xl not-italic">{stats.totalUnitsSold}</p>
            <p className="font-mono-tech text-xs text-muted-foreground">Units Sold</p>
          </div>
          <div className="border border-border p-4 border-primary/30">
            <Wallet className="w-5 h-5 text-primary mb-2" />
            <p className="font-display text-2xl not-italic text-primary">
              ${stats.balance.toFixed(2)}
            </p>
            <p className="font-mono-tech text-xs text-muted-foreground">Total Balance</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-6 md:px-12">
          <div className="flex gap-1 overflow-x-auto pb-2 border-b border-border">
            {TABS.map((tab) => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                className={`relative flex items-center gap-2 px-4 py-2.5 font-mono-tech text-sm whitespace-nowrap transition-colors rounded-t-md ${
                  activeTab === tab.key
                    ? "text-primary border-b-2 border-primary bg-primary/5"
                    : "text-muted-foreground hover:text-foreground"
                }`}>
                {tab.icon}
                {tab.label}
                {tab.key === "notifications" && unreadCount > 0 && (
                  <span className="w-4 h-4 bg-primary text-primary-foreground text-[10px] font-mono flex items-center justify-center rounded-full">
                    {unreadCount}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="px-6 md:px-12 py-6">
          <AnimatePresence mode="wait">
            <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>

              {/* ── PRODUCTS TAB ── */}
              {activeTab === "products" && (
                <div>
                  <button onClick={() => setShowForm(!showForm)} className="action-button mb-6">
                    <Plus className="w-4 h-4" />
                    <span>{showForm ? "Cancel" : "Add New Product"}</span>
                  </button>

                  {showForm && (
                    <motion.form initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                      onSubmit={handleSubmit} className="border border-border p-6 mb-8 space-y-4">
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
                              <button type="button" onClick={() => { setImagePreview(""); setImageFile(null); }}
                                className="absolute top-1 right-1 p-1 bg-background/80 text-muted-foreground hover:text-destructive rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
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
                        <textarea value={description} onChange={(e) => setDescription(e.target.value)}
                          placeholder="Describe your product..."
                          className="w-full h-24 bg-muted/50 border border-border px-4 py-3 font-mono-tech text-sm text-foreground rounded-[4px] focus:outline-none focus:ring-2 focus:ring-primary resize-none" />
                      </div>
                      <button type="submit" disabled={submitting} className="action-button disabled:opacity-50">
                        <span>{submitting ? "Publishing..." : "Publish Product"}</span>
                        <span className="font-mono text-sm">→</span>
                      </button>
                    </motion.form>
                  )}

                  <div className="space-y-0 border-t border-border">
                    {loading ? (
                      <div className="py-16 text-center font-mono-tech text-muted-foreground">Loading products...</div>
                    ) : myProducts.length === 0 ? (
                      <div className="py-16 text-center font-mono-tech text-muted-foreground">No products listed yet.</div>
                    ) : myProducts.map((product, i) => (
                      <motion.div key={product.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }} className="flex items-center justify-between border-b border-border py-4 gap-4">
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          <div className="w-16 h-16 bg-muted flex-shrink-0 overflow-hidden">
                            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-display text-sm not-italic truncate">{product.name}</p>
                            <p className="font-mono-tech text-xs text-muted-foreground">{product.category} · ${product.price}</p>
                          </div>
                        </div>
                        <button onClick={() => handleDelete(product.id, product.name)} disabled={deleting === product.id}
                          className="p-2 text-muted-foreground hover:text-destructive transition-colors disabled:opacity-40">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── SALES TAB ── */}
              {activeTab === "orders" && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="font-display text-2xl not-italic">Sales History</h2>
                    <button onClick={refetchDash} className="flex items-center gap-2 font-mono-tech text-sm text-muted-foreground hover:text-foreground transition-colors">
                      <RefreshCw className="w-3.5 h-3.5" />Refresh
                    </button>
                  </div>

                  {dashLoading ? (
                    <div className="py-16 text-center font-mono-tech text-muted-foreground">Loading sales...</div>
                  ) : orders.length === 0 ? (
                    <div className="text-center py-20">
                      <ShoppingBag className="w-14 h-14 text-muted-foreground/20 mx-auto mb-4" />
                      <p className="font-display text-2xl not-italic mb-2">No sales yet</p>
                      <p className="font-mono-tech text-muted-foreground text-sm">Sales will appear here when buyers purchase your products.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {orders.map((order) => (
                        <div key={order.id} className="card-surface p-6 space-y-4">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <p className="font-mono-tech text-xs text-muted-foreground uppercase tracking-wider mb-1">Order</p>
                              <p className="font-mono-tech text-sm text-foreground">{order.order_id}</p>
                              <p className="font-mono-tech text-xs text-muted-foreground mt-0.5">
                                {new Date(order.created_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                              </p>
                            </div>
                            <div className="text-right shrink-0">
                              <p className="font-mono text-xl tabular-nums text-primary">${Number(order.price).toFixed(2)}</p>
                              <p className="font-mono-tech text-xs text-muted-foreground">Qty: {order.quantity} · Size: {order.size}</p>
                            </div>
                          </div>

                          <Separator />

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <p className="font-mono-tech text-xs text-muted-foreground uppercase tracking-wider mb-2">Product</p>
                              <p className="font-mono-tech text-sm">{order.product_name}</p>
                            </div>
                            <div>
                              <p className="font-mono-tech text-xs text-muted-foreground uppercase tracking-wider mb-2">Buyer</p>
                              <p className="font-mono-tech text-sm">{order.buyer_name}</p>
                            </div>
                          </div>

                          {order.shipping_address && (
                            <div>
                              <p className="font-mono-tech text-xs text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                <MapPin className="w-3 h-3" />Shipping Address
                              </p>
                              <div className="bg-secondary border border-foreground/10 p-3 rounded-[4px]">
                                <p className="font-mono-tech text-sm">{order.shipping_address.fullName}</p>
                                <p className="font-mono-tech text-sm text-muted-foreground">{order.shipping_address.address}</p>
                                <p className="font-mono-tech text-sm text-muted-foreground">
                                  {order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.zip}
                                </p>
                                {order.shipping_address.phone && (
                                  <p className="font-mono-tech text-sm text-muted-foreground mt-1">{order.shipping_address.phone}</p>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ── NOTIFICATIONS TAB ── */}
              {activeTab === "notifications" && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="font-display text-2xl not-italic">
                      Notifications
                      {unreadCount > 0 && (
                        <span className="ml-3 font-mono-tech text-sm text-primary">({unreadCount} unread)</span>
                      )}
                    </h2>
                    <div className="flex gap-3">
                      {unreadCount > 0 && (
                        <button onClick={markAllRead}
                          className="flex items-center gap-2 font-mono-tech text-sm text-muted-foreground hover:text-foreground transition-colors">
                          <Check className="w-3.5 h-3.5" />Mark all read
                        </button>
                      )}
                      <button onClick={refetchDash}
                        className="flex items-center gap-2 font-mono-tech text-sm text-muted-foreground hover:text-foreground transition-colors">
                        <RefreshCw className="w-3.5 h-3.5" />Refresh
                      </button>
                    </div>
                  </div>

                  {dashLoading ? (
                    <div className="py-16 text-center font-mono-tech text-muted-foreground">Loading notifications...</div>
                  ) : notifications.length === 0 ? (
                    <div className="text-center py-20">
                      <Bell className="w-14 h-14 text-muted-foreground/20 mx-auto mb-4" />
                      <p className="font-display text-2xl not-italic mb-2">No notifications yet</p>
                      <p className="font-mono-tech text-muted-foreground text-sm">You'll be notified when someone buys your products.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {notifications.map((notif) => (
                        <div key={notif.id}
                          className={`card-surface p-5 transition-all ${!notif.read ? "border-primary/30 bg-primary/3" : ""}`}>
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-3 flex-1">
                              <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${notif.read ? "bg-muted" : "bg-primary"}`} />
                              <div className="flex-1">
                                <p className="font-mono-tech text-sm">
                                  <span className="text-foreground font-bold">{notif.buyer_name}</span>
                                  {" "}purchased{" "}
                                  <span className="text-primary">{notif.product_name}</span>
                                </p>
                                <p className="font-mono-tech text-xs text-muted-foreground mt-1">
                                  Size {notif.size} · Qty {notif.quantity} · ${Number(notif.price).toFixed(2)}
                                </p>
                                <p className="font-mono-tech text-xs text-muted-foreground mt-0.5">
                                  {new Date(notif.created_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                                </p>

                                {notif.shipping_address && (
                                  <div className="mt-3 bg-secondary border border-foreground/10 p-3 rounded-[4px]">
                                    <p className="font-mono-tech text-xs text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1">
                                      <MapPin className="w-3 h-3" />Ship to
                                    </p>
                                    <p className="font-mono-tech text-xs">{notif.shipping_address.fullName}</p>
                                    <p className="font-mono-tech text-xs text-muted-foreground">{notif.shipping_address.address}</p>
                                    <p className="font-mono-tech text-xs text-muted-foreground">
                                      {notif.shipping_address.city}, {notif.shipping_address.state} {notif.shipping_address.zip}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                            {!notif.read && (
                              <button onClick={() => markRead(notif.id)}
                                className="font-mono-tech text-xs text-muted-foreground hover:text-foreground transition-colors shrink-0 mt-1">
                                Mark read
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ── BALANCE TAB ── */}
              {activeTab === "balance" && (
                <div className="max-w-xl space-y-6">
                  <h2 className="font-display text-2xl not-italic mb-6">Balance & Earnings</h2>

                  {/* Main balance card */}
                  <div className="card-surface p-8 text-center border-primary/30">
                    <Wallet className="w-12 h-12 text-primary mx-auto mb-4" />
                    <p className="font-mono-tech text-muted-foreground mb-2">Total Earnings</p>
                    <p className="font-display text-5xl not-italic text-primary">
                      ${stats.balance.toFixed(2)}
                    </p>
                    <p className="font-mono-tech text-xs text-muted-foreground mt-3">
                      From {stats.totalOrders} order{stats.totalOrders !== 1 ? "s" : ""} · {stats.totalUnitsSold} unit{stats.totalUnitsSold !== 1 ? "s" : ""} sold
                    </p>
                  </div>

                  {/* Breakdown */}
                  <div className="card-surface p-6">
                    <h3 className="font-display text-lg not-italic mb-4">Earnings Breakdown</h3>
                    {orders.length === 0 ? (
                      <p className="font-mono-tech text-sm text-muted-foreground">No sales yet.</p>
                    ) : (
                      <div className="space-y-3">
                        {orders.map((order) => (
                          <div key={order.id} className="flex items-center justify-between py-2 border-b border-foreground/5 last:border-0">
                            <div>
                              <p className="font-mono-tech text-sm">{order.product_name}</p>
                              <p className="font-mono-tech text-xs text-muted-foreground">
                                {new Date(order.created_at).toLocaleDateString()} · {order.buyer_name} · Qty {order.quantity}
                              </p>
                            </div>
                            <p className="font-mono tabular-nums text-primary">${Number(order.price).toFixed(2)}</p>
                          </div>
                        ))}
                        <div className="flex items-center justify-between pt-3 mt-1">
                          <p className="font-mono-tech font-bold">Total</p>
                          <p className="font-mono text-xl tabular-nums text-primary">${stats.balance.toFixed(2)}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="card-surface p-5 border-foreground/5">
                    <p className="font-mono-tech text-xs text-muted-foreground">
                      💡 Payouts are not yet automated. Contact support to withdraw your balance.
                    </p>
                  </div>
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default SellerDashboard;