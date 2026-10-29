import { useId } from "react";

// Flow Throughline: three independent paths converging on one outcome.
// Source of truth: /DESIGN.md and public/brand/throughline-mark.svg.
export const THROUGHLINE_PATHS = [
  "M38 30 H125 C169 30 190 73 222 92 C239 103 258 108 285 108 H319 L333 145 H278 C227 145 201 122 177 101 C161 87 146 79 122 79 H38 C23 79 15 69 15 55 C15 40 23 30 38 30 Z",
  "M37 116 H120 C157 116 170 135 192 147 C173 157 157 178 120 178 H37 C22 178 15 167 15 154 V140 C15 126 23 116 37 116 Z",
  "M38 218 H122 C147 218 161 211 179 194 C205 169 233 147 280 147 H333 L318 185 H285 C257 185 240 192 221 204 C187 227 171 266 122 266 H38 C23 266 15 257 15 243 C15 227 23 218 38 218 Z",
  "M275 108 H319 C331 108 340 115 349 126 L373 145 C380 151 380 156 373 163 L351 179 C341 186 331 187 319 187 H275 C309 173 312 123 275 108 Z",
] as const;

export function LogoMark({ className = "size-8" }: { className?: string }) {
  const gradientId = useId();
  return (
    <svg viewBox="0 0 395 295" className={className} aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={gradientId} x1="15" y1="0" x2="377" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#9ea6f8" />
          <stop offset="0.55" stopColor="#c6a8f6" />
          <stop offset="1" stopColor="#f0a6cf" />
        </linearGradient>
      </defs>
      <g transform="translate(4 10) scale(.99)" fill={`url(#${gradientId})`}>
        {THROUGHLINE_PATHS.map((d) => <path key={d} d={d} />)}
      </g>
    </svg>
  );
}

// The public-facing company/product name is Flow. The wordmark appears lowercase
// in the Prism UI; Skills, Starters and Factory are ecosystem descriptors.
export function Wordmark({ compact = false }: { compact?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <LogoMark className={compact ? "h-5 w-7" : "h-8 w-11"} />
      <span className="headline text-[1.45rem] leading-none text-fg">flow</span>
    </span>
  );
}
