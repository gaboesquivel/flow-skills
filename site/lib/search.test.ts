import { describe, expect, it } from "vitest";

import { GET, OPTIONS } from "@/app/api/search/route";
import { search } from "@/lib/search";

const get = (qs: string) => GET(new Request(`http://localhost:3100/api/search${qs}`, { headers: { host: "localhost:3100" } }));

describe("search ranking", () => {
  it("ranks the ship skill first for 'ship it'", () => {
    const [top] = search("ship it");
    expect(top?.kind).toBe("skill");
    expect(top?.url.startsWith("/skills/ship")).toBe(true);
  });

  it("finds flow, align, or product context for 'PRODUCT.md aligned'", () => {
    const urls = search("PRODUCT.md aligned", { limit: 5 }).map((r) => r.url);
    expect(urls.some((u) => /\/skills\/(flow|align)|align|product/u.test(u))).toBe(true);
    expect(urls.some((u) => u.startsWith("/skills/flow") || u.includes("align"))).toBe(true);
  });

  it("filters by kind and dedupes pages", () => {
    const results = search("spec", { kinds: ["decision"], limit: 10 });
    expect(results.length).toBeGreaterThan(0);
    expect(results.every((r) => r.kind === "decision")).toBe(true);
    const pages = results.map((r) => r.url.split("#")[0]);
    expect(new Set(pages).size).toBe(pages.length);
  });
});

describe("GET /api/search", () => {
  it("returns absolute urls and relative paths with CORS and caching", async () => {
    const res = await get("?q=ship%20it&limit=3");
    expect(res.status).toBe(200);
    expect(res.headers.get("access-control-allow-origin")).toBe("*");
    expect(res.headers.get("cache-control")).toBe("public, s-maxage=300");
    const body = (await res.json()) as { query: string; total: number; results: { url: string; path: string; kind: string }[] };
    expect(body.query).toBe("ship it");
    expect(body.total).toBe(body.results.length);
    expect(body.results.length).toBeLessThanOrEqual(3);
    expect(body.results[0]?.url).toBe(`http://localhost:3100${body.results[0]?.path}`);
    expect(body.results[0]?.path.startsWith("/")).toBe(true);
  });

  it("accepts repeated and comma-separated kinds", async () => {
    const body = (await (await get("?q=start&kind=skill,starter&kind=doc")).json()) as { results: { kind: string }[] };
    expect(body.results.every((r) => ["skill", "starter", "doc"].includes(r.kind))).toBe(true);
  });

  it.each([
    ["", "missing_query"],
    ["?q=%20", "missing_query"],
    ["?q=ship&limit=0", "invalid_limit"],
    ["?q=ship&limit=26", "invalid_limit"],
    ["?q=ship&kind=page", "invalid_kind"],
  ])("rejects %s with a structured 400", async (qs, code) => {
    const res = await get(qs);
    expect(res.status).toBe(400);
    expect(await res.json()).toMatchObject({ code, type: "https://is-agentic.com/docs#errors" });
  });

  it("answers preflight", () => {
    const res = OPTIONS();
    expect(res.status).toBe(204);
    expect(res.headers.get("access-control-allow-methods")).toContain("GET");
  });
});
