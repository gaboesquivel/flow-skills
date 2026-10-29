import { afterEach, describe, expect, it, vi } from "vitest";

import { POST } from "@/app/api/ask/route";
import { askModel, buildSources, DEFAULT_ASK_MODEL, extractiveAnswer, retrievalQuery, validateAskBody } from "@/lib/ask";
import { chunks } from "@/lib/content";

const ORIGIN = "https://flow.test";
const sitePaths = new Set(chunks.map((c) => c.url));

const post = (body: string, qs = "", ip = "203.0.113.1") =>
  POST(
    new Request(`http://localhost:3100/api/ask${qs}`, {
      body,
      headers: { "content-type": "application/json", host: "localhost:3100", "x-forwarded-for": ip },
      method: "POST",
    }),
  );

afterEach(() => vi.unstubAllEnvs());

describe("validateAskBody", () => {
  it("accepts and normalizes a question", () => {
    expect(validateAskBody({ question: "  How do I   ship it? " })).toEqual({ ok: true, question: "How do I ship it?" });
  });
  it.each([
    [null, "invalid_question"],
    [{}, "invalid_question"],
    [{ question: 3 }, "invalid_question"],
    [{ question: "   " }, "empty_question"],
    [{ question: "x".repeat(501) }, "question_too_long"],
  ])("rejects %j", (body, code) => {
    expect(validateAskBody(body)).toMatchObject({ code, ok: false });
  });
});

describe("generation config", () => {
  it("is off without gateway credentials and on with a key or OIDC", () => {
    expect(askModel({})).toBeNull();
    expect(askModel({ AI_GATEWAY_API_KEY: "k" })).toBe(DEFAULT_ASK_MODEL);
    expect(askModel({ ASK_MODEL: "anthropic/claude-sonnet-5.5", VERCEL_OIDC_TOKEN: "t" })).toBe("anthropic/claude-sonnet-5.5");
  });
});

describe("retrieval and extractive answers", () => {
  it("drops filler words and adds stems", () => {
    const q = retrievalQuery("How does Flow keep PRODUCT.md aligned?");
    expect(q).toContain("PRODUCT.md");
    expect(q).toContain("align");
    expect(q).not.toMatch(/\bhow\b/iu);
  });

  it("builds numbered citations with valid site paths and absolute urls", () => {
    const sources = buildSources("How does Flow keep PRODUCT.md aligned?", ORIGIN);
    expect(sources.length).toBeGreaterThan(2);
    expect(sources.length).toBeLessThanOrEqual(8);
    sources.forEach((s, i) => {
      expect(s.n).toBe(i + 1);
      expect(sitePaths.has(s.path)).toBe(true);
      expect(s.url).toBe(`${ORIGIN}${s.path}`);
    });
    expect(sources.some((s) => s.path.startsWith("/skills/flow") || s.path.includes("align"))).toBe(true);
  });

  it("cites only sources that exist", () => {
    const sources = buildSources("ship it", ORIGIN);
    const answer = extractiveAnswer("ship it", sources);
    const cited = [...answer.matchAll(/\[(\d+)\]/gu)].map((m) => Number(m[1]));
    expect(cited.length).toBeGreaterThan(0);
    expect(cited.every((n) => sources.some((s) => s.n === n))).toBe(true);
  });

  it("says plainly when nothing matches", () => {
    expect(extractiveAnswer("zzzz", [])).toMatch(/don't cover/u);
  });
});

describe("POST /api/ask", () => {
  it("falls back to an extractive JSON answer without a model", async () => {
    vi.stubEnv("AI_GATEWAY_API_KEY", "");
    vi.stubEnv("VERCEL_OIDC_TOKEN", "");
    const res = await post(JSON.stringify({ question: "How do I fix a small bug with Flow?" }), "", "203.0.113.10");
    expect(res.status).toBe(200);
    const body = (await res.json()) as { mode: string; model: null; answer: string; citations: { n: number; url: string; path: string }[] };
    expect(body).toMatchObject({ mode: "extractive", model: null, question: "How do I fix a small bug with Flow?" });
    expect(body.answer).toMatch(/\[1\]/u);
    expect(body.citations[0]).toMatchObject({ n: 1 });
    expect(body.citations.every((c) => c.url === `http://localhost:3100${c.path}` && sitePaths.has(c.path))).toBe(true);
  });

  it("streams text with citation and mode headers", async () => {
    vi.stubEnv("AI_GATEWAY_API_KEY", "");
    vi.stubEnv("VERCEL_OIDC_TOKEN", "");
    const res = await post(JSON.stringify({ question: "ship it" }), "?stream=1", "203.0.113.11");
    expect(res.headers.get("content-type")).toBe("text/plain; charset=utf-8");
    expect(res.headers.get("x-flow-answer-mode")).toBe("extractive");
    const citations = JSON.parse(decodeURIComponent(res.headers.get("x-flow-citations") ?? "")) as { n: number }[];
    expect(citations.length).toBeGreaterThan(0);
    expect(await res.text()).toMatch(/\[\d\]/u);
  });

  it("returns structured 400s", async () => {
    const bad = await post("{nope", "", "203.0.113.12");
    expect(bad.status).toBe(400);
    expect(await bad.json()).toMatchObject({ code: "invalid_json", type: "https://is-agentic.com/docs#errors" });
    const empty = await post(JSON.stringify({ question: "" }), "", "203.0.113.12");
    expect(await empty.json()).toMatchObject({ code: "empty_question" });
  });

  it("rate limits with Retry-After", async () => {
    let last: Response | undefined;
    for (let i = 0; i < 11; i++) last = await post(JSON.stringify({ question: "" }), "", "203.0.113.99");
    expect(last?.status).toBe(429);
    expect(Number(last?.headers.get("retry-after"))).toBeGreaterThan(0);
    expect(await last?.json()).toMatchObject({ code: "rate_limited" });
  });
});
