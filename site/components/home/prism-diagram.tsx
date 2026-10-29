import { cn } from "@/lib/cn";

const C = 240;
const CY = 200;
const R = 170;

// Spokes every 45°, starting at the top; diagonals carry the labels.
const NODES = Array.from({ length: 8 }, (_, i) => {
  const a = (i * Math.PI) / 4 - Math.PI / 2;
  return { x: C + R * Math.cos(a), y: CY + R * Math.sin(a), diagonal: i % 2 === 1 };
});

const LABELS = [
  { text: "CONTEXT", x: 404, y: 62, anchor: "end" },
  { text: "PROOF", x: 404, y: 350, anchor: "end" },
  { text: "AGENTS", x: 76, y: 350, anchor: "start" },
  { text: "INTENT", x: 76, y: 62, anchor: "start" },
] as const;

const spin = "origin-center [transform-box:fill-box] motion-reduce:animate-none";

/** Decorative Prism diagram: many capabilities around one product intention. */
export function PrismDiagram({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 480 420" className={cn("h-auto w-full", className)} aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="prism-outer" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#9ea6f8" />
          <stop offset="55%" stopColor="#c6a8f6" />
          <stop offset="100%" stopColor="#f0a6cf" />
        </linearGradient>
        <linearGradient id="prism-inner" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#7c6fe0" />
          <stop offset="60%" stopColor="#b98af0" />
          <stop offset="100%" stopColor="#f0a6cf" />
        </linearGradient>
        <radialGradient id="prism-core">
          <stop offset="0%" stopColor="#fbe7ff" />
          <stop offset="70%" stopColor="#d7a6f4" />
          <stop offset="100%" stopColor="#a78bfa" />
        </radialGradient>
        <radialGradient id="prism-glow">
          <stop offset="0%" stopColor="#a78bfa" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#a78bfa" stopOpacity="0" />
        </radialGradient>
      </defs>

      <circle cx={C} cy={CY} r="150" fill="url(#prism-glow)" />
      <circle cx={C} cy={CY} r={R} fill="none" stroke="#3a3350" strokeWidth="1" />
      <circle cx={C} cy={CY} r="90" fill="none" stroke="#3a3350" strokeWidth="1" />
      <circle
        cx={C}
        cy={CY}
        r="130"
        fill="none"
        stroke="#5b4f7c"
        strokeWidth="1.2"
        strokeDasharray="1 7"
        strokeLinecap="round"
        className={cn(spin, "animate-[spin_90s_linear_infinite]")}
      />

      {NODES.map((n, i) => (
        <line
          key={`l${i}`}
          x1={C}
          y1={CY}
          x2={n.x}
          y2={n.y}
          stroke={n.diagonal ? "#8b7bd8" : "#6f6496"}
          strokeWidth="1"
          strokeDasharray={i === 2 || i === 6 ? "3 5" : undefined}
          opacity={n.diagonal ? 0.75 : 0.6}
        />
      ))}

      <g>
        <rect x={C - 65} y={CY - 65} width="130" height="130" transform={`rotate(45 ${C} ${CY})`} fill="#1a1530" stroke="url(#prism-outer)" strokeWidth="2.5" />
        <rect x={C - 40} y={CY - 40} width="80" height="80" transform={`rotate(45 ${C} ${CY})`} fill="url(#prism-inner)" />
        <rect x={C - 22} y={CY - 22} width="44" height="44" transform={`rotate(45 ${C} ${CY})`} fill="#2a2040" opacity="0.85" />
        <circle cx={C} cy={CY} r="13" fill="url(#prism-core)" className={cn(spin, "animate-[pulse_4s_ease-in-out_infinite]")} />
      </g>

      {NODES.map((n, i) => (
        <circle key={`n${i}`} cx={n.x} cy={n.y} r={n.diagonal ? 5 : 4.5} fill="#d7c4ff" />
      ))}

      <g fill="#a49cba" fontFamily="var(--font-mono)" fontSize="10.5" letterSpacing="1.2">
        {LABELS.map((l) => (
          <text key={l.text} x={l.x} y={l.y} textAnchor={l.anchor}>
            {l.text}
          </text>
        ))}
        <text x={C} y="404" textAnchor="middle" fontSize="10" letterSpacing="1.6">
          MANY CAPABILITIES · ONE PRODUCT INTENTION
        </text>
      </g>
    </svg>
  );
}
