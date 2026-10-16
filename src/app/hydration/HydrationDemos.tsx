"use client";

import { useState, useSyncExternalStore } from "react";
import dynamic from "next/dynamic";

// ---------------------------------------------------------------------------
// "Are we hydrated yet?" without a useEffect + setState dance.
// The server (and the first client render) get `false`, after hydration `true`.
// ---------------------------------------------------------------------------
const noopSubscribe = () => () => {};

export function useIsClient() {
  return useSyncExternalStore(
    noopSubscribe,
    () => true, // client snapshot
    () => false, // server snapshot (also used during hydration)
  );
}

export function HydrationStatus() {
  const isClient = useIsClient();
  const [clicks, setClicks] = useState(0);

  return (
    <div className="flex flex-wrap items-center gap-4">
      <span
        className={`rounded-full px-3 py-1 text-sm font-medium ${
          isClient ? "bg-emerald-500/15 text-emerald-600" : "bg-amber-500/15 text-amber-600"
        }`}
      >
        {isClient ? "✅ Hydrated: React is in control" : "⏳ Server HTML: not interactive yet"}
      </span>
      <button
        onClick={() => setClicks((c) => c + 1)}
        className="rounded-lg border border-border px-3 py-1.5 text-sm hover:bg-accent/10"
      >
        Clicked {clicks} times
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Fix 1: browser-only values → render a placeholder first, real value after hydration
// ---------------------------------------------------------------------------
function subscribeToClock(callback: () => void) {
  const id = setInterval(callback, 1000);
  return () => clearInterval(id);
}

export function LocalClock() {
  const seconds = useSyncExternalStore(
    subscribeToClock,
    () => Math.floor(Date.now() / 1000),
    () => null, // the server has no idea what time zone you're in
  );

  return (
    <p className="text-sm">
      Your local time:{" "}
      <strong className="font-mono">
        {seconds === null ? "--:--:--" : new Date(seconds * 1000).toLocaleTimeString()}
      </strong>
    </p>
  );
}

// ---------------------------------------------------------------------------
// Fix 2: suppressHydrationWarning, for a single text node you know will differ
// ---------------------------------------------------------------------------
export function RenderedAt() {
  return (
    <p className="text-sm">
      This line was rendered at{" "}
      <time suppressHydrationWarning className="font-mono font-semibold">
        {new Date().toISOString().slice(11, 23)}
      </time>{" "}
      <span className="text-muted">(server and browser disagree, React is told that&apos;s OK)</span>
    </p>
  );
}

// ---------------------------------------------------------------------------
// Fix 3: next/dynamic with ssr: false, for widgets that only make sense in a browser
// ---------------------------------------------------------------------------
function WindowSize() {
  return (
    <p className="text-sm">
      Your window is{" "}
      <strong className="font-mono">
        {window.innerWidth} × {window.innerHeight}
      </strong>{" "}
      <span className="text-muted">(reads `window` directly, so it can never run on the server)</span>
    </p>
  );
}

export const ClientOnlyWindowSize = dynamic(() => Promise.resolve(WindowSize), {
  ssr: false,
  loading: () => <p className="text-sm text-muted">Loading window size…</p>,
});
