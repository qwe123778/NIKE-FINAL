import { useState } from "react";
import { SignUp, useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { ShoppingCart, Store } from "lucide-react";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";

/**
 * Two-step signup:
 * Step 1 — user picks buyer or seller role (our custom UI)
 * Step 2 — Clerk's <SignUp> handles name/email/password
 * After Clerk creates the account, AuthContext.setRole() writes
 * the role to Clerk metadata via our server.
 */
const Signup = () => {
  const [role, setRole] = useState(null);
  const { isSignedIn }  = useUser();
  const { setRole: saveRole, isLoaded } = useAuth();
  const navigate  = useNavigate();
  const { toast } = useToast();

  // Once Clerk finishes sign-up and user is signed in, push the role to server
  const handleAfterSignUp = async () => {
    if (!role) return navigate("/account");
    try {
      await saveRole(role);
      toast({ title: "Account created!", description: `Welcome as a ${role}.` });
      navigate(role === "seller" ? "/seller" : "/account");
    } catch {
      navigate("/account");
    }
  };

  // If user just finished Clerk sign-up and is now signed in
  if (isLoaded && isSignedIn) {
    handleAfterSignUp();
    return null;
  }

  // Step 1 — role picker
  if (!role) {
    return (
      <>
        <Navbar />
        <main className="pt-16 min-h-screen flex items-center justify-center px-4 bg-background">
          <div className="w-full max-w-md">
            <h1 className="font-display text-4xl not-italic mb-2">Create Account</h1>
            <p className="font-mono-tech text-muted-foreground mb-8">First, choose how you want to use the platform.</p>
            <div className="grid grid-cols-2 gap-4 mb-6">
              {[
                ["buyer",  ShoppingCart, "I'm a Buyer",  "Browse & purchase products"],
                ["seller", Store,        "I'm a Seller", "List & sell products"],
              ].map(([r, Icon, title, sub]) => (
                <button
                  key={r}
                  onClick={() => setRole(r)}
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
  }

  // Step 2 — Clerk handles the actual account creation
  return (
    <>
      <Navbar />
      <main className="pt-16 min-h-screen flex items-center justify-center px-4 bg-background">
        <div className="w-full max-w-md">
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={() => setRole(null)}
              className="font-mono-tech text-muted-foreground hover:text-foreground text-xs uppercase tracking-widest"
            >
              ← Back
            </button>
            <span className="font-mono-tech text-primary text-xs uppercase tracking-widest">
              Signing up as {role}
            </span>
          </div>
          <SignUp
            routing="path"
            path="/signup"
            afterSignUpUrl="/account"
            appearance={{
              variables: {
                colorPrimary:         "hsl(74 100% 50%)",
                colorBackground:      "hsl(0 0% 8%)",
                colorText:            "hsl(0 0% 98%)",
                colorInputBackground: "hsl(0 0% 12%)",
                colorInputText:       "hsl(0 0% 98%)",
                colorTextSecondary:   "hsl(0 0% 55%)",
                borderRadius:         "4px",
                fontFamily:           "inherit",
              },
              elements: {
                card:               "bg-card border border-foreground/10 shadow-xl",
                headerTitle:        "font-display not-italic text-foreground",
                formButtonPrimary:  "bg-primary text-primary-foreground hover:bg-primary/90 font-bold uppercase tracking-tighter",
                footerActionLink:   "text-primary hover:underline",
                formFieldInput:     "bg-secondary border-foreground/10 text-foreground font-mono",
              },
            }}
          />
        </div>
      </main>
    </>
  );
};

export default Signup;
