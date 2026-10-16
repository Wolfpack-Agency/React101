import { CodeBlock, Callout, Demo, PageHeader, Section } from "@/components/ui";
import { ProductTile } from "@/components/ProductTile";
import { AddToCartButton } from "@/components/AddToCartButton";
import { products } from "@/lib/products";
import { CartSummary, ImmutabilityDemo, LocalStateDemo } from "./StateDemos";

export const metadata = { title: "State & Context · React 101" };

const useStateCode = `
function QuantityStepper() {
  const [quantity, setQuantity] = useState(1);
  //     ↑ current value  ↑ the ONLY way to change it

  return <button onClick={() => setQuantity((q) => q + 1)}>{quantity}</button>;
}
`;

const drillingCode = `
// The cart lives in <App>, but the badge and the buttons are deep down…
<App cart={cart} setCart={setCart}>
  <Layout cart={cart} setCart={setCart}>          // doesn't use it, just passes it
    <Header cart={cart}>                         // doesn't use it, just passes it
      <CartBadge cart={cart} />                  // finally!
    <ProductGrid setCart={setCart}>              // doesn't use it, just passes it
      <ProductTile setCart={setCart}>            // doesn't use it, just passes it
        <AddToCartButton setCart={setCart} />    // finally!
`;

const contextCode = `
// 1. Create the context + a Provider that owns the state
const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [] });
  const value = {
    items: state.items,
    addToCart: (product: Product) => dispatch({ type: "add", product }),
    // ...
  };
  return <CartContext value={value}>{children}</CartContext>;
}

// 2. A custom hook to read it
export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
`;

const consumeCode = `
// 3. Wrap the app once (src/app/providers.tsx)
<CartProvider>{children}</CartProvider>

// 4. Use it anywhere below, no props needed
function CartBadge() {
  const { totalItems } = useCart();
  return <span>🛒 {totalItems}</span>;
}

function AddToCartButton({ product }: { product: Product }) {
  const { addToCart } = useCart();
  return <button onClick={() => addToCart(product)}>Add to cart</button>;
}
`;

const reducerCode = `
// All the ways the cart can change, in one pure, testable function
function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "add":    return { items: [...state.items, { product: action.product, quantity: 1 }] };
    case "remove": return { items: state.items.filter((i) => i.product.id !== action.productId) };
    case "clear":  return { items: [] };
  }
}
`;

export default function StatePage() {
  return (
    <>
      <PageHeader eyebrow="03 · State management" title="Where does this value live?">
        <p>
          State is data that changes over time and should update the UI when it does. The real skill isn&apos;t
          calling <code>useState</code>; it&apos;s deciding <strong>where</strong> each piece of state should live.
        </p>
      </PageHeader>

      <Section title="Local state: useState">
        <p>
          When you call the setter, React re-runs your component with the new value and updates the DOM. You never
          touch the DOM yourself. Each component instance has its <strong>own</strong> state:
        </p>
        <CodeBlock code={useStateCode} />
      </Section>

      <Demo title="two instances, two independent states">
        <LocalStateDemo />
      </Demo>

      <Section title="Rule #1: never mutate state, replace it">
        <p>
          React decides whether to re-render by comparing the <em>reference</em> of old and new state (
          <code>Object.is</code>). If you change an array in place, it&apos;s still the same array, so React skips the
          update. This is the #1 &ldquo;why doesn&apos;t my UI update?&rdquo; bug.
        </p>
      </Section>

      <Demo title="mutate vs. replace">
        <ImmutabilityDemo />
      </Demo>

      <Section title="The problem: sharing state across the app">
        <p>
          The cart badge in the header and the &ldquo;Add to cart&rdquo; button in a tile both need the cart. With only{" "}
          <code>useState</code>, the state has to live in their closest common parent and be passed down through every
          layer in between. That&apos;s called <strong>prop drilling</strong>:
        </p>
        <CodeBlock code={drillingCode} />
      </Section>

      <Section title="The solution: Context API">
        <p>
          Context lets a parent make a value available to <em>every</em> component below it, without passing props
          through the middle. Combine it with <code>useReducer</code> and you have a tiny, typed store.
        </p>
        <CodeBlock title="src/context/CartContext.tsx (simplified)" code={contextCode} />
        <CodeBlock code={consumeCode} />
        <CodeBlock title="the reducer" code={reducerCode} />
      </Section>

      <Demo title="the buttons and the 🛒 badge share one cart">
        <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {products.slice(0, 6).map((product) => (
              <ProductTile key={product.id} product={product}>
                <AddToCartButton product={product} />
              </ProductTile>
            ))}
          </div>
          <div className="rounded-xl border border-border p-4 lg:sticky lg:top-20 lg:self-start">
            <h3 className="mb-2 font-semibold">&lt;CartSummary /&gt;</h3>
            <CartSummary />
          </div>
        </div>
        <p className="mt-4 text-sm text-muted">
          Three unrelated components (button, summary, header badge) stay in sync. Now navigate to another page and
          back: the cart survives, because the Provider sits in the root layout, which doesn&apos;t unmount.
        </p>
      </Demo>

      <Section title="Choosing the right home for state">
        <ul>
          <li>
            <strong>Used by one component?</strong> <code>useState</code> in that component.
          </li>
          <li>
            <strong>Used by a parent and a few children?</strong> Lift it to the parent and pass props. Prop drilling of
            1–2 levels is fine!
          </li>
          <li>
            <strong>Used all over the app, changes rarely?</strong> (cart, user, theme, locale) → Context.
          </li>
          <li>
            <strong>Should survive a refresh or be shareable?</strong> (filters, search, active tab) → the URL (
            <code>searchParams</code>).
          </li>
          <li>
            <strong>Comes from the server?</strong> That&apos;s not app state, it&apos;s a cache → TanStack Query (page
            06).
          </li>
        </ul>
      </Section>

      <Callout type="warning" title="Context's trade-off">
        <p>
          Every component that calls <code>useCart()</code> re-renders whenever the context value changes. For a cart
          that&apos;s perfectly fine. For values that change many times per second (mouse position, a text input) or
          huge apps with lots of consumers, split the context up or reach for a small store library like{" "}
          <strong>Zustand</strong>, which lets components subscribe to just the slice they need.
        </p>
      </Callout>

      <Callout type="ai" title="Reviewing AI-generated code">
        <ul>
          <li>
            <code>.push()</code>, <code>.sort()</code>, <code>.splice()</code> or <code>obj.x = …</code> on state? Bug.
          </li>
          <li>
            A <code>useEffect</code> that only copies one state into another (&ldquo;sync state&rdquo;)? Usually you can
            just calculate it during render.
          </li>
          <li>Redux/Zustand added for a single boolean? Over-engineered. A global Context for a modal? Same.</li>
        </ul>
      </Callout>

      <Callout type="exercise" title="Exercise">
        <p>
          Add a &ldquo;decrease quantity&rdquo; action to the cart: add it to the <code>CartAction</code> union first
          and let TypeScript guide you through the reducer (it will tell you the <code>switch</code> is incomplete),
          then expose it via <code>useCart()</code>.
        </p>
      </Callout>
    </>
  );
}
