import { useState, useRef, useEffect, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float, MeshDistortMaterial, Sphere, Box, Torus, Octahedron, Environment, Stars, Trail, MeshWobbleMaterial } from "@react-three/drei";
import { motion, AnimatePresence, useMotionValue, useSpring } from "framer-motion";
import * as THREE from "three";
import { ShoppingCart, Heart, Zap, ArrowRight, X, Plus, Minus, Star, Menu } from "lucide-react";

// ── Custom Cursor ─────────────────────────────────────────────────────────────
const Cursor = () => {
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  const springX = useSpring(cursorX, { stiffness: 500, damping: 50 });
  const springY = useSpring(cursorY, { stiffness: 500, damping: 50 });
  const trailX  = useSpring(cursorX, { stiffness: 100, damping: 30 });
  const trailY  = useSpring(cursorY, { stiffness: 100, damping: 30 });
  const [hovering, setHovering] = useState(false);

  useEffect(() => {
    const move = (e) => { cursorX.set(e.clientX); cursorY.set(e.clientY); };
    const over = (e) => { if (e.target.closest("button,a,[data-hover]")) setHovering(true); };
    const out  = () => setHovering(false);
    window.addEventListener("mousemove", move);
    document.addEventListener("mouseover", over);
    document.addEventListener("mouseout", out);
    return () => { window.removeEventListener("mousemove", move); document.removeEventListener("mouseover", over); document.removeEventListener("mouseout", out); };
  }, []);

  return (
    <>
      <motion.div style={{ x: trailX, y: trailY, translateX: "-50%", translateY: "-50%" }}
        className="cursor-trail" />
      <motion.div style={{ x: springX, y: springY, translateX: "-50%", translateY: "-50%", scale: hovering ? 2 : 1 }}
        transition={{ scale: { type: "spring", stiffness: 400, damping: 25 } }}
        className="cursor-dot" />
      <style>{`
        .cursor-trail { position:fixed; top:0; left:0; width:32px; height:32px; border:1px solid rgba(200,255,0,0.3); border-radius:50%; pointer-events:none; z-index:9999; mix-blend-mode:difference; }
        .cursor-dot   { position:fixed; top:0; left:0; width:8px; height:8px; background:var(--accent); border-radius:50%; pointer-events:none; z-index:10000; }
      `}</style>
    </>
  );
};

// ── 3D Product Object ─────────────────────────────────────────────────────────
const ProductObject = ({ type, color, accent, hovered }) => {
  const ref = useRef();
  const time = useRef(0);

  useFrame((_, delta) => {
    time.current += delta;
    if (!ref.current) return;
    ref.current.rotation.y += delta * (hovered ? 2.5 : 0.6);
    ref.current.rotation.x = Math.sin(time.current * 0.4) * 0.15;
    ref.current.position.y = Math.sin(time.current * 0.8) * 0.1;
    ref.current.scale.setScalar(hovered ? 1.12 : 1);
  });

  const mat = <meshStandardMaterial color={color} metalness={0.8} roughness={0.1} envMapIntensity={2} emissive={accent} emissiveIntensity={hovered ? 0.4 : 0.1} />;

  return (
    <group ref={ref}>
      {type === 0 && <Box args={[1.2, 1.2, 1.2]}>{mat}</Box>}
      {type === 1 && <Sphere args={[0.85, 64, 64]}><MeshDistortMaterial color={color} metalness={0.7} roughness={0.1} distort={hovered ? 0.5 : 0.2} speed={3} emissive={accent} emissiveIntensity={0.3} /></Sphere>}
      {type === 2 && <Torus args={[0.7, 0.28, 32, 100]}>{mat}</Torus>}
      {type === 3 && <Octahedron args={[1]}>{mat}</Octahedron>}
      {type === 4 && <Box args={[0.7, 1.6, 0.7]}>{mat}</Box>}
      {type === 5 && <Sphere args={[0.9, 6, 6]}><meshStandardMaterial color={color} metalness={0.9} roughness={0.05} emissive={accent} emissiveIntensity={0.3} /></Sphere>}

      {/* Orbit ring */}
      <Torus args={[1.5, 0.01, 8, 100]} rotation={[Math.PI / 2, 0, 0]}>
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={hovered ? 2 : 0.5} transparent opacity={hovered ? 0.9 : 0.3} />
      </Torus>
    </group>
  );
};

