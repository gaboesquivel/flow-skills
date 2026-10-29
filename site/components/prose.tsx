import { cn } from "@/lib/cn";

/** Renders build-time HTML produced from this repository's own Markdown (trusted source). */
export function Prose({ html, className }: { html: string; className?: string }) {
  // biome-ignore lint: trusted, build-time generated HTML from repository sources
  return <div className={cn("prose-flow", className)} dangerouslySetInnerHTML={{ __html: html }} />;
}
