"use client";

import { useEffect, useState } from "react";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchProducts, likeProduct, productKeys, type ProductsResponse } from "@/lib/api";
import { formatPrice } from "@/lib/products";
import { Button } from "@/components/ui";
import { ProductThumbnail } from "@/components/ProductThumbnail";

const inputClass = "w-full rounded-lg border border-border bg-transparent px-3 py-2 text-sm";

function ResultList({ data }: { data: ProductsResponse | undefined }) {
  if (!data) return null;
  if (data.products.length === 0) return <p className="text-sm text-muted">No products found.</p>;
  return (
    <ul className="space-y-1 text-sm">
      {data.products.map((p) => (
        <li key={p.id}>
          <ProductThumbnail product={p} /> {p.name}
        </li>
      ))}
    </ul>
  );
}

// ---------------------------------------------------------------------------
// Demo 1: the same search, hand-rolled vs. useQuery
// ---------------------------------------------------------------------------

// ❌ What most tutorials (and AI) write first
function useEffectSearch(query: string) {
  const [data, setData] = useState<ProductsResponse>();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Even the linter dislikes this pattern (react-hooks/set-state-in-effect). Kept on purpose.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsLoading(true);
    setError(null);
    fetchProducts(query)
      .then((result) => setData(result)) // 🐛 whichever response arrives LAST wins
      .catch((e: Error) => setError(e))
      .finally(() => setIsLoading(false));
  }, [query]);

  return { data, isLoading, error };
}

function SearchResultHeader({ query, data, isLoading }: { query: string; data?: ProductsResponse; isLoading: boolean }) {
  const stale = data && data.query !== query.toLowerCase();
  return (
    <p className="mb-2 text-xs">
      {isLoading ? "⏳ loading… " : ""}
      {data && (
        <span className={stale && !isLoading ? "font-semibold text-rose-500" : "text-muted"}>
          showing results for &ldquo;{data.query}&rdquo;
          {stale && !isLoading ? ` but you typed "${query}" 🐛` : ""}
        </span>
      )}
    </p>
  );
}

export function SearchComparisonDemo() {
  const [query, setQuery] = useState("");

  const manual = useEffectSearch(query);

  const tanstack = useQuery({
    queryKey: productKeys.search(query),
    queryFn: () => fetchProducts(query),
    placeholderData: keepPreviousData, // keep showing old results while new ones load
  });

  return (
    <div className="space-y-4">
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder='Type fast, e.g. "smart" or "s", then delete it again…'
        className={inputClass}
      />
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-border p-4">
          <p className="mb-2 font-mono text-sm font-semibold">useEffect + fetch</p>
          <SearchResultHeader query={query} data={manual.data} isLoading={manual.isLoading} />
          {manual.error && <p className="text-sm text-rose-500">{manual.error.message}</p>}
          <ResultList data={manual.data} />
        </div>
        <div className="rounded-xl border border-accent/50 p-4">
          <p className="mb-2 font-mono text-sm font-semibold">useQuery</p>
          <SearchResultHeader query={query} data={tanstack.data} isLoading={tanstack.isFetching} />
          {tanstack.error && <p className="text-sm text-rose-500">{tanstack.error.message}</p>}
          <ResultList data={tanstack.data} />
        </div>
      </div>
      <p className="text-xs text-muted">
        The API answers in a random 0.3–1.5s, so responses come back out of order. Then type a query you used before:
        the useQuery side answers instantly from its cache.
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Demo 2: one cache, many components (deduplication + shared state)
// ---------------------------------------------------------------------------

function useAllProducts() {
  return useQuery({
    queryKey: productKeys.search(""),
    queryFn: () => fetchProducts(""),
  });
}

function ProductCount() {
  const { data, isPending } = useAllProducts();
  return (
    <div className="rounded-xl border border-border p-4">
      <p className="font-mono text-xs text-muted">&lt;ProductCount /&gt;</p>
      <p className="mt-1 text-2xl font-bold">{isPending ? "…" : data?.products.length} products</p>
    </div>
  );
}

function CheapestProduct() {
  const { data, isPending } = useAllProducts();
  const cheapest = data?.products.toSorted((a, b) => a.price - b.price)[0];
  return (
    <div className="rounded-xl border border-border p-4">
      <p className="font-mono text-xs text-muted">&lt;CheapestProduct /&gt;</p>
      <p className="mt-1 text-2xl font-bold">
        {isPending ? (
          "…"
        ) : (
          cheapest && (
            <>
              <ProductThumbnail product={cheapest} /> {formatPrice(cheapest.price)}
            </>
          )
        )}
      </p>
    </div>
  );
}

function LikeList() {
  const queryClient = useQueryClient();
  const { data, isPending, isFetching, dataUpdatedAt } = useAllProducts();

  const like = useMutation({
    mutationFn: likeProduct,
    // After a successful POST, mark every "products" query as stale → they refetch.
    onSuccess: () => queryClient.invalidateQueries({ queryKey: productKeys.all }),
  });

  if (isPending) return <p className="text-sm text-muted">Loading…</p>;

  return (
    <div className="rounded-xl border border-border p-4 md:col-span-2">
      <div className="mb-2 flex items-center justify-between">
        <p className="font-mono text-xs text-muted">&lt;LikeList /&gt;</p>
        <p className="font-mono text-xs text-muted">
          {isFetching ? "🔄 refetching in background…" : `fetched at ${new Date(dataUpdatedAt).toLocaleTimeString()}`}
        </p>
      </div>
      <ul className="divide-y divide-border text-sm">
        {data?.products.slice(0, 4).map((p) => (
          <li key={p.id} className="flex items-center justify-between py-2">
            <span>
              <ProductThumbnail product={p} /> {p.name}
            </span>
            <button
              onClick={() => like.mutate(p.id)}
              disabled={like.isPending}
              className="rounded-md border border-border px-2 py-1 text-xs hover:bg-accent/10 disabled:opacity-50"
            >
              👍 {p.likes}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function SharedCacheDemo() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <ProductCount />
      <CheapestProduct />
      <LikeList />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Demo 3: errors and automatic retries
// ---------------------------------------------------------------------------

export function ErrorRetryDemo() {
  const [broken, setBroken] = useState(true);

  const { data, error, isFetching, failureCount, refetch, status } = useQuery({
    queryKey: ["flaky-products", { broken }],
    queryFn: () => fetchProducts("", { fail: broken }),
    retry: 2, // default is 3 on the client
    retryDelay: 500,
    enabled: false, // don't run on mount; wait for the button
  });

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={broken} onChange={(e) => setBroken(e.target.checked)} />
          Server is down
        </label>
        <Button onClick={() => refetch()} disabled={isFetching}>
          {isFetching ? "Fetching…" : "Fetch products"}
        </Button>
      </div>
      <dl className="grid grid-cols-3 gap-2 font-mono text-xs">
        <div className="rounded-lg border border-border p-2">
          <dt className="text-muted">status</dt>
          <dd className="font-semibold">{status}</dd>
        </div>
        <div className="rounded-lg border border-border p-2">
          <dt className="text-muted">isFetching</dt>
          <dd className="font-semibold">{String(isFetching)}</dd>
        </div>
        <div className="rounded-lg border border-border p-2">
          <dt className="text-muted">failureCount</dt>
          <dd className="font-semibold">{failureCount}</dd>
        </div>
      </dl>
      {error && !isFetching && <p className="text-sm text-rose-500">❌ {error.message} (gave up after 3 attempts)</p>}
      {data && !isFetching && <p className="text-sm text-emerald-600">✅ Loaded {data.products.length} products</p>}
    </div>
  );
}
