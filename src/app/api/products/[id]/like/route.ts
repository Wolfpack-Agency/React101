import { addLike } from "../../likes";

// POST /api/products/3/like → { id: 3, likes: 1 }
export async function POST(_request: Request, { params }: RouteContext<"/api/products/[id]/like">) {
  const { id } = await params;
  await new Promise((resolve) => setTimeout(resolve, 500));
  return Response.json({ id: Number(id), likes: addLike(Number(id)) });
}
