import type { Product } from "./products";

// Typed client for our fake API. Components never call fetch() directly:
// they go through these functions (and TanStack Query).

export interface ProductWithLikes extends Product {
  likes: number;
}

export interface ProductsResponse {
  query: string;
  products: ProductWithLikes[];
  servedAt: string;
}

export async function fetchProducts(query: string, { fail = false } = {}): Promise<ProductsResponse> {
  const params = new URLSearchParams({ q: query });
  if (fail) params.set("fail", "1");

  const res = await fetch(`/api/products?${params}`);
  // fetch() only rejects on network errors, NOT on 404/500. Check it yourself!
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.message ?? `Request failed with ${res.status}`);
  }
  return res.json();
}

export async function likeProduct(id: number): Promise<{ id: number; likes: number }> {
  const res = await fetch(`/api/products/${id}/like`, { method: "POST" });
  if (!res.ok) throw new Error(`Could not like product ${id}`);
  return res.json();
}

// One place that defines cache keys, so they can't drift apart.
export const productKeys = {
  all: ["products"] as const,
  search: (query: string) => ["products", { query }] as const,
};
