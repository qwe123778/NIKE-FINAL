import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User, Package, Heart, LogOut, MapPin, Settings,
  Plus, Pencil, Trash2, Check, Shield, Bell,
  ShoppingCart, Store, RefreshCw,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";
import { useWishlist } from "@/context/WishlistContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
// import SellerDashboard from "./SellerDashboard";

const TABS = [
  { key: "profile",   label: "Profile",   icon: <User className="w-4 h-4" /> },
  { key: "orders",    label: "Orders",    icon: <Package className="w-4 h-4" /> },
  { key: "addresses", label: "Addresses", icon: <MapPin className="w-4 h-4" /> },
  { key: "settings",  label: "Settings",  icon: <Settings className="w-4 h-4" /> },
];

// ── Address Form ──────────────────────────────────────────────────────────────
const AddressForm = ({ address, onSave, onCancel }) => {
  const [form, setForm] = useState(
    address || { id: "", label: "Home", name: "", street: "", city: "", state: "", zip: "", country: "US", isDefault: false }
  );
  const update = (key, val) => setForm((p) => ({ ...p, [key]: val }));

  return (
    <div className="card-surface p-6 mb-6">
      <h3 className="font-display text-lg not-italic mb-4">{address ? "Edit Address" : "New Address"}</h3>
      <div className="grid grid-cols-2 gap-3 max-w-lg">
        {[
          ["label",   "Label",   "Home, Work…", "col-span-2 sm:col-span-1"],
          ["name",    "Full Name", "",           "col-span-2 sm:col-span-1"],
          ["street",  "Street",   "",           "col-span-2"],
          ["city",    "City",     "",           ""],
          ["state",   "State",    "",           ""],
          ["zip",     "ZIP",      "",           ""],
          ["country", "Country",  "",           ""],
        ].map(([k, l, p, cls]) => (
          <div key={k} className={cls}>
            <Label className="font-mono-tech text-xs text-muted-foreground">{l}</Label>
            <Input value={form[k]} onChange={(e) => update(k, e.target.value)} placeholder={p} className="mt-1" />
          </div>
        ))}
      </div>
      <div className="flex gap-2 mt-4">
        <Button size="sm" onClick={() => onSave(form)}>Save Address</Button>
        <Button variant="ghost" size="sm" onClick={onCancel}>Cancel</Button>
      </div>
    </div>
  );
};

// ── Role Switch Card ──────────────────────────────────────────────────────────
const RoleSwitcher = ({ user, switchRole, roleLoading }) => {
  const [confirming, setConfirming] = useState(false);
  const targetRole = user.role === "buyer" ? "seller" : "buyer";

  const handleSwitch = async () => {
    if (!confirming) { setConfirming(true); return; }
    try {
      await switchRole(targetRole);
      toast.success(`Switched to ${targetRole} mode`);
      setConfirming(false);
    } catch {
      toast.error("Failed to switch role. Try again.");
      setConfirming(false);
    }
  };

  return (
    <div className="card-surface p-6">
      <div className="flex items-center gap-2 mb-1">
        <RefreshCw className="w-5 h-5 text-primary" />
        <h3 className="font-display text-lg not-italic">Switch Mode</h3>
      </div>
      <p className="font-mono-tech text-xs text-muted-foreground mb-5">
        You are currently in <span className="text-foreground font-bold uppercase">{user.role}</span> mode.
        {user.role === "buyer"
          ? " Switch to Seller to list products. You won't be able to purchase while in seller mode."
          : " Switch to Buyer to purchase products. You won't be able to list products while in buyer mode."}
      </p>

      <div className="grid grid-cols-2 gap-3 mb-5">
        {[
          ["buyer",  ShoppingCart, "Buyer Mode",  "Browse & purchase"],
          ["seller", Store,        "Seller Mode", "List & manage products"],
        ].map(([r, Icon, title, sub]) => (
          <div key={r}
            className={`flex flex-col items-center gap-2 p-4 border rounded-[4px] transition-all ${
              user.role === r
                ? "border-primary bg-primary/10"
                : "border-foreground/10 bg-secondary opacity-50"
            }`}>
            <Icon className={`w-6 h-6 ${user.role === r ? "text-primary" : "text-muted-foreground"}`} />
            <span className="font-mono-tech text-sm font-bold">{title}</span>
            <span className="font-mono-tech text-xs text-muted-foreground text-center">{sub}</span>
            {user.role === r && (
              <span className="font-mono-tech text-[10px] text-primary bg-primary/10 px-2 py-0.5 rounded-full">Active</span>
            )}
          </div>
        ))}
      </div>

      {confirming ? (
        <div className="space-y-3">
          <div className="bg-secondary border border-foreground/10 p-3 rounded-[4px]">
            <p className="font-mono-tech text-sm text-foreground">
              Switch to <span className="text-primary font-bold uppercase">{targetRole}</span> mode?
            </p>
            <p className="font-mono-tech text-xs text-muted-foreground mt-1">
              {targetRole === "seller"
                ? "You will not be able to add items to cart or checkout until you switch back."
                : "Your product listings will still exist but you won't be able to manage them until you switch back."}
            </p>
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={handleSwitch} disabled={roleLoading}>
              {roleLoading ? "Switching…" : `Yes, switch to ${targetRole}`}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setConfirming(false)}>Cancel</Button>
          </div>
        </div>
      ) : (
        <Button size="sm" onClick={handleSwitch} disabled={roleLoading} className="gap-2">
          <RefreshCw className={`w-3.5 h-3.5 ${roleLoading ? "animate-spin" : ""}`} />
          Switch to {targetRole === "buyer" ? "Buyer" : "Seller"} Mode
        </Button>
      )}
    </div>
  );
};

