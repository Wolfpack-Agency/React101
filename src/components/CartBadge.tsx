"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";

// Lives in the header, far away from the "Add to cart" buttons.
// It never receives props from them: it reads the shared cart via Context.
export function CartBadge() {
  const { totalItems } = useCart();

  return (
    <Link
      href="/state"
      className="relative shrink-0 rounded-md border border-border px-3 py-1.5 text-sm hover:bg-accent/10"
      aria-label={`Cart, ${totalItems} items`}
    >
      🛒
      {totalItems > 0 && (
        <span className="absolute -right-2 -top-2 grid h-5 min-w-5 place-items-center rounded-full bg-rose-500 px-1 text-xs font-semibold text-white">
          {totalItems}
        </span>
      )}
    </Link>
  );
}
