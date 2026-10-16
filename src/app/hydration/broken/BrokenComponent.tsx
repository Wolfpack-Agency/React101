"use client";

// ❌ DON'T DO THIS. This component is broken on purpose.
// On the server `window` doesn't exist, in the browser it does,
// so the two renders produce different HTML.
export function BrokenComponent() {
  const where = typeof window === "undefined" ? "on the server" : "in your browser";

  return (
    <p className="text-lg">
      This text was rendered <strong>{where}</strong>.
    </p>
  );
}
