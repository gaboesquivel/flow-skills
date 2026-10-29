import type { Heading } from "@/lib/content";

/** "On this page" outline from depth-2 headings; extra-large screens only. */
export function Toc({ headings }: { headings: Heading[] }) {
  return (
    <aside className="hidden xl:block">
      <nav aria-labelledby="toc-heading" className="sticky top-28">
        <p id="toc-heading" className="label-mono">
          On this page
        </p>
        <ul className="mt-4 flex flex-col gap-2.5 border-l border-line text-sm">
          {headings.map((h) => (
            <li key={h.id}>
              <a href={`#${h.id}`} className="-ml-px block border-l border-transparent pl-4 leading-snug text-fg-muted hover:border-lavender hover:text-fg">
                {h.text}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
