import { CORS_HEADERS, corsPreflight, createRateLimiter, jsonError } from "@/lib/api";
import type { ChunkKind } from "@/lib/content";
import { search } from "@/lib/search";
import { resolveSiteOrigin } from "@/lib/site";

const KINDS: ChunkKind[] = ["skill", "doc", "decision", "starter"];
const limited = createRateLimiter({ limit: 120, name: "search", windowSeconds: 60 });

export const OPTIONS = corsPreflight;

export function GET(request: Request) {
  const over = limited(request);
  if (over) return over;
  const params = new URL(request.url).searchParams;
  const query = params.get("q")?.trim() ?? "";
  if (!query)
    return jsonError({
      code: "missing_query",
      message: "Query parameter `q` is required.",
      resolution: "Call /api/search?q=ship%20it (optional: limit=1-25, kind=skill|doc|decision|starter).",
      status: 400,
    });
  if (query.length > 200)
    return jsonError({ code: "query_too_long", message: "`q` must be 200 characters or fewer.", resolution: "Shorten the query.", status: 400 });

  const rawLimit = params.get("limit");
  const limit = rawLimit === null ? 10 : Number(rawLimit);
  if (!Number.isInteger(limit) || limit < 1 || limit > 25)
    return jsonError({ code: "invalid_limit", message: "`limit` must be an integer from 1 to 25.", resolution: "Omit limit or pass 1-25.", status: 400 });

  const kinds = params.getAll("kind").flatMap((k) => k.split(",")).map((k) => k.trim()).filter(Boolean);
  const unknown = kinds.filter((k) => !KINDS.includes(k as ChunkKind));
  if (unknown.length)
    return jsonError({
      code: "invalid_kind",
      message: `Unknown kind: ${unknown.join(", ")}.`,
      resolution: `Use one or more of ${KINDS.join(", ")}, repeated or comma-separated.`,
      status: 400,
    });

  const origin = resolveSiteOrigin(request);
  const results = search(query, { kinds: kinds.length ? (kinds as ChunkKind[]) : undefined, limit }).map((r) => ({
    excerpt: r.excerpt,
    heading: r.heading,
    kind: r.kind,
    path: r.url,
    score: r.score,
    title: r.title,
    url: `${origin}${r.url}`,
  }));
  return Response.json(
    { query, results, total: results.length },
    { headers: { ...CORS_HEADERS, ...limited.headers(request), "Cache-Control": "public, s-maxage=300" } },
  );
}