// ── Main Account Page ─────────────────────────────────────────────────────────
const Account = () => {
  const { user, isLoggedIn, isLoaded, logout, orders, switchRole, roleLoading } = useAuth();
  const { totalItems: wishlistCount } = useWishlist();
  const navigate = useNavigate();

  const [activeTab, setActiveTab]             = useState("profile");
const [addresses, setAddresses] = useState(() => {
  if (!user?.id) return [];
  try {
    const s = localStorage.getItem(`nike-addresses-${user.id}`);
    return s ? JSON.parse(s) : [];
  } catch { return []; }
});
  const [editingAddress, setEditingAddress]   = useState(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [notifications, setNotifications]     = useState({ orders: true, promos: false, security: true });
  const persistAddresses = (updated) => {
  setAddresses(updated);
  if (user?.id) localStorage.setItem(`nike-addresses-${user.id}`, JSON.stringify(updated));
};

  // ── Loading / unauthenticated guards ─────────────────────────────────────
  if (!isLoaded) return (
    <>
      <Navbar />
      <main className="pt-16 min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="font-mono-tech text-muted-foreground">Loading account…</p>
        </div>
      </main>
    </>
  );

  if (!isLoggedIn) return (
    <>
      <Navbar />
      <main className="pt-16 min-h-screen flex items-center justify-center px-6">
        <div className="text-center">
          <p className="font-mono-tech text-muted-foreground mb-4">You need to sign in first.</p>
          <Link to="/login" className="action-button inline-flex w-auto">
            <span>Sign In</span><span className="font-mono text-sm">→</span>
          </Link>
        </div>
      </main>
    </>
  );

const handleSaveAddress = (addr) => {
  const updated = editingAddress
    ? addresses.map((a) => a.id === addr.id ? addr : a)
    : [...addresses, { ...addr, id: "addr-" + Date.now() }];
  persistAddresses(updated);
  setEditingAddress(null);
  setShowAddressForm(false);
  toast.success(editingAddress ? "Address updated" : "Address added");
};

  return (
    <>
      <Navbar />
      <main className="pt-16 min-h-screen">
        <section className="px-6 md:px-12 py-12 max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>

            {/* ── Header ── */}
            <div className="flex items-start justify-between mb-10">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center shrink-0">
                  <User className="w-8 h-8 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="font-display text-3xl md:text-4xl not-italic">{user.name}</h1>
                  <p className="font-mono-tech text-muted-foreground text-sm">{user.email}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className={`font-mono-tech text-xs px-2.5 py-1 rounded-full ${
                      user.role === "seller"
                        ? "bg-primary/20 text-primary"
                        : "bg-secondary text-muted-foreground border border-foreground/10"
                    }`}>
                      {user.role === "seller" ? "🏪 Seller" : "🛍️ Buyer"}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => { logout(); navigate("/"); }}
                className="hidden md:flex items-center gap-2 font-mono-tech text-sm text-muted-foreground hover:text-destructive transition-colors"
              >
                <LogOut className="w-4 h-4" />Sign Out
              </button>
            </div>

            {/* ── Role access banner ── */}
            {user.role === "seller" && (
              <div className="mb-6 flex items-center gap-3 bg-primary/5 border border-primary/20 px-5 py-3 rounded-[4px]">
                <Store className="w-4 h-4 text-primary shrink-0" />
                <p className="font-mono-tech text-xs text-muted-foreground">
                  You're in <span className="text-primary font-bold">Seller Mode</span> — cart and checkout are disabled.
                  Switch to Buyer Mode in <button onClick={() => setActiveTab("settings")} className="text-primary underline">Settings</button> to shop.
                </p>
              </div>
            )}
            {user.role === "buyer" && (
              <div className="mb-6 flex items-center gap-3 bg-secondary border border-foreground/10 px-5 py-3 rounded-[4px]">
                <ShoppingCart className="w-4 h-4 text-muted-foreground shrink-0" />
                <p className="font-mono-tech text-xs text-muted-foreground">
                  You're in <span className="text-foreground font-bold">Buyer Mode</span> — switch to Seller Mode in
                  {" "}<button onClick={() => setActiveTab("settings")} className="text-primary underline">Settings</button> to list products.
                </p>
              </div>
            )}

            {/* ── Tabs ── */}
            <div className="flex gap-1 overflow-x-auto pb-2 mb-8 border-b border-border">
              {TABS.map((tab) => (
                <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-2 px-4 py-2.5 font-mono-tech text-sm whitespace-nowrap transition-colors rounded-t-md ${
                    activeTab === tab.key
                      ? "text-primary border-b-2 border-primary bg-primary/5"
                      : "text-muted-foreground hover:text-foreground"
                  }`}>
                  {tab.icon}{tab.label}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.div key={activeTab}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>

                {/* ══ PROFILE TAB ══ */}
                {activeTab === "profile" && (
                  <div className="space-y-6">
                    {/* Stats grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="card-surface p-5">
                        <Package className="w-5 h-5 text-primary mb-2" />
                        <p className="font-mono text-2xl tabular-nums">{orders.length}</p>
                        <p className="font-mono-tech text-xs text-muted-foreground">Orders</p>
                      </div>
                      <Link to="/wishlist" className="card-surface p-5 hover:border-primary/50 transition-colors">
                        <Heart className="w-5 h-5 text-primary mb-2" />
                        <p className="font-mono text-2xl tabular-nums">{wishlistCount}</p>
                        <p className="font-mono-tech text-xs text-muted-foreground">Wishlist</p>
                      </Link>
                      <div className="card-surface p-5">
                        <MapPin className="w-5 h-5 text-primary mb-2" />
                        <p className="font-mono text-2xl tabular-nums">{addresses.length}</p>
                        <p className="font-mono-tech text-xs text-muted-foreground">Addresses</p>
                      </div>
                      <div className={`card-surface p-5 ${user.role === "seller" ? "border-primary/30" : ""}`}>
                        {user.role === "seller"
                          ? <Store className="w-5 h-5 text-primary mb-2" />
                          : <ShoppingCart className="w-5 h-5 text-primary mb-2" />}
                        <p className="font-mono-tech text-sm font-bold capitalize mt-1">{user.role}</p>
                        <p className="font-mono-tech text-xs text-muted-foreground">Current Mode</p>
                      </div>
                    </div>

                    {/* Personal info */}
                    <div className="card-surface p-6">
                      <h2 className="font-display text-xl not-italic mb-4">Personal Info</h2>
                      <div className="space-y-4">
                        {[
                          ["Name",    user.name],
                          ["Email",   user.email],
                          ["Mode",    user.role === "seller" ? "Seller — can list products" : "Buyer — can purchase products"],
                          ["User ID", user.id],
                        ].map(([label, value]) => (
                          <div key={label} className="grid grid-cols-3 gap-4 py-3 border-b border-foreground/5 last:border-0">
                            <p className="font-mono-tech text-xs text-muted-foreground uppercase tracking-wider">{label}</p>
                            <p className={`col-span-2 font-mono-tech text-sm ${label === "User ID" ? "text-muted-foreground/50 text-xs" : "text-foreground"}`}>
                              {value}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Quick action for sellers */}
                    {user.role === "seller" && (
                      <div className="card-surface p-5 flex items-center justify-between">
                        <div>
                          <p className="font-mono-tech text-sm">Your Seller Dashboard</p>
                          <p className="font-mono-tech text-xs text-muted-foreground">Manage your product listings</p>
                        </div>
                        <Link to="/sellerdashboard" className="action-button px-5 h-10 text-sm">
                          <span>Go to Dashboard</span>
                          <span className="font-mono text-sm">→</span>
                        </Link>
                      </div>
                    )}
                  </div>
                )}

                {/* ══ ORDERS TAB ══ */}
                {activeTab === "orders" && (
                  <div>
                    <h2 className="font-display text-2xl not-italic mb-6">Order History</h2>
                    {orders.length === 0 ? (
                      <div className="text-center py-20">
                        <Package className="w-14 h-14 text-muted-foreground/20 mx-auto mb-4" />
                        <p className="font-display text-2xl not-italic mb-2">No orders yet</p>
                        <p className="font-mono-tech text-muted-foreground text-sm mb-8">
                          {user.role === "seller"
                            ? "Switch to Buyer Mode to start shopping."
                            : "Your completed purchases will appear here."}
                        </p>
                        {user.role === "buyer" && (
                          <Link to="/shop" className="action-button inline-flex">
                            <span>Browse Shop</span><span className="font-mono text-sm">→</span>
                          </Link>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {orders.map((order) => (
                          <div key={order.id} className="card-surface p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div>
                              <p className="font-mono-tech text-foreground">{order.id}</p>
                              <p className="font-mono-tech text-muted-foreground text-xs mt-0.5">
                                {order.created_at
                                  ? new Date(order.created_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
                                  : order.date}
                              </p>
                              <p className="text-sm text-muted-foreground mt-1.5 line-clamp-1">
                                {(order.order_items || order.items || []).map((i) => i.name).join(", ")}
                              </p>
                            </div>
                            <div className="flex items-center gap-4 shrink-0">
                              <span className={`font-mono-tech px-3 py-1 rounded-full text-[10px] uppercase tracking-wider ${
                                ["paid","delivered"].includes(order.status?.toLowerCase())   ? "bg-primary/20 text-primary" :
                                ["processing","shipped"].includes(order.status?.toLowerCase()) ? "bg-blue-500/20 text-blue-400" :
                                "bg-muted text-muted-foreground"
                              }`}>
                                {order.status}
                              </span>
                              <span className="font-mono tabular-nums text-lg">${Number(order.total).toFixed(2)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* ══ ADDRESSES TAB ══ */}
                {activeTab === "addresses" && (
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="font-display text-2xl not-italic">Saved Addresses</h2>
                      <Button size="sm" onClick={() => { setEditingAddress(null); setShowAddressForm(true); }}>
                        <Plus className="w-4 h-4 mr-1" />Add Address
                      </Button>
                    </div>

                    {showAddressForm && (
                      <AddressForm
                        address={editingAddress}
                        onSave={handleSaveAddress}
                        onCancel={() => { setShowAddressForm(false); setEditingAddress(null); }}
                      />
                    )}

                    {addresses.length === 0 ? (
                      <div className="text-center py-16">
                        <MapPin className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
                        <p className="font-mono-tech text-muted-foreground">No saved addresses yet.</p>
                      </div>
                    ) : (
                      <div className="grid md:grid-cols-2 gap-4">
                        {addresses.map((addr) => (
                          <div key={addr.id} className={`card-surface p-5 relative ${addr.isDefault ? "border-primary/40" : ""}`}>
                            {addr.isDefault && (
                              <span className="absolute top-3 right-3 font-mono-tech text-[10px] text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                                Default
                              </span>
                            )}
                            <p className="font-mono-tech text-xs text-muted-foreground uppercase tracking-wider mb-2">{addr.label}</p>
                            <p className="font-mono-tech font-bold">{addr.name}</p>
                            <p className="font-mono-tech text-sm text-muted-foreground mt-1">{addr.street}</p>
                            <p className="font-mono-tech text-sm text-muted-foreground">{addr.city}, {addr.state} {addr.zip} · {addr.country}</p>
                            <div className="flex gap-2 mt-4">
                              <Button variant="ghost" size="sm" onClick={() => { setEditingAddress(addr); setShowAddressForm(true); }}>
                                <Pencil className="w-3 h-3 mr-1" />Edit
                              </Button>
                              {!addr.isDefault && (
                                <Button variant="ghost" size="sm" onClick={() => { persistAddresses(addresses.map((a) => ({ ...a, isDefault: a.id === addr.id }))); toast.success("Default updated"); }}>
                                  <Check className="w-3 h-3 mr-1" />Set Default
                                </Button>
                              )}
                              <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive"
                              onClick={() => { persistAddresses(addresses.filter((a) => a.id !== addr.id)); toast.success("Address removed"); }}>
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* ══ SETTINGS TAB ══ */}
                {activeTab === "settings" && (
                  <div className="space-y-6 max-w-xl">

                    {/* Role switcher — the main feature */}
                    <RoleSwitcher user={user} switchRole={switchRole} roleLoading={roleLoading} />

                    {/* Notifications */}
                    <div className="card-surface p-6">
                      <div className="flex items-center gap-2 mb-5">
                        <Bell className="w-5 h-5 text-primary" />
                        <h3 className="font-display text-lg not-italic">Notifications</h3>
                      </div>
                      <div className="space-y-5">
                        {[
                          ["orders",   "Order Updates",    "Shipping and delivery status"],
                          ["promos",   "Promotions",       "New drops and exclusive deals"],
                          ["security", "Security Alerts",  "Login activity and changes"],
                        ].map(([k, title, sub], i) => (
                          <div key={k}>
                            {i > 0 && <Separator className="mb-5" />}
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-mono-tech text-sm">{title}</p>
                                <p className="font-mono-tech text-xs text-muted-foreground mt-0.5">{sub}</p>
                              </div>
                              <Switch
                                checked={notifications[k]}
                                onCheckedChange={(v) => setNotifications((p) => ({ ...p, [k]: v }))}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Security */}
                    <div className="card-surface p-6">
                      <div className="flex items-center gap-2 mb-3">
                        <Shield className="w-5 h-5 text-primary" />
                        <h3 className="font-display text-lg not-italic">Security</h3>
                      </div>
                      <p className="font-mono-tech text-sm text-muted-foreground mb-4">
                        Password, two-factor auth, and connected accounts are managed through Clerk.
                      </p>
                      <Button variant="outline" size="sm" onClick={() => toast.info("Open your Clerk account settings to manage security.")}>
                        Manage Security Settings
                      </Button>
                    </div>

                    {/* Sign out */}
                    <div className="card-surface p-6 border-destructive/20">
                      <h3 className="font-display text-lg not-italic text-destructive mb-2">Sign Out</h3>
                      <p className="font-mono-tech text-xs text-muted-foreground mb-4">
                        You'll be signed out of all devices.
                      </p>
                      <button
                        onClick={() => { logout(); navigate("/"); }}
                        className="flex items-center gap-2 font-mono-tech text-sm text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <LogOut className="w-4 h-4" />Sign Out Everywhere
                      </button>
                    </div>

                  </div>
                )}

              </motion.div>
            </AnimatePresence>
          </motion.div>
        </section>
      </main>
      <Footer />
    </>
  );
};

export default Account;
