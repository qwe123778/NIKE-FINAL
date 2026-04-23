import { useState, useEffect, useCallback } from "react";
import apiFetch from "@/lib/api";
import { useAuth as useClerkAuth } from "@clerk/clerk-react";

export function useSellerDashboard() {
  const { getToken }                          = useClerkAuth();
  const [notifications, setNotifications]     = useState([]);
  const [orders, setOrders]                   = useState([]);
  const [stats, setStats]                     = useState({ balance: 0, totalOrders: 0, totalUnitsSold: 0 });
  const [loading, setLoading]                 = useState(true);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const token = await getToken();
      const headers = { Authorization: `Bearer ${token}` };

      const [notifs, sellerOrders, sellerStats] = await Promise.all([
        apiFetch("/api/sellers/notifications", { headers }),
        apiFetch("/api/sellers/orders",        { headers }),
        apiFetch("/api/sellers/stats",         { headers }),
      ]);

      setNotifications(notifs  || []);
      setOrders(sellerOrders   || []);
      setStats(sellerStats     || { balance: 0, totalOrders: 0, totalUnitsSold: 0 });
    } catch (err) {
      console.error("[useSellerDashboard]", err.message);
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const markRead = async (id) => {
    try {
      const token = await getToken();
      await apiFetch(`/api/sellers/notifications/${id}/read`, {
        method:  "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications((prev) =>
        prev.map((n) => n.id === id ? { ...n, read: true } : n)
      );
    } catch (err) {
      console.error("[markRead]", err.message);
    }
  };

  const markAllRead = async () => {
    try {
      const token = await getToken();
      await apiFetch("/api/sellers/notifications/read-all", {
        method:  "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.error("[markAllRead]", err.message);
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return { notifications, orders, stats, loading, unreadCount, markRead, markAllRead, refetch: fetchAll };
}