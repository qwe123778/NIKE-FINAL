import shoe1 from "@/assets/shoe-1.jpg";
import shoe2 from "@/assets/shoe-2.jpg";
import shoe3 from "@/assets/shoe-3.jpg";
import shoe4 from "@/assets/shoe-4.jpg";
import shoe5 from "@/assets/shoe-5.jpg";
import shoe6 from "@/assets/shoe-6.jpg";

export const products = [
  {
    id: "1", name: "Air Zoom Alpha", category: "Running", price: 275, sku: "NK-884-01",
    image: shoe1, sizes: [7,7.5,8,8.5,9,9.5,10,10.5,11,12], weight: "240g", offset: "10mm",
    description: "Engineered for explosive speed. The Air Zoom Alpha features a carbon fiber plate and responsive ZoomX foam for race-day performance.",
    isNew: true,
  },
  {
    id: "2", name: "Court Force Pro", category: "Basketball", price: 220, sku: "NK-291-05",
    image: shoe2, sizes: [8,8.5,9,9.5,10,10.5,11,12,13], weight: "380g", offset: "12mm",
    description: "Dominate the court with responsive cushioning and a locked-in fit. Built for explosive cuts and vertical power.",
  },
  {
    id: "3", name: "Terra Trail X", category: "Trail", price: 195, sku: "NK-447-03",
    image: shoe3, sizes: [7,8,8.5,9,9.5,10,10.5,11], weight: "310g", offset: "8mm",
    description: "Aggressive lug pattern for maximum grip on technical terrain. Reinforced upper keeps debris out.",
    isNew: true,
  },
  {
    id: "4", name: "Phantom React", category: "Running", price: 185, sku: "NK-662-08",
    image: shoe4, sizes: [7,7.5,8,8.5,9,9.5,10,11], weight: "260g", offset: "10mm",
    description: "Smooth transitions and plush comfort for daily training miles. React foam delivers energy return stride after stride.",
  },
  {
    id: "5", name: "Hyperdunk Elite", category: "Basketball", price: 310, sku: "NK-119-02",
    image: shoe5, sizes: [8,9,9.5,10,10.5,11,12,13,14], weight: "410g", offset: "14mm",
    description: "Stadium-ready performance. Full-length Zoom Air unit with Flywire cables for lockdown support.",
    isNew: true,
  },
  {
    id: "6", name: "Daybreak Retro", category: "Lifestyle", price: 145, sku: "NK-773-11",
    image: shoe6, sizes: [6,7,7.5,8,8.5,9,9.5,10,10.5,11], weight: "220g", offset: "9mm",
    description: "Heritage design meets modern comfort. A clean silhouette for everyday movement.",
  },
];
