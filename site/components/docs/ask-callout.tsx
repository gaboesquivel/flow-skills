import { ButtonLink } from "@/components/ui";
import { cn } from "@/lib/cn";

/** Hands a question about the current document to Ask Flow. */
export function AskCallout({ title, label, className }: { title: string; label: "guide" | "decision"; className?: string }) {
  const question = label === "decision" ? `What did the decision "${title}" decide, and why?` : `What are the key points of the "${title}" guide?`;
  return (
    <aside aria-labelledby="ask-callout-heading" className={cn("card-prism flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8", className)}>
      <div>
        <h2 id="ask-callout-heading" className="text-xl font-bold tracking-[-0.04em] text-fg">
          Ask a question about this {label}
        </h2>
        <p className="mt-2 text-sm text-fg-muted">Answers cite the canonical documentation and accepted decisions.</p>
      </div>
      <ButtonLink href={`/search?mode=ask&q=${encodeURIComponent(question)}`} variant="secondary" className="shrink-0">
        Ask Flow
      </ButtonLink>
    </aside>
  );
}
