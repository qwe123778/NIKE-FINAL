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
        <h1 className="hero-text">Win On<br />Your Terms</h1>
        <p className="text-muted-foreground mt-4 mb-8 max-w-sm leading-relaxed">
          Engineered for athletes who refuse to compromise. Performance built into every detail.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <a href="#all" className="action-button w-full sm:w-auto">
            <span>Shop All</span>
            <span className="font-mono text-sm">→</span>
          </a>
          <Link to="/product/1" className="h-[60px] border border-foreground/20 bg-transparent font-bold uppercase tracking-tighter flex items-center justify-between px-6 hover:bg-foreground/10 transition-colors duration-150 rounded-[4px]">
            <span>Air Zoom Alpha</span>
            <span className="font-mono text-sm ml-4">$275</span>
          </Link>
        </div>
      </motion.div>
    </div>
  </section>
);

export default HeroSection;
