import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Search, X, LayoutGrid, List, SlidersHorizontal, ChevronDown } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import ProductListItem from "@/components/ProductListItem";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useProducts } from "@/hooks/use-products";
import { useSellerProducts } from "@/context/SellerProductsContext";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

const ITEMS_PER_PAGE = 4;

const Shop = () => {
  const { sellerProducts } = useSellerProducts();
  const { products: dbProducts, loading } = useProducts();
  const products = useMemo(() => [...dbProducts, ...sellerProducts], [dbProducts, sellerProducts]);
  const categories = useMemo(() => Array.from(new Set(products.map((p) => p.category))), [products]);
  const priceRange = useMemo(() => [Math.floor(Math.min(...products.map((p) => p.price))), Math.ceil(Math.max(...products.map((p) => p.price)))], [products]);

  const [search, setSearch] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [priceFilter, setPriceFilter] = useState([0, 9999]);
  const [newOnly, setNewOnly] = useState(false);
  const [viewMode, setViewMode] = useState("grid");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleCategory = (cat) => { setSelectedCategories((prev) => prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]); setPage(1); };

  const filteredProducts = useMemo(() => {
    let result = products.filter((p) => {
      const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(p.category);
      const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.category.toLowerCase().includes(search.toLowerCase());
      const matchesPrice = p.price >= priceFilter[0] && p.price <= priceFilter[1];
      const matchesNew = !newOnly || p.isNew;
      return matchesCategory && matchesSearch && matchesPrice && matchesNew;
    });
    switch (sort) {
      case "name-asc": result = [...result].sort((a,b) => a.name.localeCompare(b.name)); break;
      case "name-desc": result = [...result].sort((a,b) => b.name.localeCompare(a.name)); break;
      case "price-asc": result = [...result].sort((a,b) => a.price - b.price); break;
      case "price-desc": result = [...result].sort((a,b) => b.price - a.price); break;
      case "newest": result = [...result].sort((a,b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0)); break;
    }
    return result;
  }, [search, selectedCategories, priceFilter, newOnly, sort, products]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / ITEMS_PER_PAGE));
  const paginatedProducts = filteredProducts.slice((page-1)*ITEMS_PER_PAGE, page*ITEMS_PER_PAGE);
  const hasActiveFilters = selectedCategories.length > 0 || newOnly || priceFilter[0] !== priceRange[0] || priceFilter[1] !== priceRange[1] || search;
  const clearFilters = () => { setSearch(""); setSelectedCategories([]); setPriceFilter(priceRange); setNewOnly(false); setPage(1); };

  return (
    <>
      <Navbar />
      <div className="min-h-screen pt-20 bg-background">
        <div className="px-6 md:px-12 py-8 border-b border-border">
          <span className="font-mono-tech text-primary text-sm">Browse</span>
          <h1 className="font-display text-4xl md:text-6xl mt-1 not-italic">Shop All</h1>
          <p className="text-muted-foreground font-mono-tech text-sm mt-2">{filteredProducts.length} product{filteredProducts.length !== 1 ? "s" : ""}</p>
        </div>

        <div className="flex">
          <aside className={`border-r border-border transition-all duration-300 shrink-0 overflow-hidden ${sidebarOpen ? "w-64 p-6" : "w-0 p-0"}`}>
            <div className="min-w-[14rem] space-y-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="pl-9 pr-9 bg-muted/50 border-border font-mono-tech text-sm" />
                {search && <button onClick={() => { setSearch(""); setPage(1); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>}
              </div>

              <Collapsible defaultOpen>
                <CollapsibleTrigger className="flex items-center justify-between w-full font-mono-tech text-xs tracking-wider text-foreground uppercase">
                  Category <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-3 space-y-2">
                  {categories.map((cat) => (
                    <label key={cat} className="flex items-center gap-2 cursor-pointer group">
                      <Checkbox checked={selectedCategories.includes(cat)} onCheckedChange={() => toggleCategory(cat)} />
                      <span className="font-mono-tech text-sm text-muted-foreground group-hover:text-foreground transition-colors">{cat}</span>
                    </label>
                  ))}
                </CollapsibleContent>
              </Collapsible>

              <Collapsible defaultOpen>
                <CollapsibleTrigger className="flex items-center justify-between w-full font-mono-tech text-xs tracking-wider text-foreground uppercase">
                  Price Range <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-3">
                  <Slider min={priceRange[0]} max={priceRange[1]} step={5} value={priceFilter} onValueChange={(val) => { setPriceFilter(val); setPage(1); }} className="mt-2" />
                  <div className="flex justify-between mt-2 font-mono-tech text-xs text-muted-foreground">
                    <span>${priceFilter[0]}</span><span>${priceFilter[1]}</span>
                  </div>
                </CollapsibleContent>
              </Collapsible>

              <label className="flex items-center gap-2 cursor-pointer group">
                <Checkbox checked={newOnly} onCheckedChange={() => { setNewOnly(!newOnly); setPage(1); }} />
                <span className="font-mono-tech text-sm text-muted-foreground group-hover:text-foreground transition-colors">New releases only</span>
              </label>

              {hasActiveFilters && (
                <button onClick={clearFilters} className="w-full py-2 border border-border text-sm font-mono-tech text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors">
                  Clear all filters
                </button>
              )}
            </div>
          </aside>

          <main className="flex-1 p-6 md:px-12">
            <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 border border-border text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors" title="Toggle filters">
                  <SlidersHorizontal className="h-4 w-4" />
                </button>
                {[["grid", LayoutGrid], ["list", List]].map(([mode, Icon]) => (
                  <button key={mode} onClick={() => setViewMode(mode)}
                    className={`p-2 border transition-colors ${viewMode === mode ? "border-primary text-primary" : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/30"}`}>
                    <Icon className="h-4 w-4" />
                  </button>
                ))}
              </div>
              <Select value={sort} onValueChange={(v) => setSort(v)}>
                <SelectTrigger className="w-48 font-mono-tech text-sm bg-muted/50 border-border"><SelectValue placeholder="Sort by" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest first</SelectItem>
                  <SelectItem value="name-asc">Name A–Z</SelectItem>
                  <SelectItem value="name-desc">Name Z–A</SelectItem>
                  <SelectItem value="price-asc">Price: Low → High</SelectItem>
                  <SelectItem value="price-desc">Price: High → Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {viewMode === "grid" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-0 border-t border-l border-foreground/10">
                {paginatedProducts.map((product, i) => (
                  <motion.div key={product.id} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: i*0.06 }}>
                    <ProductCard product={product} />
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="space-y-0 border-t border-foreground/10">
                {paginatedProducts.map((product, i) => (
                  <motion.div key={product.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: i*0.06 }}>
                    <ProductListItem product={product} />
                  </motion.div>
                ))}
              </div>
            )}

            {filteredProducts.length === 0 && <div className="py-20 text-center text-muted-foreground font-mono-tech">No shoes found matching your filters.</div>}

            {totalPages > 1 && (
              <div className="mt-10">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem><PaginationPrevious onClick={() => setPage((p) => Math.max(1,p-1))} className={`font-mono-tech cursor-pointer ${page===1?"pointer-events-none opacity-40":""}`} /></PaginationItem>
                    {Array.from({ length: totalPages }, (_,i) => i+1).map((p) => (
                      <PaginationItem key={p}><PaginationLink isActive={p===page} onClick={() => setPage(p)} className="font-mono-tech cursor-pointer">{p}</PaginationLink></PaginationItem>
                    ))}
                    <PaginationItem><PaginationNext onClick={() => setPage((p) => Math.min(totalPages,p+1))} className={`font-mono-tech cursor-pointer ${page===totalPages?"pointer-events-none opacity-40":""}`} /></PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </main>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Shop;
