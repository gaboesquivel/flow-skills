import { THROUGHLINE_PATHS } from "@/components/logo";
import { cn } from "@/lib/cn";

// Approved hero: Intent → Build → Ship → Measure orbiting the Throughline mark.
// Static derivatives: public/brand/flow-hero-orbit.svg (and .webp); keep them in step with this file.
const STATIONS = [
  { title: "Intent", note: "Find the right problem", cx: 240, cy: 45, ty: 88, ring: "#b49be6" },
  { title: "Build", note: "Create and iterate", cx: 399, cy: 200, ty: 240, ring: "#9ea6f8" },
  { title: "Ship", note: "Deliver to real users", cx: 240, cy: 341, ty: 384, ring: "#e4a6db" },
  { title: "Measure", note: "Learn and adapt", cx: 81, cy: 200, ty: 240, ring: "#b49bea" },
] as const;

const halo = { paintOrder: "stroke fill", stroke: "#0e0c15", strokeWidth: 5, strokeLinejoin: "round" } as const;

/** Hero diagram: four connected product-engineering concerns, a cycle rather than mandatory gates. */
export function HeroOrbit({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 480 420" className={cn("h-auto w-full font-sans", className)} role="img" aria-labelledby="orbit-title orbit-desc">
      <title id="orbit-title">Flow: Intent, Build, Ship, Measure</title>
      <desc id="orbit-desc">
        Four connected product-engineering concerns orbit the Throughline mark. Intent finds the right problem; Build creates and iterates; Ship delivers to real users; Measure learns and adapts.
      </desc>
      <defs>
        <linearGradient id="orbit-mark" x1="15" x2="377" y1="0" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#9ea6f8" />
          <stop offset=".55" stopColor="#c6a8f6" />
          <stop offset="1" stopColor="#f0a6cf" />
        </linearGradient>
        <linearGradient id="orbit-ring" x1="83" y1="72" x2="392" y2="347" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#c6a8f6" />
          <stop offset=".55" stopColor="#927ed7" />
          <stop offset="1" stopColor="#f0a6cf" />
        </linearGradient>
        <radialGradient id="orbit-glow">
          <stop offset="0" stopColor="#a78bfa" stopOpacity=".16" />
          <stop offset=".75" stopColor="#a78bfa" stopOpacity=".045" />
          <stop offset="1" stopColor="#a78bfa" stopOpacity="0" />
        </radialGradient>
        <filter id="orbit-soft" x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="3.8" />
        </filter>
      </defs>

      <circle cx="240" cy="200" r="143" fill="url(#orbit-glow)" />
      <circle cx="240" cy="200" r="145" fill="none" stroke="#49405f" opacity=".75" />
      <circle cx="240" cy="200" r="104" fill="none" stroke="#4d4463" strokeDasharray="1.5 6" strokeLinecap="round" opacity=".83" />
      <circle cx="240" cy="200" r="70" fill="none" stroke="#403750" opacity=".5" />

      <g stroke="#675781" strokeWidth=".9" opacity=".65">
        <path d="M240 92 V148" />
        <path d="M291 200 H360" />
        <path d="M240 251 V312" />
        <path d="M120 200 H189" />
      </g>

      {/* Cycle arcs imply feedback instead of mandatory gates. */}
      <g stroke="url(#orbit-ring)" strokeWidth="1.6" strokeLinecap="round" fill="none">
        <path d="M104 153 A145 145 0 0 1 202 60" />
        <path d="M274 59 A145 145 0 0 1 379 161" opacity=".6" />
        <path d="M380 241 A145 145 0 0 1 271 341" opacity=".8" />
        <path d="M207 341 A145 145 0 0 1 101 243" opacity=".65" />
      </g>
      <g fill="none" stroke="#c2aff2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M197 58 L207 57 L203 66" />
        <path d="M378 155 L383 164 L374 165" opacity=".6" />
        <path d="M275 336 L267 343 L276 347" opacity=".8" />
        <path d="M103 249 L98 239 L107 238" opacity=".65" />
      </g>
      <circle cx="240" cy="55" r="4" fill="#bdadff" />
      <circle cx="385" cy="200" r="3.8" fill="#9ea6f8" />
      <circle cx="240" cy="345" r="4" fill="#e8a5de" />
      <circle cx="95" cy="200" r="3.8" fill="#ba9cea" />

      {/* Throughline at the centre: canonical outlines, unchanged. */}
      <circle cx="240" cy="200" r="57" fill="#0e0c15" />
      <circle cx="240" cy="200" r="57" fill="none" stroke="#b7a1f3" strokeOpacity=".3" strokeWidth="10" filter="url(#orbit-soft)" />
      <circle cx="240" cy="200" r="57" fill="none" stroke="url(#orbit-ring)" strokeWidth="2.1" />
      <g transform="translate(204.5 173) scale(.19) translate(4 10) scale(.99)" fill="url(#orbit-mark)">
        {THROUGHLINE_PATHS.map((d) => (
          <path key={d} d={d} />
        ))}
      </g>

      <g fontWeight="600" textAnchor="middle" strokeLinecap="round" strokeLinejoin="round">
        {STATIONS.map((s) => (
          <circle key={s.title} cx={s.cx} cy={s.cy} r="22" fill="#181324" stroke={s.ring} strokeWidth="1.25" />
        ))}
        {/* Station icons: compass, code, rocket, bars. */}
        <circle cx="240" cy="45" r="13" fill="none" stroke="#d1b9ff" strokeWidth="1.2" />
        <path d="M247 38 L243 48 L233 52 L237 42 Z" stroke="#d1b9ff" strokeWidth="1.35" fill="none" />
        <path d="M392 194 L386 200 L392 206 M406 194 L412 200 L406 206 M402 192 L397 208" fill="none" stroke="#c5b9ff" strokeWidth="1.9" />
        <path
          d="M233 347 Q231 338 248 330 Q251 343 240 349 Z M233 344 L227 344 L229 350 L234 348 M240 349 L240 355 L246 348 M230 350 Q225 351 227 357 L232 353 M243 337 L243.5 337"
          stroke="#edb3e4"
          strokeWidth="1.6"
          fill="none"
        />
        <path d="M70 209 V203 H75 V209 M79 209 V195 H84 V209 M88 209 V200 H93 V209" stroke="#cfbaff" strokeWidth="1.4" fill="none" />
        {STATIONS.map((s) => (
          <g key={`t${s.title}`} {...halo}>
            <text x={s.cx} y={s.ty} fontSize="17" fill="#f5f3fb">
              {s.title}
            </text>
            <text x={s.cx} y={s.ty + (s.title === "Ship" ? 19 : 18)} fontSize="11.5" fontWeight="400" fill="#b5afc6">
              {s.note}
            </text>
          </g>
        ))}
      </g>
    </svg>
  );
}
