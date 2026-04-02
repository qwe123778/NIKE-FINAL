import { createContext, useContext, useState, useEffect } from "react";
import { useUser, useClerk, useAuth as useClerkAuth } from "@clerk/clerk-react";
const { signOut, session } = useClerk();
import apiFetch from "@/lib/api";

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const { isSignedIn, user: clerkUser, isLoaded } = useUser();
  const { signOut }  = useClerk();
  const { getToken } = useClerkAuth();

  const [orders, setOrders]           = useState([]);
  const [serverUser, setServerUser]   = useState(null);
  const [roleLoading, setRoleLoading] = useState(false);

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
        const headers = { Authorization: `Bearer ${token}` };

        const [userData, ordersData] = await Promise.all([
          apiFetch("/api/auth/me",  { headers }),
          apiFetch("/api/orders",   { headers }),
        ]);

        setServerUser(userData);
        setOrders(Array.isArray(ordersData) ? ordersData : []);
      } catch (err) {
        console.warn("[AuthContext] load failed:", err.message);
        // Fallback to Clerk data so the UI still works
        setServerUser({
          id:    clerkUser.id,
          name:  clerkUser.fullName
                 || clerkUser.primaryEmailAddress?.emailAddress?.split("@")[0]
                 || "User",
          email: clerkUser.primaryEmailAddress?.emailAddress || "",
          role:  clerkUser.publicMetadata?.role || "buyer",
        });
      }
    };

    load();
  }, [isLoaded, isSignedIn, clerkUser?.id]);

  // const logout = async () => {
  //   setServerUser(null);
  //   setOrders([]);
  //   await signOut();
  // };

  const logout = async () => {
  setServerUser(null);
  setOrders([]);
  // Clear guest wishlist cache on logout
  localStorage.removeItem("nike-wishlist-guest");
  await signOut();
};

  /**
   * switchRole — switches between "buyer" and "seller".
   * Updates Clerk metadata via our server and reflects immediately in the UI.
   */
const switchRole = async (newRole) => {
  setRoleLoading(true);
  try {
    const token = await getToken();
    const updated = await apiFetch("/api/auth/set-role", {
      method:  "POST",
      headers: { Authorization: `Bearer ${token}` },
      body:    JSON.stringify({ role: newRole }),
    });

    // Force Clerk to refresh the session so the new role
    // is reflected in the next token
    await clerk.session?.reload();

    setServerUser((prev) => ({ ...prev, role: updated.role }));
    return updated;
  } catch (err) {
    console.error("[AuthContext] switchRole failed:", err.message);
    throw err;
  } finally {
    setRoleLoading(false);
  }
};

  // Keep setRole as alias for signup page compatibility
  const setRole = switchRole;

  const addOrder = (order) => setOrders((prev) => [order, ...prev]);

  const user = serverUser || null;

  return (
    <AuthContext.Provider value={{
      user,
      isLoggedIn:   !!user,
      isSeller:     user?.role === "seller",
      isBuyer:      user?.role === "buyer",
      isLoaded,
      roleLoading,
      logout,
      setRole,
      switchRole,
      orders,
      addOrder,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