// ── Floating Particle Field ───────────────────────────────────────────────────
const Particles = ({ count = 120 }) => {
  const mesh = useRef();
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    positions[i * 3]     = (Math.random() - 0.5) * 20;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
  }
  useFrame((state) => {
    if (mesh.current) mesh.current.rotation.y = state.clock.elapsedTime * 0.02;
  });
  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.04} color="#c8ff00" transparent opacity={0.6} sizeAttenuation />
    </points>
  );
};

// ── Hero 3D Scene ─────────────────────────────────────────────────────────────
const HeroScene = () => {
  const groupRef = useRef();
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.3;
    }
  });
  return (
    <group ref={groupRef}>
      <Float speed={2} rotationIntensity={0.4} floatIntensity={0.8}>
        <Sphere args={[1.8, 64, 64]} position={[0, 0, 0]}>
          <MeshDistortMaterial color="#0d0d20" metalness={0.9} roughness={0.05} distort={0.4} speed={2} emissive="#c8ff00" emissiveIntensity={0.15} />
        </Sphere>
      </Float>
      {[...Array(6)].map((_, i) => {
        const angle = (i / 6) * Math.PI * 2;
        const r = 3.5;
        return (
          <Float key={i} speed={1.5 + i * 0.3} floatIntensity={0.5}>
            <mesh position={[Math.cos(angle) * r, Math.sin(angle * 0.5) * 0.8, Math.sin(angle) * r * 0.4]}>
              {i % 3 === 0 ? <boxGeometry args={[0.3, 0.3, 0.3]} /> : i % 3 === 1 ? <octahedronGeometry args={[0.25]} /> : <torusGeometry args={[0.2, 0.08, 8, 24]} />}
              <meshStandardMaterial color={i % 2 === 0 ? "#c8ff00" : "#ff3cac"} emissive={i % 2 === 0 ? "#c8ff00" : "#ff3cac"} emissiveIntensity={0.8} metalness={0.9} roughness={0.1} />
            </mesh>
          </Float>
        );
      })}
      <Particles />
    </group>
  );
};

// ── Product Card Scene ────────────────────────────────────────────────────────
const ProductScene = ({ product, hovered }) => (
  <>
    <ambientLight intensity={0.3} />
    <pointLight position={[3, 3, 3]} intensity={2} color={product.accent} />
    <pointLight position={[-3, -3, 3]} intensity={1} color="#ffffff" />
    <spotLight position={[0, 5, 0]} intensity={3} color={product.accent} angle={0.4} penumbra={0.8} />
    <Stars radius={20} depth={10} count={300} factor={2} saturation={0} fade />
    <ProductObject type={product.type} color={product.color} accent={product.accent} hovered={hovered} />
    <Environment preset="city" />
  </>
);

