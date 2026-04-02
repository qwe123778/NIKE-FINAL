import { motion } from "framer-motion";
import heroShoe from "@/assets/hero-shoe.jpg";
import { Link } from "react-router-dom";

const HeroSection = () => (
  <section className="relative min-h-screen flex items-end overflow-hidden">
    <div className="absolute inset-0">
      <img src={heroShoe} alt="Performance running shoe in motion" className="w-full h-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
    </div>
    <div className="relative z-10 w-full px-6 md:px-12 pb-[12vh] md:pb-[20vh]">
      <motion.div initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-6 h-px bg-primary" />
          <p className="font-mono-tech text-primary">New Release — SS26</p>
        </div>
        <h1 className="hero-text">YOU BUY <br />You SELL</h1>
        <p className="text-muted-foreground mt-4 mb-8 max-w-sm leading-relaxed">
          Engineered for the so lovely art of buying and selling. All in onr site. Use Sonact
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <a href="#all" className="action-button w-full sm:w-auto">
            <span>Shop All</span>
            <span className="font-mono text-sm">→</span>
          </a>
        </div>
      </motion.div>
    </div>
  </section>
);

export default HeroSection;
