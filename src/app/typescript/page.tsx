import { CodeBlock, Callout, Demo, PageHeader, Section } from "@/components/ui";
import { PriceBugDemo } from "./PriceBugDemo";

export const metadata = { title: "TypeScript · React 101" };

const productType = `
export interface Product {
  id: number;
  name: string;
  price: number;
  salePrice?: number;               // ? = optional
  category: "audio" | "wearables" | "home"; // only these 3 strings
  inStock: boolean;
}
`;

const propsCode = `
interface ProductTileProps {
  product: Product;
  children?: ReactNode;
}

function ProductTile({ product, children }: ProductTileProps) { ... }

<ProductTile product={product} />      // ✅
<ProductTile item={product} />         // ❌ Property 'product' is missing
<ProductTile product={{ name: "X" }} /> // ❌ Missing: id, price, category, inStock
`;

const optionalCode = `
// salePrice is optional, so TypeScript forces you to handle "undefined"
const discount = product.price - product.salePrice;
//                               ~~~~~~~~~~~~~~~~~ 'product.salePrice' is possibly 'undefined'.

const discount = product.salePrice !== undefined
  ? product.price - product.salePrice  // ✅ narrowed to number here
  : 0;
`;

const unionCode = `
// A "discriminated union": each status has exactly the fields that make sense
type RequestState =
  | { status: "loading" }
  | { status: "error"; error: Error }
  | { status: "success"; data: Product[] };

function ProductList({ state }: { state: RequestState }) {
  switch (state.status) {
    case "loading": return <Spinner />;
    case "error":   return <p>{state.error.message}</p>;
    case "success": return state.data.map((p) => <ProductTile key={p.id} product={p} />);
    //                    ↑ TypeScript knows "data" only exists in this branch
  }
}
`;

const anyCode = `
const data: any = await res.json();   // 🙈 TypeScript switched off
data.prodcuts.map(...)                // typo? no error. Crash at runtime.

const data: Product[] = await res.json(); // ✅ at least tell TS what you expect
// (for real safety, validate at the boundary with a library like Zod)
`;

const interfaceVsTypeCode = `
// Both describe an object shape and behave the same 95% of the time:
interface Product { id: number; name: string }
type Product = { id: number; name: string };
`;

const onlyTypeCode = `
// Things ONLY a type alias can do
type Category = "audio" | "wearables" | "home";            // union of literals
type CartAction = { type: "add" } | { type: "clear" };     // union of objects
type Price = number;                                       // alias for a primitive
type Coordinates = [lat: number, lng: number];             // tuple
type ProductPreview = Pick<Product, "id" | "name">;        // utility / mapped types
type HexColor = \`#\${string}\`;                             // template literal type
`;

const extendsCode = `
// Extending: interface "extends" vs. type "&" (intersection)
interface ProductWithLikes extends Product {
  likes: number;
}
type ProductWithLikes = Product & { likes: number };

// The difference shows up when properties conflict:
interface Broken extends Product { id: string }
// ❌ Interface 'Broken' incorrectly extends interface 'Product'.   ← clear error

type AlsoBroken = Product & { id: string };
// 😶 No error at all... until you use it: id is now type 'never'
`;

const mergingCode = `
// Only interfaces can be "re-opened" (declaration merging).
// Handy to add types to globals or libraries:
declare global {
  interface Window {
    dataLayer: unknown[]; // Google Tag Manager
  }
}
window.dataLayer.push({ event: "add_to_cart" }); // ✅ typed

// The flip side: in a big codebase, two interfaces with the same name
// silently merge. A type alias with a duplicate name is an error.
`;

const enumCode = `
// About "enums": prefer a union of string literals
enum Category { Audio = "audio", Home = "home" } // generates runtime JS, needs an import everywhere
type Category = "audio" | "home";               // zero JS, works directly with JSON from an API

// Need the values at runtime too (e.g. for a <select>)? Derive the type from an array:
const categories = ["audio", "wearables", "home"] as const;
type Category = (typeof categories)[number]; // "audio" | "wearables" | "home"

// And no, TypeScript has no regex types. Template literals are as close as it gets:
type Email = \`\${string}@\${string}\`; // checks the rough shape, not a real validation
`;

const eslintCode = `
// eslint.config.mjs
rules: {
  "@typescript-eslint/consistent-type-definitions": ["error", "interface"],
}
// npm run lint -- --fix  converts every object "type" to an "interface" for you
`;

