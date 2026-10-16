import { CodeBlock, Callout, Demo, PageHeader, Section } from "@/components/ui";
import { ErrorRetryDemo, SearchComparisonDemo, SharedCacheDemo } from "./TanStackDemos";

export const metadata = { title: "TanStack Query · React 101" };

const manualCode = `
function useProducts(query: string) {
  const [data, setData] = useState<ProductsResponse>();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setIsLoading(true);
    fetchProducts(query)
      .then(setData)
      .catch(setError)
      .finally(() => setIsLoading(false));
  }, [query]);

  return { data, isLoading, error };
}
// Still missing: race conditions, caching, deduplication, retries,
// refetch on focus, invalidation after a mutation, cancellation…
`;

const queryCode = `
const { data, isPending, isFetching, error } = useQuery({
  queryKey: ["products", { query }],   // cache key: like a dependency array
  queryFn: () => fetchProducts(query), // any function that returns a Promise
});
`;

const mutationCode = `
const queryClient = useQueryClient();

const like = useMutation({
  mutationFn: likeProduct,  // (id: number) => Promise<...>
  onSuccess: () => {
    // "Everything starting with ['products'] is out of date now"
    queryClient.invalidateQueries({ queryKey: ["products"] });
  },
});

<button onClick={() => like.mutate(product.id)} disabled={like.isPending}>👍</button>
`;

const setupCode = `
"use client";
// src/app/providers.tsx
export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
`;

const statusCode = `
// TypeScript knows: if isPending is false and error is null, data is defined
if (isPending) return <Skeleton />;
if (error)     return <ErrorMessage error={error} />;
return <ProductGrid products={data.products} />;
`;

export default function TanStackPage() {
  return (
    <>
      <PageHeader eyebrow="06 · TanStack Query" title="React's best friend for server data">
        <p>
          Data from an API is not <em>your</em> state. You don&apos;t own it, it can change without you knowing, and
          you only ever have a snapshot of it. That&apos;s <strong>server state</strong>, and it needs different tools
          than <code>useState</code>: a cache. TanStack Query (formerly React Query) is that cache.
        </p>
      </PageHeader>

      <Section title="The useEffect way">
        <p>
          This is what you&apos;ll see in most tutorials and most AI output. It looks fine, it works in the demo, and it
          has bugs you won&apos;t notice until production:
        </p>
        <CodeBlock code={manualCode} />
      </Section>

      <Section title="The useQuery way">
        <CodeBlock code={queryCode} />
        <p>
          The <code>queryKey</code> identifies the data. Same key = same cached data, shared across every component
          that asks for it. When the key changes (the user types), TanStack fetches the new data and always shows the
          result that belongs to the <em>current</em> key.
        </p>
      </Section>

      <Demo title="race condition: type fast in the search box">
        <SearchComparisonDemo />
      </Demo>

      <Section title="One cache, many components">
        <p>
          The three components below each call the same <code>useQuery</code> hook. There is <strong>one</strong>{" "}
          network request (check the Network tab), and they all stay in sync. After liking a product, the mutation
          invalidates the cache and every component updates.
        </p>
        <CodeBlock code={mutationCode} />
      </Section>

      <Demo title="deduplication, mutations and background refetching">
        <SharedCacheDemo />
        <p className="mt-3 text-xs text-muted">
          Also try: switch to another browser tab and back (refetch on window focus), or navigate to another page and
          come back (instant from cache, then a background refresh). Open the 🌴 TanStack Devtools button in the
          bottom-right corner to inspect the cache.
        </p>
      </Demo>

      <Section title="Loading and error states, built in">
        <CodeBlock code={statusCode} />
      </Section>

      <Demo title="automatic retries">
        <ErrorRetryDemo />
      </Demo>

      <Section title="What you get out of the box">
        <ul>
          <li>Caching and deduplication of identical requests</li>
          <li>No race conditions: results always match the current query key</li>
          <li>Typed loading / error / success states</li>
          <li>Retries with exponential backoff</li>
          <li>Background refetching on window focus, reconnect or an interval (polling)</li>
          <li>Mutations with cache invalidation and optimistic updates</li>
          <li>Pagination, infinite scrolling, prefetching, and great devtools</li>
        </ul>
        <p>Setup is one provider at the root of the app:</p>
        <CodeBlock title="src/app/providers.tsx (simplified)" code={setupCode} />
      </Section>

      <Callout type="tip" title="Do I still need it with Next.js / React Router?">
        <p>
          Both frameworks can load data on the server: <strong>Server Components</strong> with <code>async/await</code>{" "}
          in Next.js, and <strong>loaders</strong> in React Router. For data that is needed to render a page, start
          there. Reach for TanStack Query for data that changes <em>while the user is on the page</em>: search-as-you-type,
          filters, infinite lists, polling dashboards, likes and other mutations. The two combine well: you can
          prefetch on the server and hydrate the TanStack cache on the client.
        </p>
      </Callout>

      <Callout type="ai" title="Reviewing AI-generated code">
        <ul>
          <li>
            <code>useEffect</code> + <code>fetch</code> + three <code>useState</code>s? Ask whether it should be a{" "}
            <code>useQuery</code> (or a Server Component).
          </li>
          <li>
            Copying query data into <code>useState</code> or a Context? Now you have two sources of truth. Just call the
            hook again where you need it.
          </li>
          <li>
            <code>fetch()</code> without checking <code>res.ok</code>? A 500 response will look like success. See{" "}
            <code>src/lib/api.ts</code>.
          </li>
          <li>
            Query keys as hand-typed strings in ten files? Centralize them (see <code>productKeys</code>).
          </li>
        </ul>
      </Callout>

      <Callout type="exercise" title="Exercise">
        <p>
          Make the 👍 button feel instant with an <strong>optimistic update</strong>: in <code>onMutate</code>, use{" "}
          <code>queryClient.setQueryData</code> to bump the like count before the server responds, and roll back in{" "}
          <code>onError</code>. Then fix the useEffect version of the search with an <code>AbortController</code> and
          compare how much code each approach takes.
        </p>
      </Callout>
    </>
  );
}
