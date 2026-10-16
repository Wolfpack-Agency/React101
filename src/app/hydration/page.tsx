import { Suspense } from "react";
import Link from "next/link";
import { CodeBlock, Callout, Demo, PageHeader, Section } from "@/components/ui";
import { ClientOnlyWindowSize, HydrationStatus, LocalClock, RenderedAt } from "./HydrationDemos";

export const metadata = { title: "Hydration · React 101" };

const causesCode = `
// 1. Values that differ between server and browser
<p>{new Date().toLocaleTimeString()}</p>     // time passes, time zones differ
<p>{Math.random()}</p>                      // different every time
<p>{price.toLocaleString()}</p>             // server locale ≠ user locale

// 2. Branching on the environment
{typeof window !== "undefined" && <CartBadge />}
{localStorage.getItem("theme") === "dark" ? <Moon /> : <Sun />}

// 3. Invalid HTML: the browser "fixes" it before React sees it
<p>Price: <div>€ 10</div></p>               // <div> inside <p> is not allowed
<a href="/a"><a href="/b">nested</a></a>     // nor is <a> inside <a>
`;

const mountedCode = `
// ❌ Classic, but causes an extra render and a lint warning
const [mounted, setMounted] = useState(false);
useEffect(() => setMounted(true), []);

// ✅ Modern: useSyncExternalStore with a separate server snapshot
function useIsClient() {
  return useSyncExternalStore(
    () => () => {},  // nothing to subscribe to
    () => true,      // in the browser (after hydration)
    () => false,     // on the server and during hydration
  );
}

function LocalClock() {
  const isClient = useIsClient();
  return <p>{isClient ? new Date().toLocaleTimeString() : "--:--:--"}</p>;
}
`;

const suppressCode = `
// Only for a single element's text you KNOW will differ, like a timestamp.
// It's one level deep and not a blanket "ignore all errors" switch.
<time suppressHydrationWarning>{new Date().toISOString()}</time>
`;

const dynamicCode = `
"use client";
import dynamic from "next/dynamic";

// Skip server rendering entirely for a component that needs the browser
const Map = dynamic(() => import("./LeafletMap"), {
  ssr: false,
  loading: () => <p>Loading map…</p>,
});
`;

const formatCode = `
// ❌ Uses the server's locale on the server, the user's locale in the browser
new Intl.NumberFormat(undefined, { style: "currency", currency: "EUR" })

// ✅ Same output everywhere (see formatPrice in src/lib/products.ts)
new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR" })
`;

export default function HydrationPage() {
  return (
    <>
      <PageHeader eyebrow="05 · Hydration" title="Bringing server HTML to life">
        <p>
          Next.js renders your React components to HTML on the server, so users see content immediately. Then the
          JavaScript arrives and React <strong>hydrates</strong> that HTML: it renders the same components again in the
          browser, checks that the result matches, and attaches event handlers. Think of it as pouring water on dried
          food: same shape, now it&apos;s alive.
        </p>
      </PageHeader>

      <Section title="The timeline">
        <ol className="grid gap-3 sm:grid-cols-4">
          {[
            ["1. Server renders", "Components run on the server and produce HTML."],
            ["2. Browser paints", "HTML shows up fast. Buttons don't work yet."],
            ["3. JS loads", "React and your Client Components are downloaded."],
            ["4. Hydrate", "React re-renders, compares to the DOM, attaches handlers."],
          ].map(([title, text]) => (
            <li key={title} className="rounded-xl border border-border bg-card p-4">
              <p className="font-semibold">{title}</p>
              <p className="mt-1 text-sm text-muted">{text}</p>
            </li>
          ))}
        </ol>
      </Section>

      <Demo title="are we hydrated yet?">
        <HydrationStatus />
        <p className="mt-3 text-xs text-muted">
          Open DevTools → Network → throttle to &ldquo;Slow 4G&rdquo; and reload: you&apos;ll see the amber state and
          a dead button for a moment. Or disable JavaScript entirely: the page still renders, it just never comes alive.
        </p>
      </Demo>

      <Section title="What is a hydration mismatch?">
        <p>
          Hydration only works if the browser&apos;s first render produces <strong>exactly</strong> the same HTML as the
          server did. If it doesn&apos;t, React throws a hydration error and re-renders that part from scratch on the
          client. These are the usual suspects:
        </p>
        <CodeBlock code={causesCode} />
        <p>
          <Link href="/hydration/broken" className="font-semibold text-accent hover:underline">
            → See a real hydration error (opens a deliberately broken page)
          </Link>
        </p>
      </Section>

      <Section title="Fix 1: render browser-only values after hydration">
        <p>
          Render something neutral on the server (a placeholder, a skeleton) and switch to the real value once
          you&apos;re in the browser.
        </p>
        <CodeBlock code={mountedCode} />
      </Section>
      <Demo title="local time, without a mismatch">
        <LocalClock />
      </Demo>

      <Section title="Fix 2: suppressHydrationWarning (sparingly)">
        <CodeBlock code={suppressCode} />
      </Section>
      <Demo title="a timestamp that's allowed to differ">
        <Suspense fallback={<p className="text-sm text-muted">Rendering…</p>}>
          <RenderedAt />
        </Suspense>
        <p className="mt-2 text-xs text-muted">
          Refresh the page: you briefly see the server time, then the browser time. (The <code>&lt;Suspense&gt;</code>{" "}
          around it is required by Next.js 16&apos;s Cache Components: a value that changes on every request can&apos;t
          be baked into the static HTML at build time, so it&apos;s streamed in per request instead.)
        </p>
      </Demo>

      <Section title="Fix 3: don't render it on the server at all">
        <CodeBlock code={dynamicCode} />
      </Section>
      <Demo title="a component that reads window directly">
        <ClientOnlyWindowSize />
      </Demo>

      <Section title="Fix 4: make the output deterministic">
        <p>The best fix is often to remove the difference: pin the locale and time zone when formatting.</p>
        <CodeBlock code={formatCode} />
      </Section>

      <Callout type="tip" title="Not your fault: browser extensions">
        <p>
          Extensions like Grammarly, password managers and translators inject attributes into the DOM before React
          hydrates. If you see a mismatch on <code>&lt;body&gt;</code> or <code>&lt;html&gt;</code> that you can&apos;t
          explain, test in an incognito window first.
        </p>
      </Callout>

      <Callout type="ai" title="Reviewing AI-generated code">
        <ul>
          <li>
            <code>typeof window !== &quot;undefined&quot;</code> in the render body of a component? Likely a mismatch.
          </li>
          <li>
            <code>suppressHydrationWarning</code> slapped on a wrapper <code>&lt;div&gt;</code>? It only works one
            level deep and hides the real problem.
          </li>
          <li>
            <code>&quot;use client&quot;</code> + <code>ssr: false</code> on everything &ldquo;to fix
            hydration&rdquo;? You just turned your Next.js app back into a slow SPA.
          </li>
        </ul>
      </Callout>

      <Callout type="exercise" title="Exercise">
        <p>
          Run the dev server with a different time zone and locale than your browser (
          <code>TZ=Asia/Tokyo LANG=ja_JP.UTF-8 npm run dev</code>), then change <code>formatPrice</code> to use{" "}
          <code>undefined</code> as the locale. Find the mismatch, then fix it again.
        </p>
      </Callout>
    </>
  );
}
