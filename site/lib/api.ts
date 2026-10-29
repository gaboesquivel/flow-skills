export const ERROR_TYPE = "https://is-agentic.com/docs#errors";

export const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Headers": "Content-Type, Accept",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Expose-Headers": "X-Flow-Citations, X-Flow-Answer-Mode, X-Flow-Model, Retry-After, RateLimit, RateLimit-Policy",
  "Access-Control-Max-Age": "86400",
};

/** Structured JSON error: `{ code, error, resolution, type }`. */
export const jsonError = ({
  code,
  message,
  resolution,
  status,
  retryAfterSeconds,
  headers: extra,
}: {
  code: string;
  message: string;
  resolution: string;
  status: number;
  retryAfterSeconds?: number;
  headers?: Record<string, string>;
}) => {
  const headers: Record<string, string> = { "Cache-Control": "no-store", ...CORS_HEADERS, ...extra };
  if (retryAfterSeconds !== undefined) headers["Retry-After"] = String(retryAfterSeconds);
  return Response.json({ code, error: message, resolution, type: ERROR_TYPE }, { headers, status });
};

/** Preflight response for public endpoints. */
export const corsPreflight = () => new Response(null, { headers: CORS_HEADERS, status: 204 });

const clientKey = (request: Request) =>
  request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "local";

/**
 * Fixed-window in-memory limiter, per client and bucket name. Best effort: state is per instance.
 * Returns a 429 Response when the client is over the limit, otherwise null.
 */
export const createRateLimiter = ({ name, limit, windowSeconds }: { name: string; limit: number; windowSeconds: number }) => {
  const buckets = new Map<string, { count: number; resetAt: number }>();
  /** RFC RateLimit headers for this client's current window, for successful responses. */
  const headers = (request: Request): Record<string, string> => {
    const now = Date.now();
    const bucket = buckets.get(clientKey(request));
    const remaining = bucket && now < bucket.resetAt ? Math.max(0, limit - bucket.count) : limit;
    const reset = bucket && now < bucket.resetAt ? Math.ceil((bucket.resetAt - now) / 1000) : windowSeconds;
    return { RateLimit: `limit=${limit}, remaining=${remaining}, reset=${reset}`, "RateLimit-Policy": `${limit};w=${windowSeconds}` };
  };
  const check = (request: Request) => {
    const now = Date.now();
    if (buckets.size > 5000) for (const [k, v] of buckets) if (v.resetAt <= now) buckets.delete(k);
    const key = clientKey(request);
    const current = buckets.get(key);
    if (!current || now >= current.resetAt) {
      buckets.set(key, { count: 1, resetAt: now + windowSeconds * 1000 });
      return null;
    }
    current.count += 1;
    if (current.count <= limit) return null;
    return jsonError({
      code: "rate_limited",
      message: `Too many ${name} requests from this client.`,
      resolution: `Wait ${Math.max(1, Math.ceil((current.resetAt - now) / 1000))} seconds and retry.`,
      retryAfterSeconds: Math.max(1, Math.ceil((current.resetAt - now) / 1000)),
      headers: headers(request),
      status: 429,
    });
  };
  return Object.assign(check, { headers });
};
