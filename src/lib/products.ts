// A real image needs more than a string: a source AND a description
// for screen readers / slow connections. Making `alt` required in the
// type means nobody can forget it.
export interface ProductImage {
  src: string; // path in /public or an allowed remote URL
  alt: string;
}

// The shape of a product. Every component that touches a product
// uses this type, so a change here ripples through the whole app
// and TypeScript tells you exactly where to update things.
export interface Product {
  id: number;
  name: string;
  price: number; // in euros
  salePrice?: number; // optional: only some products are on sale
  image: ProductImage;
  category: "audio" | "wearables" | "home";
  inStock: boolean;
}

export const products: Product[] = [
  { id: 1, name: "Noise-cancelling headphones", price: 299, salePrice: 249, image: { src: "/products/headphones.png", alt: "Silver over-ear headphones with cushioned ear cups" }, category: "audio", inStock: true },
  { id: 2, name: "Smartwatch", price: 199, image: { src: "/products/smartwatch.png", alt: "Square smartwatch with an analog clock face and a black strap" }, category: "wearables", inStock: true },
  { id: 3, name: "Bluetooth speaker", price: 89, image: { src: "/products/speaker.png", alt: "Silver speaker cone with sound waves" }, category: "audio", inStock: false },
  { id: 4, name: "Smart lamp", price: 49, salePrice: 39, image: { src: "/products/lamp.png", alt: "Glowing light bulb" }, category: "home", inStock: true },
  { id: 5, name: "Fitness tracker", price: 79, image: { src: "/products/fitness-tracker.png", alt: "Grey device with a green LCD screen" }, category: "wearables", inStock: true },
  { id: 6, name: "Robot vacuum", price: 349, image: { src: "/products/robot-vacuum.png", alt: "Friendly robot head with round blue eyes" }, category: "home", inStock: true },
  { id: 7, name: "Turntable", price: 229, image: { src: "/products/turntable.png", alt: "Shiny gold disc" }, category: "audio", inStock: true },
  { id: 8, name: "Smart thermostat", price: 159, salePrice: 129, image: { src: "/products/thermostat.png", alt: "Thermometer with a red bulb" }, category: "home", inStock: false },
];

// The ONE place that decides what "on sale" means. A type predicate
// (`salePrice is number`) tells TypeScript that salePrice is defined
// whenever this returns true, so callers don't need `!` or extra checks.
export function isOnSale(price: number, salePrice: number | undefined): salePrice is number {
  return salePrice !== undefined && salePrice < price;
}

// What the customer actually pays. Used by the cart, so the tile and
// the cart total can never disagree.
export function currentPrice(product: Product): number {
  return isOnSale(product.price, product.salePrice) ? product.salePrice : product.price;
}

export function formatPrice(amount: number): string {
  // Pin the locale so server and browser always produce the same string.
  // (See the Hydration page for why this matters.)
  return new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR" }).format(amount);
}
