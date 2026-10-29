import { ImageResponse } from "next/og";

import { SITE_DESCRIPTION } from "@/lib/site";

export const alt = "Flow — Make ideas flow.";
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
        <svg width="64" height="64" viewBox="0 0 32 32">
          <defs>
            <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#9ea6f8" />
              <stop offset="0.55" stopColor="#c6a8f6" />
              <stop offset="1" stopColor="#f0a6cf" />
            </linearGradient>
          </defs>
          <rect width="32" height="32" rx="8" fill="url(#g)" />
          <path d="M16 5.5 26.5 16 16 26.5 5.5 16Z" fill="#17121f" />
          <path d="M16 10.5 21.5 16 16 21.5 10.5 16Z" fill="#c9b8ff" />
          <path d="M16 13.6 18.4 16 16 18.4 13.6 16Z" fill="#17121f" />
        </svg>
        <div style={{ display: "flex", fontSize: 44, fontWeight: 700, letterSpacing: -1 }}>
          flow <span style={{ color: "#a78bfa", marginLeft: 12 }}>/</span>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
        <div
          style={{
            backgroundClip: "text",
            backgroundImage: "linear-gradient(90deg, #9ea6f8, #c6a8f6 55%, #f0a6cf)",
            color: "transparent",
            display: "flex",
            fontSize: 128,
            fontWeight: 800,
            letterSpacing: -5,
            lineHeight: 1,
          }}
        >
          Make ideas flow.
        </div>
        <div style={{ color: "#b5afc6", display: "flex", fontSize: 30, lineHeight: 1.4, maxWidth: 980 }}>{SITE_DESCRIPTION}</div>
      </div>
    </div>,
    size,
  );
}