// ── Data ──────────────────────────────────────────────────────────────────────
const PRODUCTS = [
  { id: 1, name: "VOID CUBE",      category: "Sculpture",  price: 280,  type: 0, color: "#1a1a2e", accent: "#c8ff00", rating: 4.9, reviews: 234, tag: "NEW",  desc: "Geometric brutalist sculpture. Machined from solid obsidian-coated aluminium. Each face catches light differently." },
  { id: 2, name: "PLASMA SPHERE",  category: "Art Object", price: 450,  type: 1, color: "#16213e", accent: "#ff3cac", rating: 5.0, reviews: 89,  tag: "HOT",  desc: "Dynamic form that shifts with ambient light. Borosilicate glass over chrome substrate. Limited to 50 units worldwide." },
  { id: 3, name: "RING THEORY",    category: "Jewellery",  price: 195,  type: 2, color: "#0f0e17", accent: "#38bdf8", rating: 4.7, reviews: 412, tag: null,   desc: "Continuous loop in sterling silver with blackened finish. Wearable philosophy. The ring that questions its own form." },
  { id: 4, name: "APEX NODE",      category: "Sculpture",  price: 340,  type: 3, color: "#1e1b4b", accent: "#a78bfa", rating: 4.8, reviews: 167, tag: "RARE", desc: "Eight-pointed crystalline form in hand-cast resin with iridescent metallic powder. Each piece unique." },
  { id: 5, name: "MONOLITH",       category: "Decor",      price: 520,  type: 4, color: "#0c1a0c", accent: "#4ade80", rating: 4.9, reviews: 56,  tag: "NEW",  desc: "Tall black basalt column with embedded LED matrix. Programmable light sequences. Ships in a wooden crate." },
  { id: 6, name: "LOW POLY ORB",   category: "Art Object", price: 310,  type: 5, color: "#1c1917", accent: "#fb923c", rating: 4.6, reviews: 298, tag: null,   desc: "Faceted sphere in brushed titanium. Each face catches light at a slightly different angle. Desktop centrepiece." },
];

// ── Navbar ────────────────────────────────────────────────────────────────────
const Navbar = ({ cartCount, onCartOpen }) => {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <motion.nav
      initial={{ y: -80 }} animate={{ y: 0 }} transition={{ duration: 0.8, ease: [0.22,1,0.36,1] }}
      style={{ backdropFilter: scrolled ? "blur(20px)" : "none", background: scrolled ? "rgba(5,5,7,0.85)" : "transparent", borderBottom: scrolled ? "1px solid rgba(255,255,255,0.06)" : "none" }}
      className="navbar"
    >
      <div className="nav-logo">VOLT<span style={{ color: "var(--accent)" }}>.</span></div>
      <div className="nav-links">
        {["Shop", "About", "Drops", "Studio"].map((l) => (
          <a key={l} href="#" data-hover className="nav-link">{l}</a>
        ))}
      </div>
      <div style={{ display:"flex", alignItems:"center", gap:"1rem" }}>
        <button data-hover className="icon-btn"><Heart size={18} /></button>
        <button data-hover className="cart-btn" onClick={onCartOpen}>
          <ShoppingCart size={18} />
          {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
        </button>
      </div>
      <style>{`
        .navbar { position:fixed; top:0; left:0; right:0; z-index:100; display:flex; align-items:center; justify-content:space-between; padding:1.2rem 3rem; transition: all 0.3s; }
        .nav-logo { font-family:var(--font-display); font-size:1.8rem; letter-spacing:0.05em; color:var(--text); }
        .nav-links { display:flex; gap:2rem; }
        .nav-link { font-family:var(--font-mono); font-size:0.75rem; color:var(--muted); text-decoration:none; letter-spacing:0.1em; text-transform:uppercase; transition:color 0.2s; }
        .nav-link:hover { color:var(--accent); }
        .icon-btn { background:none; border:1px solid var(--border); color:var(--muted); padding:0.5rem; border-radius:50%; cursor:none; transition:all 0.2s; }
        .icon-btn:hover { border-color:var(--accent); color:var(--accent); }
        .cart-btn { background:var(--accent); border:none; color:#000; padding:0.5rem 1rem; border-radius:2rem; cursor:none; display:flex; align-items:center; gap:0.5rem; font-family:var(--font-mono); font-size:0.75rem; position:relative; transition:transform 0.2s; }
        .cart-btn:hover { transform:scale(1.05); }
        .cart-badge { position:absolute; top:-6px; right:-6px; background:var(--accent2); color:#fff; width:18px; height:18px; border-radius:50%; font-size:0.6rem; display:flex; align-items:center; justify-content:center; }
      `}</style>
    </motion.nav>
  );
};

