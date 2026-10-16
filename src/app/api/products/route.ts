import { type NextRequest } from "next/server";
import { products } from "@/lib/products";
import { getLikes } from "./likes";

// A fake, slightly unreliable backend:
//   GET /api/products?q=head          → filtered products
//   GET /api/products?q=head&fail=1   → 500 error
// Responses take a random 300–1500ms, like a real API on a bad day.
export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.toLowerCase() ?? "";
  const fail = request.nextUrl.searchParams.get("fail") === "1";

  await new Promise((resolve) => setTimeout(resolve, 300 + Math.random() * 1200));

  if (fail) {
    return Response.json({ message: "The product service is down 🔥" }, { status: 500 });
  }

  const likes = getLikes();
  const result = products
    .filter((p) => p.name.toLowerCase().includes(q))
    .map((p) => ({ ...p, likes: likes.get(p.id) ?? 0 }));

  return Response.json({ query: q, products: result, servedAt: new Date().toISOString() });
}
