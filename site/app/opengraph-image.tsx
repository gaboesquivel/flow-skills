import { ImageResponse } from "next/og";

import { THROUGHLINE_PATHS } from "@/components/logo";
import { SITE_DESCRIPTION } from "@/lib/site";

export const alt = "Flow — Agent skills for product engineers.";
export const size = { height: 630, width: 1200 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    <div
      style={{
        background: "radial-gradient(circle at 85% 10%, rgba(167,139,250,0.35), transparent 45%), radial-gradient(circle at 10% 100%, rgba(240,166,207,0.22), transparent 50%), #0e0c15",
        color: "#f5f3fb",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        justifyContent: "space-between",
        padding: "72px 80px",
        width: "100%",
      }}
    >
      <div style={{ alignItems: "center", display: "flex", gap: 20 }}>
        <svg width="82" height="64" viewBox="0 0 395 295">
          <defs>
            <linearGradient id="throughline-gradient" x1="15" y1="0" x2="377" y2="0" gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor="#9ea6f8" />
              <stop offset="0.55" stopColor="#c6a8f6" />
              <stop offset="1" stopColor="#f0a6cf" />
            </linearGradient>
          </defs>
          <g transform="translate(4 10) scale(.99)" fill="url(#throughline-gradient)">
            {THROUGHLINE_PATHS.map((d) => (
              <path key={d} d={d} />
            ))}
          </g>
        </svg>
        <div style={{ display: "flex", fontSize: 44, fontWeight: 700, letterSpacing: -1 }}>flow</div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
        <div style={{ display: "flex", flexDirection: "column", fontSize: 104, fontWeight: 800, letterSpacing: -4, lineHeight: 1 }}>
          <div style={{ color: "#f5f3fb", display: "flex" }}>Agent skills for</div>
          <div
            style={{
              backgroundClip: "text",
              backgroundImage: "linear-gradient(90deg, #9ea6f8, #c6a8f6 55%, #f0a6cf)",
              color: "transparent",
              display: "flex",
            }}
          >
            product engineers.
          </div>
        </div>
        <div style={{ color: "#b5afc6", display: "flex", fontSize: 30, lineHeight: 1.4, maxWidth: 980 }}>
          {SITE_DESCRIPTION}
        </div>
      </div>
    </div>,
    size,
  );
}
