const items = [
  "FREE SHIPPING ON ORDERS OVER $150",
  "INSTANT CHECKOUT",
  "NEW DROPS EVERY WEEK",
  "30-DAY FREE RETURNS",
  "AUTHENTICATED PRODUCTS",
];
const repeated = [...items, ...items, ...items, ...items];

const MarqueeBanner = () => (
  <div className="bg-primary text-primary-foreground py-2.5 overflow-hidden">
    <div className="flex animate-marquee whitespace-nowrap">
      {repeated.map((item, i) => (
        <span key={i} className="inline-flex items-center">
          <span className="font-mono-tech px-6">{item}</span>
          <span className="font-mono-tech opacity-40">·</span>
        </span>
      ))}
    </div>
  </div>
);

export default MarqueeBanner;