export default function TypeScriptPage() {
  return (
    <>
      <PageHeader eyebrow="02 · TypeScript" title="Types are tests you get for free">
        <p>
          TypeScript is JavaScript plus a description of the <em>shape</em> of your data. The browser never sees it; it
          is checked in your editor and at build time, then stripped away.
        </p>
      </PageHeader>

      <Demo title="the bug that JavaScript lets through">
        <PriceBugDemo />
      </Demo>

      <Section title="1. Describe your data once">
        <p>
          Everything in this app that touches a product uses one <code>interface</code> (more on{" "}
          <code>interface</code> vs. <code>type</code> in section 5). Rename a field and your editor lights up every
          place that needs updating, instead of your users finding them.
        </p>
        <CodeBlock title="src/lib/products.ts" code={productType} />
      </Section>

      <Section title="2. Props become a contract">
        <p>
          Component props are just function arguments. Typing them means the component can&apos;t be used wrong, and you
          get autocomplete for free, which is the best documentation there is.
        </p>
        <CodeBlock code={propsCode} />
      </Section>

      <Section title="3. It makes you handle the edge cases">
        <p>
          Most real-world bugs are <code>undefined</code> showing up where you didn&apos;t expect it. With{" "}
          <code>strict</code> mode on (it is in this project&apos;s <code>tsconfig.json</code>), TypeScript won&apos;t
          let you forget.
        </p>
        <CodeBlock code={optionalCode} />
      </Section>

      <Section title="4. Model states, not just values">
        <p>
          Union types let you describe &ldquo;either this or that&rdquo;. This pattern removes a whole class of bugs
          like showing a spinner and an error at the same time. TanStack Query uses exactly this idea (see page 06).
        </p>
        <CodeBlock code={unionCode} />
      </Section>

      <Section title="5. interface or type?">
        <p>
          You&apos;ll see both in every codebase (and AI will happily mix them in one file). For describing an object,
          they&apos;re nearly interchangeable:
        </p>
        <CodeBlock code={interfaceVsTypeCode} />
        <div className="my-4 overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-left text-sm">
            <thead className="bg-accent/5 text-xs uppercase tracking-wider text-muted">
              <tr>
                <th className="px-4 py-2 font-semibold"></th>
                <th className="px-4 py-2 font-mono font-semibold normal-case">interface</th>
                <th className="px-4 py-2 font-mono font-semibold normal-case">type</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {[
                ["Object shapes", "✅", "✅"],
                ["Unions, tuples, primitive aliases", "❌", "✅"],
                ["Mapped / conditional / utility types", "❌", "✅"],
                ["Extending", "✅ extends: clear errors, faster to type-check", "✅ & (intersection): conflicts become never"],
                ["Declaration merging", "✅ (augment Window, libraries)", "❌ duplicate name is an error"],
                ["Assignable to Record<string, unknown>", "❌", "✅"],
                ["Implemented by a class", "✅", "✅ (if it's an object type)"],
              ].map(([feature, iface, alias]) => (
                <tr key={feature}>
                  <td className="px-4 py-2 font-medium">{feature}</td>
                  <td className="px-4 py-2">{iface}</td>
                  <td className="px-4 py-2">{alias}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p>So what can only a type alias do? Everything that isn&apos;t a plain object shape:</p>
        <CodeBlock code={onlyTypeCode} />
        <p>
          And where <code>interface</code> shines: extending other shapes, and being re-opened.
        </p>
        <CodeBlock code={extendsCode} />
        <CodeBlock code={mergingCode} />
        <CodeBlock code={enumCode} />
        <p>
          <strong>The convention in this project:</strong> <code>interface</code> for object shapes (
          <code>Product</code>, component props, API responses), <code>type</code> for everything else (unions like{" "}
          <code>CartAction</code>, literal unions like <code>category</code>, utility types). Which convention you pick
          matters less than picking one, so let a linter enforce it instead of discussing it in every code review:
        </p>
        <CodeBlock title="eslint.config.mjs" code={eslintCode} />
      </Section>

      <Callout type="ai" title="Reviewing AI-generated code">
        <ul>
          <li>
            <code>any</code>, <code>as any</code>, <code>{"// @ts-ignore"}</code>: each one is a hole in the safety net. Ask
            why it&apos;s needed.
          </li>
          <li>
            <code>value!</code> (non-null assertion) says &ldquo;trust me&rdquo;. Is the AI right to be so sure?
          </li>
          <li>
            Data from <code>fetch()</code> is <em>never</em> automatically typed. Whatever type you put on it is a
            promise you made, not a check.
          </li>
        </ul>
        <CodeBlock code={anyCode} />
      </Callout>

      <Callout type="exercise" title="Exercise">
        <p>
          Open <code>src/lib/products.ts</code>, rename <code>salePrice</code> to <code>discountPrice</code> and run{" "}
          <code>npx tsc --noEmit</code>. Count the errors: that&apos;s every place you would otherwise have to find by
          hand. Then use your editor&apos;s &ldquo;Rename symbol&rdquo; (F2) and see it fix them all at once.
        </p>
      </Callout>
    </>
  );
}
