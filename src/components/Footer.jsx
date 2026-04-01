const columns = [
  { title: "Shop", links: ["New Releases", "Running", "Basketball", "Trail", "Lifestyle", "All Shoes"] },
  { title: "Support", links: ["Shipping & Returns", "Size Guide", "Order Status", "Contact Us"] },
  { title: "Company", links: ["About Nike", "Careers", "Investors", "Sustainability", "Press"] },
];

const Footer = () => (
  <footer className="border-t border-foreground/10 px-6 md:px-12 py-16">
    <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
      <div>
        <h4 className="font-display text-xl not-italic mb-4">NIKE</h4>
        <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
          Performance is the only aesthetic. Every product engineered for athletes who refuse to settle.
        </p>
        <div className="flex gap-4 mt-6">
          {["IG", "TW", "YT", "TK"].map((s) => (
            <a key={s} href="#" className="font-mono-tech text-muted-foreground hover:text-foreground transition-colors">{s}</a>
          ))}
        </div>
      </div>
      {columns.map((col) => (
        <div key={col.title}>
          <h5 className="font-mono-tech text-foreground mb-4">{col.title}</h5>
          <ul className="space-y-2.5">
            {col.links.map((link) => (
              <li key={link}>
                <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{link}</a>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
    <div className="mt-16 pt-8 border-t border-foreground/10 flex flex-col md:flex-row justify-between items-center gap-4">
      <p className="font-mono-tech text-muted-foreground">© 2026 Nike, Inc. All rights reserved.</p>
      <div className="flex gap-6">
        {["Privacy Policy", "Terms of Use", "Cookie Settings"].map((l) => (
          <a key={l} href="#" className="font-mono-tech text-muted-foreground hover:text-foreground transition-colors">{l}</a>
        ))}
      </div>
    </div>
  </footer>
);

export default Footer;
