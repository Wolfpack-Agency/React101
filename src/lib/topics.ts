// Single source of truth for the navigation and the home page cards.
// Add a topic here and it shows up everywhere.
export interface Topic {
  href: `/${string}`;
  title: string;
  summary: string;
}

export const topics: Topic[] = [
  {
    href: "/components",
    title: "Components",
    summary: "Why a product tile belongs in its own <ProductTile /> component.",
  },
  {
    href: "/typescript",
    title: "TypeScript",
    summary: "Let the compiler catch the bug before your users do.",
  },
  {
    href: "/state",
    title: "State & Context",
    summary: "From local useState to app-wide state with the Context API.",
  },
  {
    href: "/memo",
    title: "Memoizing",
    summary: "When React.memo, useMemo and useCallback actually help.",
  },
  {
    href: "/hydration",
    title: "Hydration",
    summary: "What happens between server HTML and an interactive page.",
  },
  {
    href: "/tanstack",
    title: "TanStack Query",
    summary: "Server state done right: caching, loading states, refetching.",
  },
];
