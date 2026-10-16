"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { topics } from "@/lib/topics";
import { CartBadge } from "./CartBadge";

export function Nav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-background/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3">
        <Link href="/" className="shrink-0 font-semibold tracking-tight">
          ⚛️ React 101
        </Link>
        <nav className="flex flex-1 gap-1 overflow-x-auto text-sm">
          {topics.map((topic) => {
            const active = pathname.startsWith(topic.href);
            return (
              <Link
                key={topic.href}
                href={topic.href}
                className={`whitespace-nowrap rounded-md px-3 py-1.5 transition-colors ${
                  active ? "bg-accent text-white" : "text-muted hover:bg-accent/10 hover:text-foreground"
                }`}
              >
                {topic.title}
              </Link>
            );
          })}
        </nav>
        <CartBadge />
      </div>
    </header>
  );
}
