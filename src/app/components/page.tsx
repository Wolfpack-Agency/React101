import { CodeBlock, Callout, Demo, PageHeader, Section } from "@/components/ui";
import { SourceCode } from "@/components/SourceCode";
import { ProductTile } from "@/components/ProductTile";
import { AddToCartButton } from "@/components/AddToCartButton";
import { products, type Product } from "@/lib/products";

export const metadata = { title: "Components · React 101" };

const copyPasteCode = `
// ❌ The "it works" version: markup copy-pasted per product
<div className="grid">
  <div className="tile">
    <img src="/products/headphones.png" />
    <h3>Noise-cancelling headphones</h3>
    <span className="sale">€ 249</span> <s>€ 299</s>
  </div>
  <div className="tile">
    <img src="/products/smartwatch.png" />
    <h3>Smartwatch</h3>
    <span>€ 199</span>
  </div>
  {/* ...and 40 more, on 3 different pages */}
</div>
`;

const usageCode = `
// ✅ The page only says WHAT to show, not HOW a tile looks
<div className="grid">
  {products.map((product) => (
    <ProductTile key={product.id} product={product}>
      <AddToCartButton product={product} />
    </ProductTile>
  ))}
</div>
`;

const lazyCode = `
// 🤖 Typical first draft. It renders. It's still not good enough.
export function ProductTile({ product }: { product: any }) {
  const onSale = product.salePrice !== undefined;
  return (
    <div className="tile">
      <div className="img">{product.image}</div>
      <h3>{product.name}</h3>
      {onSale ? <SalePrice product={product} /> : <Price amount={product.price} />}
    </div>
  );
}
`;

const imageCode = `
// ❌ What is product.image? A URL? An emoji? HTML? Nobody knows.
image: string;

// ✅ A real image needs a source AND a description. Required, so nobody forgets.
export interface ProductImage {
  src: string;
  alt: string;
}
`;

const priceApiCode = `
// ❌ Two components for one concept, with two different APIs:
<SalePrice product={product} />   // needs a whole Product
<Price amount={product.price} />  // needs a number

// ✅ One component that owns the concept. Callers pass plain data:
<Price price={product.price} salePrice={product.salePrice} />
<Price price={cart.total} />      // works for anything with a price
`;

const xssCode = `
// React escapes everything you render with { }. This is just text:
<h3>{product.name}</h3>

// These are where the real risks are. Treat each one as a code review red flag:
<div dangerouslySetInnerHTML={{ __html: product.description }} /> // raw HTML: sanitize first!
<a href={userInput}>Website</a>                                     // only allow http(s) URLs
`;

const serverClientCode = `
// ProductTile.tsx  → no "use client": rendered on the server, zero JS shipped
export function ProductTile({ product, children }: ProductTileProps) { ... }

// AddToCartButton.tsx → needs onClick + state, so:
"use client";
export function AddToCartButton({ product }: { product: Product }) {
  const { addToCart } = useCart();
  return <button onClick={() => addToCart(product)}>Add to cart</button>;
}
`;

// Pretend this came from a CMS where someone pasted something nasty.
const untrustedProduct: Product = {
  id: 999,
  name: `<img src=x onerror="alert('hacked')"> Totally normal speaker`,
  price: 59,
  image: { src: "/products/speaker.png", alt: "Silver speaker cone with sound waves" },
  category: "audio",
  inStock: true,
};

