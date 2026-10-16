import Link from "next/link";
import { topics } from "@/lib/topics";
import { Callout } from "@/components/ui";

export default function Home() {
  return (
    <>
      <header className="mb-10 max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-wider text-accent">Hands-on tour</p>
        <h1 className="mt-2 text-5xl font-bold tracking-tight">Understand the React you ship.</h1>
        <p className="mt-4 text-lg text-muted">
          AI can write React for you. This tour is about being able to <em>read</em> it, judge it, and fix it when it
          breaks. Every page has a short explanation, a live demo and the code behind it, so open the source next to the
          browser and follow along.
        </p>
      </header>

      <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {topics.map((topic, i) => (
          <li key={topic.href}>
            <Link
              href={topic.href}
              className="group block h-full rounded-xl border border-border bg-card p-5 transition hover:-translate-y-0.5 hover:border-accent hover:shadow-md"
            >
              <span className="font-mono text-sm text-muted">{String(i + 1).padStart(2, "0")}</span>
              <h2 className="mt-1 text-xl font-semibold group-hover:text-accent">{topic.title}</h2>
              <p className="mt-2 text-sm text-muted">{topic.summary}</p>
            </Link>
          </li>
        ))}
      </ol>

      <Callout type="tip" title="How this app is built">
        <p>
          The app itself is an example of what we discuss. The cards above are generated from one array in{" "}
          <code>src/lib/topics.ts</code>, the navigation is a component, and the 🛒 in the header reads from a shared
          Context. Look at <code>src/app/layout.tsx</code> first: it is the shell around every page.
        </p>
      </Callout>
    </>
  );
}
