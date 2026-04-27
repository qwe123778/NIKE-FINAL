import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Send, ArrowLeft, MessageSquare } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";
import { useAuth as useClerkAuth } from "@clerk/clerk-react";
import apiFetch from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const OrderChat = () => {
  const { orderId }       = useParams();
  const { user }          = useAuth();
  const { getToken }      = useClerkAuth();
  const { toast }         = useToast();
  const bottomRef         = useRef(null);

  const [messages, setMessages]   = useState([]);
  const [message, setMessage]     = useState("");
  const [loading, setLoading]     = useState(true);
  const [sending, setSending]     = useState(false);

  const fetchMessages = async () => {
    try {
      const token = await getToken();
      const data  = await apiFetch(`/api/chat/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessages(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("[OrderChat]", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    // Poll every 5 seconds for new messages
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [orderId]);

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    setSending(true);
    try {
      const token = await getToken();
      const data  = await apiFetch(`/api/chat/${orderId}`, {
        method:  "POST",
        headers: { Authorization: `Bearer ${token}` },
        body:    JSON.stringify({ message: message.trim() }),
      });
      setMessages((prev) => [...prev, data]);
      setMessage("");
    } catch (err) {
      toast({ title: "Failed to send", description: err.message });
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="pt-16 min-h-screen flex flex-col">
        <div className="max-w-2xl mx-auto w-full px-6 py-8 flex-1 flex flex-col">

          {/* Back */}
          <Link to="/account" className="inline-flex items-center gap-2 font-mono-tech text-muted-foreground hover:text-foreground transition-colors mb-6">
            <ArrowLeft className="w-4 h-4" />Back to Account
          </Link>

          <div className="flex items-center gap-3 mb-6">
            <MessageSquare className="w-5 h-5 text-primary" />
            <div>
              <h1 className="font-display text-2xl not-italic">Order Chat</h1>
              <p className="font-mono-tech text-xs text-muted-foreground mt-0.5">{orderId}</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 border border-foreground/10 bg-secondary rounded-[4px] p-4 overflow-y-auto min-h-[400px] max-h-[500px] space-y-4 mb-4">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center gap-3">
                <MessageSquare className="w-12 h-12 text-muted-foreground/20" />
                <p className="font-mono-tech text-muted-foreground text-sm">No messages yet</p>
                <p className="font-mono-tech text-xs text-muted-foreground/60">Start the conversation below</p>
              </div>
            ) : (
              messages.map((msg) => {
                const isMe = msg.sender_id === user?.id;
                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                  >
                    <div className={`max-w-[75%] ${isMe ? "items-end" : "items-start"} flex flex-col gap-1`}>
                      <span className="font-mono-tech text-[10px] text-muted-foreground px-1">
                        {isMe ? "You" : msg.sender_name}
                      </span>
                      <div className={`px-4 py-2.5 rounded-[4px] ${
                        isMe
                          ? "bg-primary text-primary-foreground"
                          : "bg-background border border-foreground/10 text-foreground"
                      }`}>
                        <p className="font-mono-tech text-sm">{msg.message}</p>
                      </div>
                      <span className="font-mono-tech text-[10px] text-muted-foreground/50 px-1">
                        {new Date(msg.created_at).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                  </motion.div>
                );
              })
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSend} className="flex gap-3">
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 bg-secondary border border-foreground/10 px-4 py-3 font-mono text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors rounded-[4px]"
            />
            <button
              type="submit"
              disabled={sending || !message.trim()}
              className="action-button px-5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default OrderChat;