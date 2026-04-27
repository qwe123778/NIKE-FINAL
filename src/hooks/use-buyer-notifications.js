import { useState, useEffect, useCallback } from "react";
import { useAuth as useClerkAuth } from "@clerk/clerk-react";
import apiFetch from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export function useBuyerNotifications() {
  const { getToken }                      = useClerkAuth();
  const { isLoggedIn }                    = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading]             = useState(false);

  const fetchNotifications = useCallback(async () => {
    if (!isLoggedIn) return;
    setLoading(true);
    try {
      const token = await getToken();
      const data  = await apiFetch("/api/buyer-notifications", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("[useBuyerNotifications]", err.message);
    } finally {
      setLoading(false);
    }
  }, [isLoggedIn, getToken]);

  useEffect(() => {
    fetchNotifications();
    // Poll every 30 seconds for new notifications
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const markRead = async (id) => {
    try {
      const token = await getToken();
      await apiFetch(`/api/buyer-notifications/${id}/read`, {
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
      await apiFetch("/api/buyer-notifications/read-all", {
        method:  "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.error("[markAllRead]", err.message);
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return { notifications, loading, unreadCount, markRead, markAllRead, refetch: fetchNotifications };
}