export default function ComponentsPage() {
  return (
    <>
      <PageHeader eyebrow="01 · React Components" title="Why a product tile is a <ProductTile />">
        <p>
          A component is a function that takes data (<code>props</code>) and returns UI. That sounds trivial, but it is
          the single most important idea in React: <strong>UI = f(data)</strong>.
        </p>
      </PageHeader>

      <Section title="The copy-paste version">
        <p>
          Without components, every product tile is a block of hand-written markup. It works on day one. On day thirty
          the designer moves the sale badge, and you get to find and fix every copy. You will miss one.
        </p>
        <CodeBlock title="ProductGrid.tsx (before)" code={copyPasteCode} />
      </Section>

      <Section title="The component version">
        <p>
          Extract the markup once, give it a clear input (the <code>product</code>), and let the data drive the output.
          This is the real file that renders the demo below, read from disk, so it can&apos;t be out of date:
        </p>
        <SourceCode file="src/components/ProductTile.tsx" />
        <CodeBlock title="usage" code={usageCode} />
      </Section>

      <Demo title="the same component, eight different products">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => (
            <ProductTile key={product.id} product={product}>
              <AddToCartButton product={product} />
            </ProductTile>
          ))}
        </div>
        <p className="mt-4 text-sm text-muted">
          Sale badge, strike-through price, out-of-stock state: all handled in one place. Click &ldquo;Add to cart&rdquo;
          and watch the 🛒 in the header (that&apos;s the State page). Open the Network tab and filter on
          &ldquo;Img&rdquo;: each tile loads a 384px WebP of a few KB, not the 800px, ~200&nbsp;KB PNG in{" "}
          <code>/public</code> (on a retina screen it picks a bigger one).
        </p>
      </Demo>

      <Section title="Working vs. good: what a first draft gets wrong">
        <p>
          Here&apos;s the kind of component AI (or a rushed developer) produces first. It renders fine, so it&apos;s easy
          to accept. Let&apos;s review it.
        </p>
        <CodeBlock code={lazyCode} />

        <h3 className="mt-6 text-lg font-semibold">1. An image is not a string</h3>
        <p>
          <code>{"{product.image}"}</code> inside a <code>&lt;div&gt;</code> tells you nothing. Is it a URL, an emoji,
          HTML? Describe it with a type, and render it with Next.js&apos; <code>&lt;Image /&gt;</code>, which gives you
          for free:
        </p>
        <ul>
          <li>
            <strong>Right-sized files:</strong> a <code>srcset</code> in several widths, picked by the browser using{" "}
            <code>sizes</code>.
          </li>
          <li>
            <strong>Modern formats:</strong> WebP/AVIF, generated on the fly.
          </li>
          <li>
            <strong>Lazy loading</strong> by default. Above the fold, opt out with <code>loading=&quot;eager&quot;</code>{" "}
            (or <code>preload</code> for a single hero image that is always the largest thing on screen).
          </li>
          <li>
            <strong>No layout shift:</strong> it reserves the space (<code>width</code>/<code>height</code> or{" "}
            <code>fill</code> in a sized parent) before the image loads.
          </li>
          <li>
            <strong>Accessibility:</strong> <code>alt</code> is required. Use <code>alt=&quot;&quot;</code> only when
            the image is decorative, like the thumbnails in the cart, where the name is right next to it.
          </li>
        </ul>
        <CodeBlock title="src/lib/products.ts" code={imageCode} />

        <h3 className="mt-6 text-lg font-semibold">2. One concept, one component, one API</h3>
        <p>
          <code>&lt;SalePrice product /&gt;</code> and <code>&lt;Price amount /&gt;</code> are two components for the
          same idea with two different props, and the tile has to know the rule for choosing between them. Now that rule
          lives in the tile, and probably also in the cart, the checkout and the email template. Move the decision{" "}
          <em>into</em> the component, and keep its props as plain data so it&apos;s reusable anywhere:
        </p>
        <CodeBlock code={priceApiCode} />
        <SourceCode file="src/components/Price.tsx" />
        <p>
          The rule itself (&ldquo;on sale = has a sale price that&apos;s lower&rdquo;) lives in{" "}
          <code>isOnSale()</code> in <code>src/lib/products.ts</code>. The tile&apos;s badge, the{" "}
          <code>&lt;Price /&gt;</code> and the cart total all use it, so they can never disagree. And notice: no{" "}
          <code>product.salePrice!</code> anywhere.
        </p>

        <h3 className="mt-6 text-lg font-semibold">3. any</h3>
        <p>
          <code>product: any</code> means none of the above is checked. See the TypeScript page.
        </p>
      </Section>

      <Section title="Is {product.name} safe if it contains a <script>?">
        <p>
          Yes. Everything you render with <code>{"{ }"}</code> is <strong>escaped</strong> by React: it&apos;s inserted
          as text, never parsed as HTML. So rendering untrusted data is safe by default. Here&apos;s a product whose name
          came from a compromised CMS:
        </p>
      </Section>

      <Demo title="an XSS attempt, rendered as plain text">
        <div className="max-w-56">
          <ProductTile product={untrustedProduct} />
        </div>
      </Demo>

      <Section title="So where are the risks?">
        <p>
          In the escape hatches. React makes them deliberately ugly so they stand out in a code review:
        </p>
        <CodeBlock code={xssCode} />
        <p>
          (This app uses <code>dangerouslySetInnerHTML</code> exactly once: in <code>CodeBlock</code>, for our own
          source code after the syntax highlighter has escaped it. Never for user or CMS content.)
        </p>
      </Section>

      <Section title="What you get from a good component">
        <ul>
          <li>
            <strong>One source of truth.</strong> Change the tile once, it changes everywhere: homepage, search results,
            wishlist.
          </li>
          <li>
            <strong>A clear contract.</strong> The props interface documents exactly what a tile needs. No guessing.
          </li>
          <li>
            <strong>Testable & reviewable.</strong> You can render <code>&lt;ProductTile product=&#123;fake&#125; /&gt;</code> in a
            test or Storybook without the rest of the page.
          </li>
          <li>
            <strong>Composition.</strong> The <code>children</code> slot lets a page decide which actions a tile gets (add
            to cart, remove from wishlist, nothing at all) without the tile knowing about any of them.
          </li>
          <li>
            <strong>Performance knobs.</strong> Only components can be memoized, lazy-loaded or kept on the server.
          </li>
        </ul>
      </Section>

      <Section title="Bonus: Server vs. Client Components (Next.js)">
        <p>
          In the Next.js App Router, components are <strong>Server Components by default</strong>. They render to HTML on
          the server and ship no JavaScript. Only add <code>&quot;use client&quot;</code> to the parts that need
          interactivity (state, effects, event handlers, browser APIs). That&apos;s why the button is split off from the
          tile:
        </p>
        <CodeBlock code={serverClientCode} />
      </Section>

      <Callout type="ai" title="Reviewing AI-generated code">
        <ul>
          <li>Is one component doing five things? Ask the AI (or yourself) to split it by responsibility.</li>
          <li>
            Two components (or two props) for one concept? Similar components with different APIs? Push the decision
            into one component.
          </li>
          <li>
            A plain <code>&lt;img&gt;</code>, or an image without a meaningful <code>alt</code>? Use{" "}
            <code>&lt;Image /&gt;</code> with <code>sizes</code>. And <code>priority</code> is deprecated since Next.js
            16 (it&apos;s <code>preload</code> now), but models trained on older docs still suggest it.
          </li>
          <li>
            <code>dangerouslySetInnerHTML</code> with data from an API or CMS? Ask where it&apos;s sanitized.
          </li>
          <li>
            Is <code>&quot;use client&quot;</code> at the top of a page file? Usually only a small leaf component needs
            it.
          </li>
          <li>
            Missing or index-based <code>key</code> in a <code>.map()</code>? Use a stable id, like{" "}
            <code>product.id</code>.
          </li>
        </ul>
      </Callout>

      <Callout type="exercise" title="Exercise">
        <p>
          Add a &ldquo;New&rdquo; badge for products with <code>isNew: true</code>. Notice how you only touch{" "}
          <code>Product</code> (the interface), the data, and <code>ProductTile</code>. Zero changes to any page. Bonus: on a
          page where the grid is at the top, the first row should load eagerly. Add an optional prop so the{" "}
          <em>page</em> can say <code>loading=&quot;eager&quot;</code> for the first four tiles, without the tile having
          to know where on the page it is.
        </p>
      </Callout>
    </>
  );
}
