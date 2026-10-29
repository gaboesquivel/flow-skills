import { type NextRequest, NextResponse } from "next/server";

/** Quality of a media type in an Accept header (exact type only), 0 when absent. */
const quality = (accept: string, type: string) => {
  for (const part of accept.toLowerCase().split(",")) {
    const [media, ...params] = part.split(";").map((p) => p.trim());
    if (media !== type) continue;
    const q = params.find((p) => p.startsWith("q="));
    return q ? Number.parseFloat(q.slice(2)) || 0 : 1;
  }
  return 0;
};

/** True when the client asks for Markdown and does not prefer HTML. */
export const prefersMarkdown = (accept: string | null) => {
  if (!accept) return false;
  const md = quality(accept, "text/markdown");
  return md > 0 && md >= quality(accept, "text/html");
};

/** `.md` suffix or `Accept: text/markdown` → the Markdown twin under /md; HTML pages vary on Accept. */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname.endsWith(".md")) {
    const page = pathname === "/index.md" ? "" : pathname.slice(0, -3);
    return NextResponse.rewrite(new URL(`/md${page}${request.nextUrl.search}`, request.url));
  }
  if (/\.[a-z0-9]+$/iu.test(pathname)) return NextResponse.next();
  if (prefersMarkdown(request.headers.get("accept"))) {
    return NextResponse.rewrite(new URL(`/md${pathname === "/" ? "" : pathname}${request.nextUrl.search}`, request.url));
  }
  const response = NextResponse.next();
  response.headers.set("Vary", "Accept");
  response.headers.set(
    "Link",
    `<${pathname === "/" ? "/index" : pathname}.md>; rel="alternate"; type="text/markdown", </llms.txt>; rel="describedby"; type="text/plain", </.well-known/mcp.json>; rel="mcp"`,
  );
  return response;
}

export const config = {
  matcher: ["/((?!_next/|api/|api$|mcp$|md/|md$|\\.well-known/|favicon\\.ico|icon\\.svg|opengraph-image).*)"],
};
