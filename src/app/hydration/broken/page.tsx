import Link from "next/link";
import { CodeBlock, Callout, PageHeader } from "@/components/ui";
import { BrokenComponent } from "./BrokenComponent";

export const metadata = { title: "Broken hydration · React 101" };

const code = `
"use client";

export function BrokenComponent() {
  const where = typeof window === "undefined" ? "on the server" : "in your browser";
  return <p>This text was rendered <strong>{where}</strong>.</p>;
}
`;

export default function BrokenHydrationPage() {
  return (
    <>
      <PageHeader eyebrow="05 · Hydration" title="💥 A hydration error, on purpose">
        <p>
          Reload this page (a full refresh, not a client-side navigation) and look at the Next.js error indicator in the
          bottom-left corner and the browser console.
        </p>
      </PageHeader>

      <div className="mb-6 rounded-xl border-2 border-rose-500/50 bg-rose-500/5 p-5">
        <BrokenComponent />
      </div>

      <CodeBlock title="src/app/hydration/broken/BrokenComponent.tsx" code={code} />

      <Callout type="warning" title="What just happened?">
        <ol className="list-decimal space-y-1 pl-5">
          <li>
            The server rendered <em>&ldquo;on the server&rdquo;</em> into the HTML.
          </li>
          <li>
            The browser ran the same component during hydration and got <em>&ldquo;in your browser&rdquo;</em>.
          </li>
          <li>
            React noticed the HTML doesn&apos;t match, threw away the server HTML for this part of the tree and
            re-rendered it on the client. You lose the performance benefit of SSR, may get a visible flash, and in
            worse cases event handlers end up attached to the wrong elements.
          </li>
        </ol>
      </Callout>

      <p className="mt-6">
        <Link href="/hydration" className="text-accent hover:underline">
          ← Back to the fixes
        </Link>
      </p>
    </>
  );
}
