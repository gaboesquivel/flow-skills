import { cn } from "@/lib/cn";

/** Renders build-time HTML from repository Markdown; the content build drops raw HTML and unsafe link schemes. */
export function Prose({ html, className }: { html: string; className?: string }) {
  // biome-ignore lint: trusted, build-time generated HTML from repository sources
  return <div className={cn("prose-flow", className)} dangerouslySetInnerHTML={{ __html: html }} />;
}
