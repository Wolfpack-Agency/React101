"use client";

import { useEffect, useRef } from "react";

// Demo helper: counts how often a component actually re-renders and
// flashes it yellow each time. It writes to the DOM directly so that
// showing the count doesn't itself cause extra renders.
export function useRenderFlash<T extends HTMLElement>() {
  const elementRef = useRef<T>(null);
  const counterRef = useRef<HTMLSpanElement>(null);
  const count = useRef(0);
  const lastRender = useRef<object | null>(null);

  // A fresh object per render lets us ignore Strict Mode's extra
  // effect run on mount (same render → same object).
  const thisRender = {};

  useEffect(() => {
    if (lastRender.current === thisRender) return;
    lastRender.current = thisRender;
    count.current += 1;
    if (counterRef.current) counterRef.current.textContent = String(count.current);
    if (count.current > 1) {
      elementRef.current?.animate([{ backgroundColor: "rgb(250 204 21 / 0.6)" }, { backgroundColor: "transparent" }], {
        duration: 700,
      });
    }
  });

  return { elementRef, counterRef };
}
