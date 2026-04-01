import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Search, X } from "lucide-react";
import HeroSection from "@/components/HeroSection";
import ProductCard from "@/components/ProductCard";
import Navbar from "@/components/Navbar";
import MarqueeBanner from "@/components/MarqueeBanner";
import Footer from "@/components/Footer";
import { useProducts } from "@/hooks/use-products";
import { Input } from "@/components/ui/input";

const Index = () => {
  const { products, loading } = useProducts();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const categories = useMemo(
    () => ["All", ...Array.from(new Set(products.map((p) => p.category)))],
    [products]
  );
  const newReleases = products.filter((p) => p.isNew);

  const filteredProducts = useMemo(() => products.filter((p) => {
    const matchesCategory = activeCategory === "All" || p.category === activeCategory;
    const matchesSearch   = p.name.toLowerCase().includes(search.toLowerCase()) ||
                            p.category.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  }), [search, activeCategory, products]);

  return (
    <>
      <Navbar />
      <MarqueeBanner />
      <HeroSection />

      {/* New Releases */}
      <section id="new" className="stadium-section px-6 md:px-12">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, ease: [0.22,1,0.36,1] }}>
          <span className="font-mono-tech text-primary">The Drop</span>
          <h2 className="font-display text-4xl md:text-6xl mt-2 not-italic">New Releases</h2>
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-0 mt-12 border-t border-l border-foreground/10">
            {[1,2,3].map((i) => <div key={i} className="border-b border-r border-foreground/10 bg-secondary aspect-[3/4] animate-pulse" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-0 mt-12 border-t border-l border-foreground/10">
            {newReleases.map((product, i) => (
              <motion.div key={product.id} initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i*0.1, ease: [0.22,1,0.36,1] }}>
                <ProductCard product={product} />
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* All Products */}
      <section id="all" className="stadium-section px-6 md:px-12">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
          <span className="font-mono-tech text-primary">Full Catalog</span>
          <h2 className="font-display text-4xl md:text-6xl mt-2 not-italic">All Shoes</h2>
        </motion.div>

        <div className="mt-8 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search shoes..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 pr-9 bg-muted/50 border-foreground/10 font-mono-tech text-sm" />
            {search && <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>}
          </div>
          <div className="flex gap-2 flex-wrap">
            {categories.map((cat) => (
              <button key={cat} onClick={() => setActiveCategory(cat)}
                className={`px-4 py-1.5 text-xs font-mono-tech tracking-wider border transition-colors ${activeCategory === cat ? "bg-primary text-primary-foreground border-primary" : "bg-transparent text-muted-foreground border-foreground/10 hover:border-foreground/30 hover:text-foreground"}`}>
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-0 mt-8 border-t border-l border-foreground/10">
          {filteredProducts.map((product, i) => (
            <motion.div key={product.id} initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i*0.08 }}>
              <ProductCard product={product} />
            </motion.div>
          ))}
          {!loading && filteredProducts.length === 0 && (
            <div className="col-span-full py-20 text-center text-muted-foreground font-mono-tech">No shoes found matching your search.</div>
          )}
        </div>
      </section>

      <Footer />
    </>
  );
};

export default Index;
