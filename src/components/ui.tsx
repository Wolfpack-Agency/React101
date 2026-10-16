import type { ButtonHTMLAttributes, ReactNode } from "react";
import { highlight } from "sugar-high";

// Small presentational building blocks used by every tutorial page.
// They are Server Components: no state, no effects, no "use client".

export function PageHeader({ eyebrow, title, children }: { eyebrow: string; title: string; children: ReactNode }) {
  return (
    <header className="mb-10 max-w-3xl">
      <p className="text-sm font-semibold uppercase tracking-wider text-accent">{eyebrow}</p>
      <h1 className="mt-2 text-4xl font-bold tracking-tight">{title}</h1>
      <div className="prose-tut mt-4 text-lg text-muted">{children}</div>
    </header>
  );
}

export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mb-12">
      <h2 className="mb-3 text-2xl font-semibold tracking-tight">{title}</h2>
      <div className="prose-tut max-w-3xl">{children}</div>
    </section>
  );
}

export function CodeBlock({ code, title }: { code: string; title?: string }) {
  return (
    <figure className="my-4 overflow-hidden rounded-xl border border-slate-800 bg-slate-950 text-sm">
      {title && (
        <figcaption className="border-b border-slate-800 px-4 py-2 font-mono text-xs text-slate-400">{title}</figcaption>
      )}
      <pre className="overflow-x-auto p-4 font-mono leading-relaxed">
        <code dangerouslySetInnerHTML={{ __html: highlight(code.trim()) }} />
      </pre>
    </figure>
  );
}

const calloutStyles = {
  tip: { icon: "💡", className: "border-emerald-500/40 bg-emerald-500/10" },
  warning: { icon: "⚠️", className: "border-amber-500/40 bg-amber-500/10" },
  ai: { icon: "🤖", className: "border-violet-500/40 bg-violet-500/10" },
  exercise: { icon: "🏋️", className: "border-sky-500/40 bg-sky-500/10" },
} as const;

export function Callout({
  type,
  title,
  children,
}: {
  type: keyof typeof calloutStyles;
  title: string;
  children: ReactNode;
}) {
  const style = calloutStyles[type];
  return (
    <aside className={`my-5 max-w-3xl rounded-xl border p-4 ${style.className}`}>
      <p className="font-semibold">
        {style.icon} {title}
      </p>
      <div className="prose-tut text-[0.95rem]">{children}</div>
    </aside>
  );
}

export function Demo({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="my-6 rounded-2xl border-2 border-dashed border-accent/40 bg-card p-5">
      <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-accent">▶ Live demo · {title}</p>
      {children}
    </div>
  );
}

export function Button({
  children,
  variant = "primary",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" }) {
  const base = "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50";
  const variants = {
    primary: "bg-accent text-white hover:opacity-90",
    secondary: "border border-border hover:bg-accent/10",
  };
  return (
    <button className={`${base} ${variants[variant]}`} {...props}>
      {children}
    </button>
  );
}
