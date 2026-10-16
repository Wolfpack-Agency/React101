"use client";

import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/products";
import { Button } from "@/components/ui";
import { ProductThumbnail } from "@/components/ProductThumbnail";

// --- Demo 1: local state ---------------------------------------------------

function QuantityStepper({ label }: { label: string }) {
  const [quantity, setQuantity] = useState(1);

  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-border p-3">
      <span className="text-sm">{label}</span>
      <div className="flex items-center gap-2">
        <Button variant="secondary" onClick={() => setQuantity((q) => Math.max(1, q - 1))}>
          −
        </Button>
        <span className="w-6 text-center font-mono">{quantity}</span>
        <Button variant="secondary" onClick={() => setQuantity((q) => q + 1)}>
          +
        </Button>
      </div>
    </div>
  );
}

export function LocalStateDemo() {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <QuantityStepper label="<QuantityStepper /> #1" />
      <QuantityStepper label="<QuantityStepper /> #2" />
    </div>
  );
}

// --- Demo 2: immutability --------------------------------------------------

export function ImmutabilityDemo() {
  const [tags, setTags] = useState<string[]>(["react"]);
  const nextTag = () => `tag-${tags.length + 1}`;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <Button
          variant="secondary"
          onClick={() => {
            tags.push(nextTag()); // ❌ mutates the existing array
            setTags(tags); // same reference → React sees "nothing changed"
          }}
        >
          ❌ tags.push() + setTags(tags)
        </Button>
        <Button onClick={() => setTags([...tags, nextTag()])}>✅ setTags([...tags, newTag])</Button>
        <Button variant="secondary" onClick={() => setTags(["react"])}>
          Reset
        </Button>
      </div>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag, i) => (
          <span key={i} className="rounded-full bg-accent/15 px-3 py-1 font-mono text-xs">
            {tag}
          </span>
        ))}
      </div>
      <p className="text-xs text-muted">
        Tip: click ❌ a few times (nothing happens), then ✅ once. All the &ldquo;invisible&rdquo; pushes suddenly appear.
        The data <em>was</em> changed, React just never knew.
      </p>
    </div>
  );
}

// --- Demo 3: Context -------------------------------------------------------

export function CartSummary() {
  const { items, totalItems, totalPrice, removeFromCart, clearCart } = useCart();

  if (items.length === 0) {
    return <p className="text-sm text-muted">Your cart is empty. Add something from the tiles. →</p>;
  }

  return (
    <div className="space-y-2">
      <ul className="divide-y divide-border">
        {items.map(({ product, quantity }) => (
          <li key={product.id} className="flex items-center justify-between gap-2 py-2 text-sm">
            <span>
              <ProductThumbnail product={product} /> {product.name} <span className="text-muted">× {quantity}</span>
            </span>
            <button onClick={() => removeFromCart(product.id)} className="text-xs text-rose-500 hover:underline">
              remove
            </button>
          </li>
        ))}
      </ul>
      <div className="flex items-center justify-between border-t border-border pt-2 text-sm">
        <span>
          {totalItems} items · <strong>{formatPrice(totalPrice)}</strong>
        </span>
        <Button variant="secondary" onClick={clearCart}>
          Clear cart
        </Button>
      </div>
    </div>
  );
}
