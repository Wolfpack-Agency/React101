import Image from "next/image";
import type { ReactNode } from "react";
import { isOnSale, type Product } from "@/lib/products";
import { Price } from "./Price";

interface ProductTileProps {
  product: Product;
  /** Optional slot for actions (e.g. an "Add to cart" button). */
  children?: ReactNode;
}

// One component, one responsibility: show a product.
// It doesn't know about carts, APIs or pages. Whoever uses it decides
// what goes in the action slot (`children`). That's composition.
export function ProductTile({ product, children }: ProductTileProps) {
  return (
    <article className="flex flex-col rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="relative aspect-square overflow-hidden rounded-lg">
        <Image
          src={product.image.src}
          alt={product.image.alt}
          fill
          // Tells the browser how wide the image is at each breakpoint,
          // so it downloads a ~300px file instead of the 800px original.
          sizes="(min-width: 1024px) 280px, (min-width: 640px) 33vw, 50vw"
          className="object-cover"
        />
        {isOnSale(product.price, product.salePrice) && (
          <span className="absolute left-2 top-2 rounded-full bg-rose-500 px-2 py-0.5 text-xs font-semibold text-white">
            Sale
          </span>
        )}
      </div>
      <h3 className="mt-3 font-medium leading-snug">{product.name}</h3>
      <p className="mt-1 text-sm">
        <Price price={product.price} salePrice={product.salePrice} />
      </p>
      <p className={`mt-1 text-xs ${product.inStock ? "text-emerald-600" : "text-muted"}`}>
        {product.inStock ? "In stock" : "Out of stock"}
      </p>
      {children && <div className="mt-auto pt-3">{children}</div>}
    </article>
  );
}
