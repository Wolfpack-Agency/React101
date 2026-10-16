# React 101: a hands-on tour

A small Next.js app for teaching React fundamentals to developers who already write front-end code (and may lean on AI for React). Every page has a short explanation, a **live demo**, the code behind it, a "Reviewing AI-generated code" checklist and an exercise.

```bash
npm install
npm run dev
# open http://localhost:3000
```

Stack: Next.js 16 (App Router, Cache Components), React 19, TypeScript (strict), Tailwind CSS 4, TanStack Query 5.

## Topics & where the code lives

| # | Page | Demo | Key files |
|---|------|------|-----------|
| 01 | `/components` | 8 products, 1 `<ProductTile />`; reviewing a lazy first draft (`next/image`, one `<Price />`); an XSS string rendered safely | `src/components/ProductTile.tsx`, `Price.tsx`, `SourceCode.tsx` |
| 02 | `/typescript` | API sends `price: "199"` → €1.994,95 watch | `src/lib/products.ts`, `src/app/typescript/PriceBugDemo.tsx` |
| 03 | `/state` | `useState`, mutate-vs-replace bug, cart via Context | `src/context/CartContext.tsx`, `src/app/state/StateDemos.tsx` |
| 04 | `/memo` | 150ms filter ± `useMemo`; rows flash on re-render ± `memo`/`useCallback` | `src/app/memo/MemoDemos.tsx` |
| 05 | `/hydration` | hydration status, 3 fixes, plus a deliberately broken page at `/hydration/broken` | `src/app/hydration/*` |
| 06 | `/tanstack` | `useEffect` vs `useQuery` race condition, shared cache, mutation, retries | `src/app/tanstack/TanStackDemos.tsx`, `src/lib/api.ts`, `src/app/api/products/*` |

The fake API (`/api/products`) answers in a random 0.3–1.5s, so you don't need internet during the session.

## Suggested flow (≈ 2–2.5 hours)

1. **Tour of the shell (5 min).** `layout.tsx` → `providers.tsx` → `Nav.tsx`. Point out that the nav and home cards come from one array (`src/lib/topics.ts`).
2. **Components (20 min).** Show the copy-paste version, then `ProductTile`. Highlight the `children` slot (composition) and why `AddToCartButton` is the only `"use client"` part.
3. **TypeScript (20 min).** Start with the live demo, *then* explain. Do the rename exercise live: `npx tsc --noEmit`.
4. **State (30 min).** Mutate-vs-replace demo first (everyone has hit this). Then add things to the cart and point at the header badge: "how does it know?". Walk through `CartContext.tsx` top to bottom (it's numbered 1–5).
5. **Memoizing (25 min).** Let people predict which rows will flash *before* toggling. memo-without-useCallback is the aha moment.
6. **Hydration (20 min).** Throttle the network to Slow 4G to show the amber state. Open `/hydration/broken` and read the error together.
7. **TanStack Query (30 min).** Type "smart" fast in the comparison box until the left side shows the 🐛. Open the TanStack Devtools (bottom right) and the Network tab for the shared-cache demo.

## Notes for the presenter

- **Strict Mode doubles renders in dev.** That's why `slowFilter()` counts in steps of two. Worth explaining: it surfaces impure components.
- **A real hydration bug happened while building this.** The memo demo first rendered a module-level counter directly. The server's copy of the module had a different value, so hydration failed. See the comment above `computeCount` in `MemoDemos.tsx`. It's a good story for the Hydration section: it's that easy.
- **Next.js 16 Cache Components** (`cacheComponents: true`) are on. `new Date()` in a component must sit inside `<Suspense>` or the build fails. See `RenderedAt` in `hydration/page.tsx`. Mention it, but don't go deep. It's a Next.js topic, not a React one.
- **Code on the Components page is the real source.** `<SourceCode file="..." />` reads the file from disk, so the code shown can't drift from the code that runs. Product images are generated PNGs in `public/products/` (no internet needed).
- **`interface` vs. `type`.** The project convention is `interface` for object shapes and `type` for everything else (unions, utility types). ESLint enforces it (`@typescript-eslint/consistent-type-definitions` in `eslint.config.mjs`). Section 5 of the TypeScript page covers the differences.
- **React Compiler** is deliberately off so the memo demos show the manual behaviour. The memo page explains how to turn it on.
- **Lint as a teacher.** `npm run lint` flags `setState` inside `useEffect` (see the disabled rule in `TanStackDemos.tsx`). Encourage people to read lint errors instead of asking AI to silence them.
- Run `TZ=Asia/Tokyo LANG=ja_JP.UTF-8 npm run dev` for the hydration exercise.

## Exercises (one per page)

1. Add an `isNew` badge to `ProductTile`.
2. Rename `salePrice` and count the TypeScript errors.
3. Add a "decrease quantity" cart action, guided by the `CartAction` union.
4. Break memo with an inline `style={{}}` prop, then fix it.
5. Cause and fix a locale-based hydration mismatch in `formatPrice`.
6. Optimistic 👍 updates with `onMutate` / `setQueryData`; fix the `useEffect` search with `AbortController`.

Tip: use a separate git branch per exercise (`git switch -c exercise/03-state`) so `main` stays clean for the next group.
