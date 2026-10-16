"use client";

import { useCart } from "@/context/CartContext";
import type { Product } from "@/lib/products";

// The only interactive bit of a product tile, so the only part that
// needs to be a Client Component. ProductTile itself can stay on the server.
export function AddToCartButton({ product }: { product: Product }) {
  const { addToCart } = useCart();

  return (
    <button
      onClick={() => addToCart(product)}
      disabled={!product.inStock}
      className="w-full rounded-lg bg-accent px-3 py-1.5 text-sm font-medium text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
    >
      {product.inStock ? "Add to cart" : "Sold out"}
    </button>
  );
}
