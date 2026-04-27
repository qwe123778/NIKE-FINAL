import { useState, useRef, useEffect } from "react";
import { Bell, X, Check, ShoppingBag, MessageSquare, Package } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { useBuyerNotifications } from "@/hooks/use-buyer-notifications";
import { useAuth } from "@/context/AuthContext";

const iconForType = (type) => {
  if (type === "message")     return <MessageSquare className="w-4 h-4 text-blue-400" />;
  if (type === "new_product") return <Package className="w-4 h-4 text-primary" />;
  return <ShoppingBag className="w-4 h-4 text-muted-foreground" />;
};

const BuyerNotificationBell = () => {
  const { isLoggedIn, isSeller } = useAuth();
  const { notifications, unreadCount, markRead, markAllRead } = useBuyerNotifications();
  const [open, setOpen] = useState(false);
  const ref             = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (!isLoggedIn) return null;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 hover:bg-secondary transition-colors rounded-[4px]"
        title="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }} animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground font-mono text-[10px] flex items-center justify-center rounded-full"
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </motion.span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-12 w-80 bg-background border border-foreground/10 shadow-2xl z-50 rounded-[4px] overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-foreground/10">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-primary" />
                <span className="font-mono-tech text-sm font-bold">Notifications</span>
                {unreadCount > 0 && (
                  <span className="font-mono-tech text-xs text-primary">({unreadCount})</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="font-mono-tech text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                  >
                    <Check className="w-3 h-3" />All read
                  </button>
                )}
                <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* List */}
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="py-10 text-center">
                  <Bell className="w-10 h-10 text-muted-foreground/20 mx-auto mb-3" />
                  <p className="font-mono-tech text-sm text-muted-foreground">No notifications yet</p>
                  <p className="font-mono-tech text-xs text-muted-foreground/60 mt-1">
                    Follow sellers to get updates
                  </p>
                </div>
              ) : (
                notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`flex items-start gap-3 px-4 py-3 border-b border-foreground/5 hover:bg-secondary/50 transition-colors cursor-pointer ${!notif.read ? "bg-primary/3" : ""}`}
                    onClick={() => { markRead(notif.id); setOpen(false); }}
                  >
                    <div className="mt-0.5 shrink-0">{iconForType(notif.type)}</div>
                    <div className="flex-1 min-w-0">
                      <p className="font-mono-tech text-xs font-bold text-foreground truncate">{notif.title}</p>
                      <p className="font-mono-tech text-xs text-muted-foreground mt-0.5 line-clamp-2">{notif.message}</p>
                      <p className="font-mono-tech text-[10px] text-muted-foreground/50 mt-1">
                        {new Date(notif.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                    {!notif.read && (
                      <div className="w-2 h-2 bg-primary rounded-full shrink-0 mt-1.5" />
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="px-4 py-3 border-t border-foreground/10 text-center">
                <Link
                  to="/notifications"
                  onClick={() => setOpen(false)}
                  className="font-mono-tech text-xs text-primary hover:underline"
                >
                  View all notifications →
                </Link>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BuyerNotificationBell;