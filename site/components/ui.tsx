import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

import { cn } from "@/lib/cn";

export function Container({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("mx-auto w-full max-w-page px-5 sm:px-8", className)} {...props} />;
}

export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn("eyebrow", className)}>{children}</p>;
}

/** Two-line Prism headline: plain lead, accent line. Only h1 accents carry the gradient (DESIGN.md). */
export function Headline({
  lead,
  accent,
  as: Tag = "h1",
  size = "xl",
  className,
}: {
  lead?: ReactNode;
  accent?: ReactNode;
  as?: "h1" | "h2" | "h3";
  size?: "xl" | "lg" | "md";
  className?: string;
}) {
  const sizes = {
    lg: "text-[clamp(2.4rem,5.2vw,3.6rem)]",
    md: "text-[clamp(1.8rem,3.4vw,2.4rem)]",
    xl: "text-[clamp(3rem,8vw,5.4rem)]",
  };
  return (
    <Tag className={cn("headline text-fg", sizes[size], className)}>
      {lead}
      {lead && accent ? <br /> : null}
      {accent ? <span className={Tag === "h1" ? "text-prism" : undefined}>{accent}</span> : null}
    </Tag>
  );
}

export function Lede({ className, ...props }: ComponentProps<"p">) {
  return <p className={cn("max-w-[46rem] text-lg leading-relaxed text-fg-muted sm:text-xl", className)} {...props} />;
}

type ButtonVariant = "primary" | "secondary" | "ghost";

const buttonClass = (variant: ButtonVariant, className?: string) =>
  cn(
    "inline-flex min-h-11 items-center justify-center gap-1.5 rounded-lg px-5 text-sm font-semibold transition-colors",
    variant === "primary" && "bg-lavender-soft text-ink hover:bg-lavender",
    variant === "secondary" && "border border-line-strong bg-panel-raised text-fg hover:border-lavender/50 hover:bg-panel-hover",
    variant === "ghost" && "px-0 text-lavender hover:text-lavender-soft",
    className,
  );

export function ArrowUpRight({ className = "size-3.5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" className={className} aria-hidden="true" focusable="false" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 11 11 5M6 5h5v5" />
    </svg>
  );
}

/** Internal or external link styled as a button. External links open in place with rel=noopener. */
export function ButtonLink({
  href,
  children,
  variant = "primary",
  arrow = true,
  className,
  ...rest
}: { href: string; children: ReactNode; variant?: ButtonVariant; arrow?: boolean; className?: string } & Omit<ComponentProps<"a">, "href" | "className" | "children">) {
  const external = /^https?:/u.test(href);
  const inner = (
    <>
      {children}
      {arrow ? <ArrowUpRight /> : null}
    </>
  );
  return external ? (
    <a href={href} rel="noopener" className={buttonClass(variant, className)} {...rest}>
      {inner}
    </a>
  ) : (
    <Link href={href} className={buttonClass(variant, className)} {...rest}>
      {inner}
    </Link>
  );
}

export function TextLink({ href, children, className }: { href: string; children: ReactNode; className?: string }) {
  const cls = cn("inline-flex items-center gap-1 text-sm font-semibold text-lavender hover:text-lavender-soft", className);
  return /^https?:/u.test(href) ? (
    <a href={href} rel="noopener" className={cls}>
      {children}
      <ArrowUpRight className="size-3" />
    </a>
  ) : (
    <Link href={href} className={cls}>
      {children}
      <ArrowUpRight className="size-3" />
    </Link>
  );
}

export function Breadcrumbs({ items }: { items: { href?: string; label: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="label-mono">
      <ol className="flex flex-wrap items-center gap-x-4 gap-y-1">
        {items.map((item, i) => (
          <li key={item.label} className="flex items-center gap-4">
            {i > 0 ? <span aria-hidden="true">/</span> : null}
            {item.href ? (
              <Link href={item.href} className="hover:text-fg">
                {item.label}
              </Link>
            ) : (
              <span aria-current="page" className="normal-case tracking-normal text-fg-muted">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function Section({ className, ...props }: ComponentProps<"section">) {
  return <section className={cn("py-16 sm:py-24", className)} {...props} />;
}
