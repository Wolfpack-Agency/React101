"use client";

import { useState } from "react";
import { formatPrice } from "@/lib/products";

const SHIPPING = 4.95;

// Plain JavaScript thinking: "price is a number, surely".
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function orderTotal(item: any) {
  return item.price + SHIPPING;
}

export function PriceBugDemo() {
  const [apiV2, setApiV2] = useState(false);

  // In v2 the backend team "harmlessly" started sending prices as strings.
  const apiResponse = apiV2 ? { name: "Smartwatch", price: "199" } : { name: "Smartwatch", price: 199 };
  const total = orderTotal(apiResponse);

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div>
        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <input type="checkbox" checked={apiV2} onChange={(e) => setApiV2(e.target.checked)} />
          Backend deploys API v2 (price is now a <code className="font-mono">string</code>)
        </label>
        <pre className="mt-3 rounded-lg bg-slate-950 p-3 font-mono text-xs text-slate-200">
          {JSON.stringify(apiResponse, null, 2)}
        </pre>
      </div>

      <div className="space-y-3">
        <div className="rounded-lg border border-border p-3">
          <p className="text-xs font-semibold uppercase text-muted">Without types, in production</p>
          <p className="mt-1 text-sm">
            Smartwatch + shipping ={" "}
            <strong className={apiV2 ? "text-rose-500" : ""}>{formatPrice(Number(total))}</strong>
          </p>
          {apiV2 && (
            <p className="mt-1 text-xs text-rose-500">
              <code>&quot;199&quot; + 4.95</code> is <code>&quot;1994.95&quot;</code>. No error, just a very expensive
              watch. 💸
            </p>
          )}
        </div>
        <div className="rounded-lg border border-border p-3">
          <p className="text-xs font-semibold uppercase text-muted">With types, in your editor</p>
          {apiV2 ? (
            <p className="mt-1 font-mono text-xs text-rose-500">
              Type &apos;string&apos; is not assignable to type &apos;number&apos;. ts(2322)
              <br />
              <span className="text-muted">The build fails. The bug never ships.</span>
            </p>
          ) : (
            <p className="mt-1 text-sm text-emerald-600">✓ Type-checks fine</p>
          )}
        </div>
      </div>
    </div>
  );
}