// ── Hero Section ──────────────────────────────────────────────────────────────
const Hero = () => (
  <section className="hero">
    <div className="hero-canvas">
      <Canvas camera={{ position: [0, 0, 8], fov: 50 }} dpr={[1, 2]}>
        <Suspense fallback={null}>
          <HeroScene />
          <Environment preset="night" />
          <ambientLight intensity={0.2} />
          <pointLight position={[5, 5, 5]} intensity={3} color="#c8ff00" />
          <pointLight position={[-5, -5, 5]} intensity={2} color="#ff3cac" />
        </Suspense>
      </Canvas>
    </div>
    <div className="hero-content">
      <motion.div initial={{ opacity:0, y:60 }} animate={{ opacity:1, y:0 }} transition={{ duration:1, delay:0.3, ease:[0.22,1,0.36,1] }}>
        <p className="hero-tag"><Zap size={12} /> NEW COLLECTION 2026</p>
        <h1 className="hero-title">OBJECTS<br/>OF DESIRE</h1>
        <p className="hero-sub">Sculptural objects that exist at the boundary between art and function. Each piece is a portal to another dimension of taste.</p>
        <div style={{ display:"flex", gap:"1rem", marginTop:"2.5rem" }}>
          <button data-hover className="btn-primary">Shop Now <ArrowRight size={16} /></button>
          <button data-hover className="btn-ghost">View Lookbook</button>
        </div>
      </motion.div>
    </div>
    <div className="hero-scroll">
      <div className="scroll-line" />
      <span className="scroll-text">SCROLL</span>
    </div>
    <style>{`
      .hero { position:relative; height:100vh; display:flex; align-items:center; overflow:hidden; }
      .hero-canvas { position:absolute; inset:0; z-index:0; }
      .hero-content { position:relative; z-index:1; padding:0 3rem; max-width:600px; }
      .hero-tag { font-family:var(--font-mono); font-size:0.7rem; color:var(--accent); letter-spacing:0.2em; text-transform:uppercase; display:flex; align-items:center; gap:0.4rem; margin-bottom:1.5rem; }
      .hero-title { font-family:var(--font-display); font-size:clamp(5rem,12vw,11rem); line-height:0.9; letter-spacing:-0.01em; color:var(--text); }
      .hero-sub { font-family:var(--font-body); font-size:1rem; color:var(--muted); max-width:400px; line-height:1.7; margin-top:1.5rem; }
      .btn-primary { display:flex; align-items:center; gap:0.6rem; background:var(--accent); color:#000; border:none; padding:0.9rem 2rem; font-family:var(--font-mono); font-size:0.8rem; letter-spacing:0.1em; text-transform:uppercase; border-radius:4px; cursor:none; font-weight:600; transition:all 0.2s; }
      .btn-primary:hover { transform:translateY(-2px); box-shadow:0 12px 40px rgba(200,255,0,0.35); }
      .btn-ghost { background:none; border:1px solid var(--border); color:var(--muted); padding:0.9rem 2rem; font-family:var(--font-mono); font-size:0.8rem; letter-spacing:0.1em; text-transform:uppercase; border-radius:4px; cursor:none; transition:all 0.2s; }
      .btn-ghost:hover { border-color:var(--text); color:var(--text); }
      .hero-scroll { position:absolute; bottom:2rem; left:3rem; display:flex; align-items:center; gap:1rem; z-index:1; }
      .scroll-line { width:40px; height:1px; background:var(--accent); }
      .scroll-text { font-family:var(--font-mono); font-size:0.6rem; color:var(--muted); letter-spacing:0.3em; }
    `}</style>
  </section>
);

