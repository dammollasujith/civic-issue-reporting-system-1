import Link from "next/link";
import type { ComponentProps } from "react";
import { clsx } from "clsx";

type Props = ComponentProps<"button"> & {
  href?: string;
  variant?: "primary" | "secondary" | "ghost";
};

const base =
  "inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-2 text-sm font-bold transition active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed";

const variants: Record<NonNullable<Props["variant"]>, string> = {
  primary: "bg-gradient-to-r from-brand-blue to-brand-teal text-white shadow-soft hover:opacity-95",
  secondary:
    "border border-slate-200 bg-white/80 text-slate-900 shadow-sm hover:bg-white dark:border-slate-700 dark:bg-slate-950/40 dark:text-slate-100 dark:hover:bg-slate-900/50",
  ghost: "text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-900/50"
};

export function Button({ href, variant = "primary", className, ...rest }: Props) {
  const cls = clsx(base, variants[variant], className);
  if (href) {
    return (
      <Link className={cls} href={href}>
        {rest.children}
      </Link>
    );
  }
  return <button className={cls} {...rest} />;
}

