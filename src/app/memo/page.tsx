import { CodeBlock, Callout, Demo, PageHeader, Section } from "@/components/ui";
import { ReactMemoDemo, UseMemoDemo } from "./MemoDemos";

export const metadata = { title: "Memoizing · React 101" };

const rerenderCode = `
function Parent() {
  const [count, setCount] = useState(0);
  // Every setCount() re-runs THIS function...
  return (
    <>
      <button onClick={() => setCount(count + 1)}>{count}</button>
      <ExpensiveList />   {/* ...and by default re-renders every child too */}
    </>
  );
}
`;

const useMemoCode = `
// ❌ Runs on every render, even when only "clicks" changed
const filtered = slowFilter(products, query);

// ✅ Only re-runs when "query" (a dependency) changes
const filtered = useMemo(() => slowFilter(products, query), [query]);
`;

const memoCode = `
function ProductRow({ product, onToggleFavorite }: RowProps) { ... }

// Skip re-rendering when all props are === to last time
const MemoProductRow = memo(ProductRow);
`;

const callbackCode = `
function Parent() {
  // ❌ A NEW function every render → memo sees a "changed" prop → re-renders anyway
  const onToggle = (id: number) => setFavorites((f) => toggle(f, id));

  // ✅ The SAME function every render
  const onToggle = useCallback((id: number) => setFavorites((f) => toggle(f, id)), []);

  return <MemoProductRow product={p} onToggleFavorite={onToggle} />;
}
`;

const referenceCode = `
{} === {}                 // false
[] === []                 // false
(() => 1) === (() => 1)   // false

// So these props are "new" on every render and defeat memo():
<MemoRow style={{ color: "red" }} />
<MemoRow tags={["a", "b"]} />
<MemoRow onClick={() => doThing()} />
`;

const compilerCode = `
// next.config.ts
const nextConfig: NextConfig = {
  reactCompiler: true, // after: npm i -D babel-plugin-react-compiler
};
`;

export default function MemoPage() {
  return (
    <>
      <PageHeader eyebrow="04 · Memoizing" title="Remember the result, skip the work">
        <p>
          Memoizing means caching the result of a function so you don&apos;t redo the work if the inputs didn&apos;t
          change. React gives you three tools for it. They are <strong>performance tools</strong>, not correctness
          tools: your app should work identically without them.
        </p>
      </PageHeader>

      <Section title="First: why do components re-render?">
        <p>
          A component re-renders when its state changes, its parent re-renders, or a context it uses changes. Note the
          second one: by default, <strong>a parent re-rendering re-renders all of its children</strong>, even if their
          props didn&apos;t change. That&apos;s usually fine. React is fast, and re-rendering is not the same as
          touching the DOM.
        </p>
        <CodeBlock code={rerenderCode} />
      </Section>

      <Section title="useMemo: cache an expensive calculation">
        <CodeBlock code={useMemoCode} />
      </Section>

      <Demo title="a 150ms filter, with and without useMemo">
        <UseMemoDemo />
      </Demo>

      <Section title="React.memo + useCallback: skip re-rendering a child">
        <p>
          <code>memo()</code> wraps a component so it only re-renders when its props change. But &ldquo;change&rdquo;
          means <code>!==</code>, and in JavaScript every new object, array and function is a new reference:
        </p>
        <CodeBlock code={referenceCode} />
        <p>
          That&apos;s why <code>memo</code> and <code>useCallback</code> usually come as a pair:
        </p>
        <CodeBlock code={memoCode} />
        <CodeBlock code={callbackCode} />
      </Section>

      <Demo title="watch the rows flash yellow when they re-render">
        <ReactMemoDemo />
      </Demo>

      <Section title="When should you use them?">
        <ul>
          <li>
            <strong>useMemo</strong>: when a calculation is measurably slow (filtering/sorting large lists, heavy
            transformations), or when you need a stable object/array to pass to a memoized child or a dependency array.
          </li>
          <li>
            <strong>memo</strong>: when a component re-renders often with the same props <em>and</em> is expensive to
            render (big lists, charts, editors).
          </li>
          <li>
            <strong>useCallback</strong>: when you pass a function to a memoized child, or use it in a{" "}
            <code>useEffect</code> dependency array.
          </li>
          <li>
            <strong>Otherwise: don&apos;t.</strong> Memoizing isn&apos;t free: it costs memory, a comparison on every
            render, and readability. Measure first with the React DevTools Profiler.
          </li>
        </ul>
      </Section>

      <Callout type="tip" title="The future: React Compiler">
        <p>
          The React Compiler analyzes your components at build time and inserts the memoization for you. Next.js
          supports it with one config flag. It&apos;s deliberately <strong>off</strong> in this project so you can see
          the effect of doing it by hand, but knowing <em>why</em> memoization works is what lets you understand what
          the compiler does (and debug it when it can&apos;t).
        </p>
        <CodeBlock code={compilerCode} />
      </Callout>

      <Callout type="ai" title="Reviewing AI-generated code">
        <ul>
          <li>
            <code>useMemo(() =&gt; a + b, [a, b])</code> or <code>useCallback</code> on every handler &ldquo;just to be
            safe&rdquo;? That&apos;s noise. Remove it.
          </li>
          <li>
            Missing dependencies in the array? You&apos;ll get stale values. Trust the{" "}
            <code>react-hooks/exhaustive-deps</code> lint rule.
          </li>
          <li>
            <code>memo(Component)</code> but the parent passes <code>style=&#123;&#123;…&#125;&#125;</code> or an
            inline arrow function? The memo does nothing.
          </li>
        </ul>
      </Callout>

      <Callout type="exercise" title="Exercise">
        <p>
          In <code>MemoDemos.tsx</code>, pass <code>style=&#123;&#123; opacity: 1 &#125;&#125;</code> to{" "}
          <code>&lt;Row /&gt;</code> (and add it to <code>RowProps</code>). Turn on memo + useCallback. Why do the rows
          flash again? How would you fix it?
        </p>
      </Callout>
    </>
  );
}
