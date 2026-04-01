import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { KeyRound } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";

const ForgotPassword = () => {
  const [email, setEmail] = useState(""); const [sent, setSent] = useState(false);
  const { toast } = useToast();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) { toast({ title: "Error", description: "Please enter your email." }); return; }
    setSent(true);
    toast({ title: "Reset link sent", description: "Check your email for the reset link." });
  };

  return (
    <>
      <Navbar />
      <main className="pt-16 min-h-screen flex items-center justify-center px-6">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          <div className="flex items-center gap-3 mb-8"><KeyRound className="w-6 h-6 text-primary" /><h1 className="font-display text-3xl not-italic">Reset Password</h1></div>
          {sent ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">If an account exists for <span className="text-foreground">{email}</span>, you'll receive a reset link shortly.</p>
              <Link to="/login" className="font-mono-tech text-primary hover:underline">Back to Sign In</Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="font-mono-tech text-muted-foreground block mb-2">Email Address</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com"
                  className="w-full h-12 bg-secondary border border-foreground/10 px-4 font-mono text-sm text-foreground rounded-[4px] focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <button type="submit" className="action-button w-full"><span>Send Reset Link</span><span className="font-mono text-sm">→</span></button>
              <p className="font-mono-tech text-muted-foreground text-center"><Link to="/login" className="text-primary hover:underline">Back to Sign In</Link></p>
            </form>
          )}
        </motion.div>
      </main>
    </>
  );
};

export default ForgotPassword;
