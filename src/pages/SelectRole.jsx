import { useNavigate } from "react-router-dom";
import { ShoppingCart, Store } from "lucide-react";
import { useAuth as useClerkAuth } from "@clerk/clerk-react";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";

const SelectRole = () => {
  const { getToken }    = useClerkAuth();
  const { setRole }     = useAuth();
  const navigate        = useNavigate();
  const { toast }       = useToast();
  const API_URL         = import.meta.env.VITE_API_URL || "http://localhost:4000";

  const handleSelect = async (role) => {
    try {
      const token = await getToken();

      const res = await fetch(`${API_URL}/api/auth/set-role`, {
        method:  "POST",
        headers: {
          "Content-Type":  "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ role }),
      });

      if (!res.ok) throw new Error("Failed to set role");

      // Update local AuthContext so UI reflects instantly
      await setRole(role);

      toast({ title: "Role set!", description: `You are now a ${role}.` });
      navigate(role === "seller" ? "/seller" : "/");
    } catch (err) {
      toast({ title: "Error", description: err.message });
    }
  };

  return (
    <>
      <Navbar />
      <main className="pt-16 min-h-screen flex items-center justify-center px-4 bg-background">
        <div className="w-full max-w-md">
          <h1 className="font-display text-4xl not-italic mb-2">Choose Your Role</h1>
          <p className="font-mono-tech text-muted-foreground mb-8">
            How do you want to use the platform?
          </p>
          <div className="grid grid-cols-2 gap-4">
            {[
              ["buyer",  ShoppingCart, "I'm a Buyer",  "Browse & purchase"],
              ["seller", Store,        "I'm a Seller", "List & sell products"],
            ].map(([role, Icon, title, sub]) => (
              <button
                key={role}
                onClick={() => handleSelect(role)}
                className="flex flex-col items-center gap-3 p-6 border border-foreground/10 bg-secondary hover:border-primary hover:bg-primary/5 transition-all rounded-[4px]"
              >
                <Icon className="w-8 h-8 text-primary" />
                <span className="font-display text-lg not-italic">{title}</span>
                <span className="font-mono-tech text-xs text-muted-foreground text-center">{sub}</span>
              </button>
            ))}
          </div>
        </div>
      </main>
    </>
  );
};

export default SelectRole;