import { motion } from "framer-motion";
import { Bell, Check, MessageSquare, Package, ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useBuyerNotifications } from "@/hooks/use-buyer-notifications";
import { useAuth } from "@/context/AuthContext";

const iconForType = (type) => {
  if (type === "message")     return <MessageSquare className="w-5 h-5 text-blue-400" />;
  if (type === "new_product") return <Package className="w-5 h-5 text-primary" />;
  return <ShoppingBag className="w-5 h-5 text-muted-foreground" />;
};

const NotificationsPage = () => {
  const { isLoggedIn } = useAuth();
  const { notifications, loading, unreadCount, markRead, markAllRead } = useBuyerNotifications();

  if (!isLoggedIn) return (
    <>
      <Navbar />
      <main className="pt-16 min-h-screen flex items-center justify-center px-6">
        <div className="text-center">
          <p className="font-mono-tech text-muted-foreground mb-4">Sign in to view notifications.</p>
          <Link to="/login" className="action-button inline-flex w-auto">
            <span>Sign In</span><span className="font-mono text-sm">→</span>
          </Link>
        </div>
      </main>
    </>
  );

  return (
    <>
      <Navbar />
      <main className="pt-16 min-h-screen">
        <section className="px-6 md:px-12 py-12 max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <Bell className="w-6 h-6 text-primary" />
              <h1 className="font-display text-3xl md:text-4xl not-italic">Notifications</h1>
              {unreadCount > 0 && (
                <span className="font-mono-tech text-sm text-primary">({unreadCount} unread)</span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="flex items-center gap-2 font-mono-tech text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <Check className="w-4 h-4" />Mark all read
              </button>
            )}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : notifications.length === 0 ? (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-24">
              <Bell className="w-16 h-16 text-muted-foreground/20 mx-auto mb-4" />
              <p className="font-display text-2xl not-italic mb-2">All caught up</p>
              <p className="font-mono-tech text-muted-foreground">Follow sellers to get notified about new products.</p>
              <Link to="/shop" className="action-button inline-flex mt-8">
                <span>Browse Shop</span><span className="font-mono text-sm">→</span>
              </Link>
            </motion.div>
          ) : (
            <div className="space-y-3">
              {notifications.map((notif, i) => (
                <motion.div
                  key={notif.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => markRead(notif.id)}
                  className={`card-surface p-5 flex items-start gap-4 cursor-pointer hover:border-foreground/20 transition-all ${!notif.read ? "border-primary/30" : ""}`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${!notif.read ? "bg-primary/10" : "bg-secondary"}`}>
                    {iconForType(notif.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-mono-tech text-sm font-bold text-foreground">{notif.title}</p>
                      {!notif.read && <div className="w-2 h-2 bg-primary rounded-full shrink-0 mt-1.5" />}
                    </div>
                    <p className="font-mono-tech text-sm text-muted-foreground mt-1">{notif.message}</p>
                    <p className="font-mono-tech text-xs text-muted-foreground/50 mt-2">
                      {new Date(notif.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </p>
                    {notif.link && (
                      <Link
                        to={notif.link}
                        onClick={(e) => e.stopPropagation()}
                        className="font-mono-tech text-xs text-primary hover:underline mt-2 inline-block"
                      >
                        View →
                      </Link>
                    )}
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

export default NotificationsPage;