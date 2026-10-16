"use client";

import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { formatPrice, products, type Product } from "@/lib/products";
import { Button } from "@/components/ui";
import { useRenderFlash } from "./useRenderFlash";
import { ProductThumbnail } from "@/components/ProductThumbnail";

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-border px-3 py-1.5 text-sm">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <code className="font-mono">{label}</code>
    </label>
  );
}

// ---------------------------------------------------------------------------
// Demo 1: useMemo for an expensive calculation
// ---------------------------------------------------------------------------

// Module-level counter. Careful: the server has its own copy of this module,
// so rendering this number directly causes a hydration mismatch! We write it
// to the DOM in an effect instead (effects only run in the browser).
let computeCount = 0;

// Pretend this is heavy: sorting/filtering 10k rows, building chart data, ...
function slowFilter(items: Product[], query: string): Product[] {
  computeCount++;
  const start = performance.now();
  while (performance.now() - start < 150) {
    // burn 150ms of CPU on purpose
  }
  return items.filter((p) => p.name.toLowerCase().includes(query.toLowerCase()));
}

export function UseMemoDemo() {
  const [query, setQuery] = useState("");
  const [clicks, setClicks] = useState(0);
  const [useMemoOn, setUseMemoOn] = useState(false);

  // Both variants are always called (hooks can't be conditional);
  // the toggle only decides which result we use.
  const memoized = useMemo(() => (useMemoOn ? slowFilter(products, query) : null), [useMemoOn, query]);
  const filtered = memoized ?? slowFilter(products, query);

  const countRef = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if (countRef.current) countRef.current.textContent = String(computeCount);
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Toggle checked={useMemoOn} onChange={setUseMemoOn} label="useMemo(() => slowFilter(...), [query])" />
        <Button onClick={() => setClicks((c) => c + 1)}>Unrelated state change ({clicks})</Button>
      </div>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Filter products…"
        className="w-full rounded-lg border border-border bg-transparent px-3 py-2 text-sm"
      />
      <p className="text-sm">
        Showing <strong>{filtered.length}</strong> products ·{" "}
        <span className="text-muted">slowFilter() has run <span ref={countRef}>0</span> times (150ms each)</span>
      </p>
      <p className="text-xs text-muted">
        Spam the &ldquo;Unrelated state change&rdquo; button with useMemo off, then on. Typing still recomputes in both
        cases: that&apos;s correct, because <code>query</code> is a dependency. (In dev, Strict Mode deliberately runs
        renders twice to surface impure code, so the counter goes up in steps of two.)
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Demo 2: React.memo + useCallback for child components
// ---------------------------------------------------------------------------

interface RowProps {
  product: Product;
  isFavorite: boolean;
  onToggleFavorite: (id: number) => void;
}

function ProductRow({ product, isFavorite, onToggleFavorite }: RowProps) {
  const { elementRef, counterRef } = useRenderFlash<HTMLLIElement>();

  return (
    <li ref={elementRef} className="flex items-center justify-between gap-3 rounded-lg px-3 py-2">
      <span className="text-sm">
        <ProductThumbnail product={product} /> {product.name} <span className="text-muted">{formatPrice(product.price)}</span>
      </span>
      <span className="flex items-center gap-3">
        <span className="font-mono text-xs text-muted">
          renders: <span ref={counterRef}>1</span>
        </span>
        <button onClick={() => onToggleFavorite(product.id)} aria-label="Toggle favorite">
          {isFavorite ? "❤️" : "🤍"}
        </button>
      </span>
    </li>
  );
}

// Same component, wrapped: it now skips re-rendering when its props are
// shallow-equal (===) to the previous render's props.
const MemoProductRow = memo(ProductRow);

export function ReactMemoDemo() {
  const [clicks, setClicks] = useState(0);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [memoOn, setMemoOn] = useState(false);
  const [callbackOn, setCallbackOn] = useState(false);

  const toggle = (list: number[], id: number) =>
    list.includes(id) ? list.filter((x) => x !== id) : [...list, id];

  // Same function instance on every render:
  const stableToggle = useCallback((id: number) => setFavorites((f) => toggle(f, id)), []);
  // A brand-new function on every render:
  const inlineToggle = (id: number) => setFavorites((f) => toggle(f, id));

  const Row = memoOn ? MemoProductRow : ProductRow;
  const onToggleFavorite = callbackOn ? stableToggle : inlineToggle;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Toggle checked={memoOn} onChange={setMemoOn} label="memo(ProductRow)" />
        <Toggle checked={callbackOn} onChange={setCallbackOn} label="useCallback(onToggleFavorite)" />
        <Button onClick={() => setClicks((c) => c + 1)}>Re-render parent ({clicks})</Button>
      </div>
      <ul className="divide-y divide-border rounded-xl border border-border">
        {products.slice(0, 5).map((product) => (
          <Row
            key={product.id}
            product={product}
            isFavorite={favorites.includes(product.id)}
            onToggleFavorite={onToggleFavorite}
          />
        ))}
      </ul>
      <p className="text-xs text-muted">
        Try: <strong>memo only</strong> → still flashes on every parent render (new function prop each time).{" "}
        <strong>memo + useCallback</strong> → rows stay still, and clicking ❤️ only re-renders that one row.
      </p>
    </div>
  );
}
