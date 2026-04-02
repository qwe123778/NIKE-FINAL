import { createContext, useContext, useState, useEffect } from "react";
import { useUser, useClerk, useAuth as useClerkAuth } from "@clerk/clerk-react";
import apiFetch from "@/lib/api";

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const { isSignedIn, user: clerkUser, isLoaded } = useUser();
  const { signOut, session } = useClerk(); // ✅ FIXED
  const { getToken } = useClerkAuth();

  const [orders, setOrders] = useState([]);
  const [serverUser, setServerUser] = useState(null);
  const [roleLoading, setRoleLoading] = useState(false);

  // 🔹 Load user + orders from backend
  useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn || !clerkUser) {
      setServerUser(null);
      setOrders([]);
      return;
    }

    const load = async () => {
      try {
        const token = await getToken();

        const [userData, ordersData] = await Promise.all([
          apiFetch("/api/auth/me", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          apiFetch("/api/orders", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setServerUser(userData);
        setOrders(Array.isArray(ordersData) ? ordersData : []);
      } catch (err) {
        console.warn("[AuthContext] load failed:", err.message);

        // fallback to Clerk user
        setServerUser({
          id: clerkUser.id,
          name:
            clerkUser.fullName ||
            clerkUser.primaryEmailAddress?.emailAddress?.split("@")[0] ||
            "User",
          email: clerkUser.primaryEmailAddress?.emailAddress || "",
          role: clerkUser.publicMetadata?.role || "buyer",
        });
      }
    };

    load();
  }, [isLoaded, isSignedIn, clerkUser?.id]);

  // 🔹 Logout
  const logout = async () => {
    setServerUser(null);
    setOrders([]);
    localStorage.removeItem("nike-wishlist-guest");
    await signOut();
  };

  // 🔹 Switch role (buyer ↔ seller)
  const switchRole = async (newRole) => {
    setRoleLoading(true);

    try {
      const token = await getToken();

      const updated = await apiFetch("/api/auth/set-role", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ role: newRole }),
      });

      // ✅ refresh Clerk session so role updates instantly
      await session?.reload();

      setServerUser((prev) => ({ ...prev, role: updated.role }));
      return updated;
    } catch (err) {
      console.error("[AuthContext] switchRole failed:", err.message);
      throw err;
    } finally {
      setRoleLoading(false);
    }
  };

  const setRole = switchRole;

  const addOrder = (order) => {
    setOrders((prev) => [order, ...prev]);
  };

  const user = serverUser || null;

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn: !!user,
        isSeller: user?.role === "seller",
        isBuyer: user?.role === "buyer",
        isLoaded,
        roleLoading,
        logout,
        setRole,
        switchRole,
        orders,
        addOrder,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// 🔹 Hook
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
};