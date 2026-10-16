// In-memory "database". Resets when the dev server restarts, which is fine for a demo.
// Stored on globalThis so every route handler (and hot reload) sees the same Map.
const store = globalThis as typeof globalThis & { __likes?: Map<number, number> };
store.__likes ??= new Map<number, number>();
const likes = store.__likes;

export function getLikes() {
  return likes;
}

export function addLike(id: number) {
  likes.set(id, (likes.get(id) ?? 0) + 1);
  return likes.get(id)!;
}
