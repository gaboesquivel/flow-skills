"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/cn";

export type NavGroup = { title: string; items: { href: string; label: string }[] };

const isCurrent = (href: string, pathname: string) =>
  href === "/docs/decisions" ? pathname === href || pathname.startsWith(`${href}/`) : pathname === href;

function NavList({ groups, pathname }: { groups: NavGroup[]; pathname: string }) {
  return (
    <div className="flex flex-col gap-7">
      {groups.map((group) => (
        <div key={group.title}>
          <p className="label-mono px-0 pb-3">{group.title}</p>
          <ul className="flex flex-col gap-1">
            {group.items.map((item) => {
              const current = isCurrent(item.href, pathname);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={current ? "page" : undefined}
                    className={cn(
                      "block rounded-lg px-4 py-2.5 text-[0.95rem] leading-snug transition-colors",
                      current ? "bg-panel-raised font-medium text-fg" : "text-fg-muted hover:bg-panel hover:text-fg",
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}

/** Docs sidebar on large screens; a compact disclosure above the content on smaller ones. */
export function DocsNav({ groups }: { groups: NavGroup[] }) {
  const pathname = usePathname();
  const current = groups.flatMap((g) => g.items).find((item) => isCurrent(item.href, pathname));
  return (
    <>
      <nav aria-label="Documentation" className="hidden lg:block">
        <NavList groups={groups} pathname={pathname} />
      </nav>
      <details key={pathname} className="group lg:hidden">
        <summary
          aria-label={`On this section: ${current?.label ?? "Field guide"}`}
          className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 rounded-lg border border-line-strong bg-panel px-4 [&::-webkit-details-marker]:hidden">
          <span className="flex min-w-0 flex-col py-2">
            <span className="label-mono">On this section</span>
            <span className="truncate text-sm font-medium text-fg">{current?.label ?? "Field guide"}</span>
          </span>
          <svg viewBox="0 0 16 16" className="size-4 shrink-0 text-fg-muted transition-transform group-open:rotate-180" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="m4 6 4 4 4-4" />
          </svg>
        </summary>
        <nav aria-label="Documentation" className="mt-2 rounded-lg border border-line bg-panel p-4">
          <NavList groups={groups} pathname={pathname} />
        </nav>
      </details>
    </>
  );
}