// ── Product Card ──────────────────────────────────────────────────────────────
const ProductCard = ({ product, onAdd, onView }) => {
  const [hovered, setHovered] = useState(false);
  const [liked, setLiked]     = useState(false);
  const [qty, setQty]         = useState(0);

  return (
    <motion.div
      className="product-card"
      initial={{ opacity:0, y:40 }}
      whileInView={{ opacity:1, y:0 }}
      viewport={{ once:true }}
      transition={{ duration:0.6, ease:[0.22,1,0.36,1] }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      style={{ "--card-accent": product.accent }}
    >
      {/* 3D Canvas */}
      <div className="card-canvas">
        <Canvas camera={{ position:[0,0,3.5], fov:45 }} dpr={[1,2]}>
          <Suspense fallback={null}>
            <ProductScene product={product} hovered={hovered} />
          </Suspense>
        </Canvas>

        {/* Overlay badges */}
        {product.tag && (
          <span className="card-tag" style={{ background: product.accent, color: "#000" }}>
            {product.tag}
          </span>
        )}
        <button data-hover className="card-heart" onClick={() => setLiked(!liked)}
          style={{ color: liked ? "var(--accent2)" : "var(--muted)" }}>
          <Heart size={16} fill={liked ? "currentColor" : "none"} />
        </button>

        {/* Glow */}
        <div className="card-glow" style={{ opacity: hovered ? 1 : 0, background: `radial-gradient(circle at 50% 50%, ${product.accent}22, transparent 70%)` }} />
      </div>

      {/* Info */}
      <div className="card-info">
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
          <div>
            <p className="card-cat">{product.category}</p>
            <h3 className="card-name">{product.name}</h3>
          </div>
          <p className="card-price">${product.price}</p>
        </div>

        {/* Rating */}
        <div className="card-rating">
          {[...Array(5)].map((_, i) => (
            <Star key={i} size={10} fill={i < Math.floor(product.rating) ? product.accent : "transparent"}
              stroke={i < Math.floor(product.rating) ? product.accent : "var(--muted)"} />
          ))}
          <span className="rating-count">({product.reviews})</span>
        </div>

        {/* Actions */}
        <div className="card-actions">
          <button data-hover className="btn-view" onClick={() => onView(product)} style={{ borderColor: product.accent, color: product.accent }}>
            View
          </button>
          {qty === 0 ? (
            <button data-hover className="btn-add" onClick={() => { setQty(1); onAdd(product); }}
              style={{ background: product.accent }}>
              Add to Cart
            </button>
          ) : (
            <div className="qty-control">
              <button data-hover onClick={() => { setQty(q => Math.max(0, q-1)); }}>
                <Minus size={12} />
              </button>
              <span>{qty}</span>
              <button data-hover onClick={() => { setQty(q => q+1); onAdd(product); }}>
                <Plus size={12} />
              </button>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .product-card { background:var(--surface); border:1px solid var(--border); border-radius:12px; overflow:hidden; transition:all 0.4s cubic-bezier(0.22,1,0.36,1); position:relative; }
        .product-card:hover { border-color:var(--card-accent); transform:translateY(-8px) rotateX(2deg); box-shadow:0 24px 60px rgba(0,0,0,0.5), 0 0 0 1px var(--card-accent)22; }
        .card-canvas { height:260px; position:relative; overflow:hidden; background: radial-gradient(circle at 50% 80%, var(--card-accent)08, transparent 60%); }
        .card-tag { position:absolute; top:12px; left:12px; padding:3px 10px; font-family:var(--font-mono); font-size:0.6rem; font-weight:600; letter-spacing:0.1em; border-radius:2px; z-index:1; }
        .card-heart { position:absolute; top:10px; right:10px; background:rgba(5,5,7,0.7); border:none; border-radius:50%; width:32px; height:32px; display:flex; align-items:center; justify-content:center; cursor:none; transition:all 0.2s; z-index:1; }
        .card-heart:hover { transform:scale(1.2); }
        .card-glow { position:absolute; inset:0; pointer-events:none; transition:opacity 0.4s; }
        .card-info { padding:1.2rem; }
        .card-cat { font-family:var(--font-mono); font-size:0.65rem; color:var(--muted); letter-spacing:0.15em; text-transform:uppercase; margin-bottom:0.3rem; }
        .card-name { font-family:var(--font-display); font-size:1.5rem; letter-spacing:0.05em; color:var(--text); }
        .card-price { font-family:var(--font-mono); font-size:1.1rem; color:var(--accent); }
        .card-rating { display:flex; align-items:center; gap:3px; margin:0.5rem 0 1rem; }
        .rating-count { font-family:var(--font-mono); font-size:0.65rem; color:var(--muted); margin-left:4px; }
        .card-actions { display:flex; gap:0.6rem; }
        .btn-view { flex:1; background:none; border:1px solid; padding:0.6rem; font-family:var(--font-mono); font-size:0.7rem; letter-spacing:0.1em; border-radius:4px; cursor:none; transition:all 0.2s; }
        .btn-view:hover { filter:brightness(1.3); }
        .btn-add { flex:2; border:none; padding:0.6rem 1rem; font-family:var(--font-mono); font-size:0.7rem; font-weight:600; letter-spacing:0.1em; border-radius:4px; cursor:none; color:#000; transition:all 0.2s; }
        .btn-add:hover { filter:brightness(1.15); transform:scale(1.02); }
        .qty-control { flex:2; display:flex; align-items:center; justify-content:space-between; background:var(--bg); border:1px solid var(--border); border-radius:4px; padding:0 0.4rem; }
        .qty-control button { background:none; border:none; color:var(--text); padding:0.4rem; cursor:none; }
        .qty-control span { font-family:var(--font-mono); font-size:0.85rem; }
      `}</style>
    </motion.div>
  );
};

// ── Product Detail Modal ──────────────────────────────────────────────────────
const ProductModal = ({ product, onClose, onAdd }) => {
  const [hovered] = useState(true);

  if (!product) return null;
  return (
    <motion.div className="modal-overlay" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} onClick={onClose}>
      <motion.div className="modal" initial={{ opacity:0, y:60, scale:0.95 }} animate={{ opacity:1, y:0, scale:1 }}
        exit={{ opacity:0, y:40, scale:0.97 }} transition={{ duration:0.4, ease:[0.22,1,0.36,1] }}
        onClick={(e) => e.stopPropagation()}>
        <button data-hover className="modal-close" onClick={onClose}><X size={20} /></button>
        <div className="modal-canvas">
          <Canvas camera={{ position:[0,0,4], fov:45 }} dpr={[1,2]}>
            <Suspense fallback={null}>
              <ProductScene product={product} hovered={hovered} />
            </Suspense>
          </Canvas>
        </div>
        <div className="modal-info">
          <p className="card-cat">{product.category}</p>
          <h2 style={{ fontFamily:"var(--font-display)", fontSize:"3rem", letterSpacing:"0.05em", lineHeight:1 }}>{product.name}</h2>
          <div className="card-rating" style={{ margin:"1rem 0" }}>
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={14} fill={i < Math.floor(product.rating) ? product.accent : "transparent"} stroke={i < Math.floor(product.rating) ? product.accent : "var(--muted)"} />
            ))}
            <span className="rating-count" style={{ fontSize:"0.75rem" }}>{product.rating} · {product.reviews} reviews</span>
          </div>
          <p style={{ color:"var(--muted)", lineHeight:1.8, fontSize:"0.95rem", marginBottom:"1.5rem" }}>{product.desc}</p>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"1.5rem" }}>
            <span style={{ fontFamily:"var(--font-display)", fontSize:"2.5rem", color: product.accent }}>${product.price}</span>
            <span style={{ fontFamily:"var(--font-mono)", fontSize:"0.7rem", color:"var(--muted)", background:"rgba(255,255,255,0.05)", padding:"0.4rem 0.8rem", borderRadius:"4px" }}>In Stock</span>
          </div>
          <button data-hover className="btn-primary" style={{ width:"100%", justifyContent:"center", background: product.accent }}
            onClick={() => { onAdd(product); onClose(); }}>
            Add to Cart — ${product.price} <ArrowRight size={16} />
          </button>
        </div>
      </motion.div>
      <style>{`
        .modal-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.8); backdrop-filter:blur(10px); z-index:200; display:flex; align-items:center; justify-content:center; padding:1rem; }
        .modal { background:var(--surface); border:1px solid var(--border); border-radius:16px; overflow:hidden; display:grid; grid-template-columns:1fr 1fr; max-width:860px; width:100%; position:relative; }
        .modal-canvas { height:480px; background:var(--bg); }
        .modal-info { padding:2.5rem; display:flex; flex-direction:column; justify-content:center; }
        .modal-close { position:absolute; top:1rem; right:1rem; background:rgba(5,5,7,0.8); border:1px solid var(--border); color:var(--muted); width:36px; height:36px; border-radius:50%; display:flex; align-items:center; justify-content:center; cursor:none; z-index:1; transition:all 0.2s; }
        .modal-close:hover { border-color:var(--text); color:var(--text); }
      `}</style>
    </motion.div>
  );
};

// ── Cart Drawer ───────────────────────────────────────────────────────────────
const CartDrawer = ({ items, onClose, onRemove }) => {
  const total = items.reduce((s, i) => s + i.price * i.qty, 0);
  return (
    <motion.div className="cart-overlay" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} onClick={onClose}>
      <motion.div className="cart-drawer" initial={{ x:"100%" }} animate={{ x:0 }} exit={{ x:"100%" }}
        transition={{ type:"spring", stiffness:300, damping:30 }} onClick={(e) => e.stopPropagation()}>
        <div className="cart-header">
          <h2 style={{ fontFamily:"var(--font-display)", fontSize:"2rem" }}>CART</h2>
          <button data-hover className="modal-close" style={{ position:"static" }} onClick={onClose}><X size={20} /></button>
        </div>
        <div className="cart-items">
          {items.length === 0 ? (
            <div style={{ textAlign:"center", padding:"3rem 0", color:"var(--muted)", fontFamily:"var(--font-mono)", fontSize:"0.8rem" }}>
              Your cart is empty
            </div>
          ) : items.map((item) => (
            <div key={item.id} className="cart-item">
              <div style={{ width:60, height:60, background:"var(--bg)", borderRadius:8, border:"1px solid var(--border)", flexShrink:0 }}>
                <Canvas camera={{ position:[0,0,2.5], fov:50 }}>
                  <Suspense fallback={null}>
                    <ambientLight intensity={0.5} />
                    <pointLight position={[2,2,2]} intensity={2} color={item.accent} />
                    <ProductObject type={item.type} color={item.color} accent={item.accent} hovered={false} />
                  </Suspense>
                </Canvas>
              </div>
              <div style={{ flex:1 }}>
                <p style={{ fontFamily:"var(--font-display)", fontSize:"1.1rem" }}>{item.name}</p>
                <p style={{ fontFamily:"var(--font-mono)", fontSize:"0.7rem", color:"var(--muted)" }}>Qty: {item.qty}</p>
              </div>
              <div style={{ textAlign:"right" }}>
                <p style={{ fontFamily:"var(--font-mono)", color:item.accent }}>${item.price * item.qty}</p>
                <button data-hover onClick={() => onRemove(item.id)} style={{ background:"none", border:"none", color:"var(--muted)", cursor:"none", fontSize:"0.7rem", fontFamily:"var(--font-mono)", marginTop:"0.3rem" }}>Remove</button>
              </div>
            </div>
          ))}
        </div>
        {items.length > 0 && (
          <div className="cart-footer">
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"1.5rem" }}>
              <span style={{ fontFamily:"var(--font-mono)", color:"var(--muted)" }}>Total</span>
              <span style={{ fontFamily:"var(--font-display)", fontSize:"2rem", color:"var(--accent)" }}>${total}</span>
            </div>
            <button data-hover className="btn-primary" style={{ width:"100%", justifyContent:"center" }}>
              Checkout <ArrowRight size={16} />
            </button>
          </div>
        )}
      </motion.div>
      <style>{`
        .cart-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.7); backdrop-filter:blur(8px); z-index:200; }
        .cart-drawer { position:absolute; right:0; top:0; bottom:0; width:min(420px, 100vw); background:var(--surface); border-left:1px solid var(--border); display:flex; flex-direction:column; }
        .cart-header { display:flex; align-items:center; justify-content:space-between; padding:1.5rem 2rem; border-bottom:1px solid var(--border); }
        .cart-items { flex:1; overflow-y:auto; padding:1.5rem 2rem; display:flex; flex-direction:column; gap:1.2rem; }
        .cart-item { display:flex; align-items:center; gap:1rem; padding:1rem 0; border-bottom:1px solid var(--border); }
        .cart-footer { padding:1.5rem 2rem; border-top:1px solid var(--border); }
      `}</style>
    </motion.div>
  );
};

// ── Marquee ───────────────────────────────────────────────────────────────────
const Marquee = () => {
  const items = ["FREE SHIPPING OVER $300", "NEW DROPS WEEKLY", "LIMITED EDITIONS", "WORLDWIDE DELIVERY", "HANDCRAFTED OBJECTS"];
  return (
    <div className="marquee-wrap">
      <div className="marquee-track">
        {[...items, ...items, ...items].map((item, i) => (
          <span key={i} className="marquee-item">
            {item} <span className="marquee-dot">✦</span>
          </span>
        ))}
      </div>
      <style>{`
        .marquee-wrap { overflow:hidden; border-top:1px solid var(--border); border-bottom:1px solid var(--border); padding:0.8rem 0; background:var(--surface); }
        .marquee-track { display:flex; white-space:nowrap; animation:marquee 30s linear infinite; }
        .marquee-item { font-family:var(--font-mono); font-size:0.7rem; letter-spacing:0.15em; color:var(--muted); padding:0 2rem; flex-shrink:0; }
        .marquee-dot { color:var(--accent); }
        @keyframes marquee { from { transform:translateX(0); } to { transform:translateX(-33.33%); } }
      `}</style>
    </div>
  );
};

// ── Main App ──────────────────────────────────────────────────────────────────
export default function App() {
  const [cart, setCart]           = useState([]);
  const [cartOpen, setCartOpen]   = useState(false);
  const [activeProduct, setActiveProduct] = useState(null);

  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      if (existing) return prev.map((i) => i.id === product.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const removeFromCart = (id) => setCart((prev) => prev.filter((i) => i.id !== id));
  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  return (
    <div style={{ minHeight:"100vh", background:"var(--bg)" }}>
      <Cursor />
      <Navbar cartCount={cartCount} onCartOpen={() => setCartOpen(true)} />
      <Hero />
      <Marquee />

      {/* Shop Grid */}
      <section style={{ padding:"6rem 3rem" }}>
        <motion.div initial={{ opacity:0, y:30 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }}
          style={{ marginBottom:"3rem" }}>
          <p style={{ fontFamily:"var(--font-mono)", fontSize:"0.7rem", color:"var(--accent)", letterSpacing:"0.2em", textTransform:"uppercase", marginBottom:"0.5rem" }}>
            — Current Collection
          </p>
          <h2 style={{ fontFamily:"var(--font-display)", fontSize:"clamp(3rem,6vw,5rem)", letterSpacing:"0.02em", lineHeight:1 }}>
            ALL OBJECTS
          </h2>
        </motion.div>

        <div className="shop-grid">
          {PRODUCTS.map((product) => (
            <ProductCard key={product.id} product={product} onAdd={addToCart} onView={setActiveProduct} />
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop:"1px solid var(--border)", padding:"2rem 3rem", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <p style={{ fontFamily:"var(--font-display)", fontSize:"1.5rem" }}>VOLT<span style={{ color:"var(--accent)" }}>.</span></p>
        <p style={{ fontFamily:"var(--font-mono)", fontSize:"0.65rem", color:"var(--muted)" }}>© 2026 VOLT STUDIO — ALL OBJECTS RESERVED</p>
      </footer>

      {/* Modals */}
      <AnimatePresence>
        {activeProduct && (
          <ProductModal product={activeProduct} onClose={() => setActiveProduct(null)} onAdd={addToCart} />
        )}
        {cartOpen && (
          <CartDrawer items={cart} onClose={() => setCartOpen(false)} onRemove={removeFromCart} />
        )}
      </AnimatePresence>

      <style>{`
        .shop-grid { display:grid; grid-template-columns:repeat(auto-fill, minmax(300px, 1fr)); gap:1.5rem; }
      `}</style>
    </div>
  );
}
