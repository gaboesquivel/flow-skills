import { generateText, streamText } from "ai";

import { createRateLimiter, jsonError } from "@/lib/api";
import {
  type AskMode,
  type AskResult,
  type AskSource,
  SYSTEM_PROMPT,
  askModel,
  buildPrompt,
  buildSources,
  extractiveAnswer,
  toCitations,
  validateAskBody,
} from "@/lib/ask";
import { resolveSiteOrigin } from "@/lib/site";

export const maxDuration = 30;

const limited = createRateLimiter({ limit: 10, name: "ask", windowSeconds: 60 });
const MAX_OUTPUT_TOKENS = 700;

const streamHeaders = (sources: AskSource[], mode: AskMode, model: string | null) => ({
  "Cache-Control": "no-store",
  "Content-Type": "text/plain; charset=utf-8",
  "X-Content-Type-Options": "nosniff",
  "X-Flow-Answer-Mode": mode,
  "X-Flow-Citations": encodeURIComponent(JSON.stringify(toCitations(sources))),
  "X-Flow-Model": model ?? "",
});

const interrupted = "\n\n_The answer was interrupted. Check the linked sources._";

export async function POST(request: Request) {
  const over = limited(request);
  if (over) return over;

  const text = await request.text();
  if (text.length > 4000)
    return jsonError({ code: "body_too_large", message: "Request body is too large.", resolution: "Send only {\"question\": string}.", status: 413 });
  let body: unknown;
  try {
    body = JSON.parse(text);
  } catch {
    return jsonError({
      code: "invalid_json",
      message: "Request body is not valid JSON.",
      resolution: 'Send {"question": "How do I ship a change?"} with Content-Type: application/json.',
      status: 400,
    });
  }
  const valid = validateAskBody(body);
  if (!valid.ok) return jsonError({ code: valid.code, message: valid.message, resolution: valid.resolution, status: 400 });

  const { question } = valid;
  const sources = buildSources(question, resolveSiteOrigin(request));
  const model = sources.length ? askModel() : null;
  const stream = new URL(request.url).searchParams.get("stream") === "1";
  const call = model
    ? {
        abortSignal: request.signal,
        maxOutputTokens: MAX_OUTPUT_TOKENS,
        maxRetries: 1,
        model,
        prompt: buildPrompt(question, sources),
        // Thinking tokens count against maxOutputTokens; with adaptive thinking on, a long think left no room for the answer (finishReason "length").
        reasoning: "none" as const,
        system: SYSTEM_PROMPT,
      }
    : null;

  if (!stream) {
    const result: AskResult = { answer: "", citations: toCitations(sources), mode: "extractive", model: null, question };
    if (call)
      try {
        const generated = await generateText(call);
        const answer = generated.text.trim();
        if (answer) Object.assign(result, { answer, mode: "generated", model });
        else console.warn("ask: model returned no text, using extractive answer", { finishReason: generated.finishReason, warnings: generated.warnings });
      } catch (error) {
        console.error("ask: generation failed, using extractive answer", error);
      }
    if (!result.answer) result.answer = extractiveAnswer(question, sources);
    return Response.json(result, { headers: { ...limited.headers(request), "Cache-Control": "no-store" } });
  }

  if (call) {
    try {
      const parts = streamText(call).stream[Symbol.asyncIterator]();
      // Wait for the first token so a failing model still falls back to extractive with the right headers.
      let first = "";
      let finishReason: string | undefined;
      while (!first) {
        const next = await parts.next();
        if (next.done) break;
        if (next.value.type === "error") throw next.value.error;
        if (next.value.type === "finish") finishReason = next.value.finishReason;
        if (next.value.type === "text-delta") first = next.value.text;
      }
      if (!first) console.warn("ask: model stream ended without text, using extractive answer", { finishReason });
      if (first) {
        const encoder = new TextEncoder();
        const body = new ReadableStream<Uint8Array>({
          async cancel() {
            await parts.return?.();
          },
          start(controller) {
            controller.enqueue(encoder.encode(first));
          },
          async pull(controller) {
            try {
              for (;;) {
                const next = await parts.next();
                if (next.done) return controller.close();
                if (next.value.type === "error") throw next.value.error;
                if (next.value.type === "text-delta" && next.value.text) return controller.enqueue(encoder.encode(next.value.text));
              }
            } catch (error) {
              console.error("ask: stream interrupted", error);
              controller.enqueue(encoder.encode(interrupted));
              controller.close();
            }
          },
        });
        return new Response(body, { headers: { ...streamHeaders(sources, "generated", model), ...limited.headers(request) } });
      }
    } catch (error) {
      if (request.signal.aborted) return new Response(null, { status: 499 });
      console.error("ask: generation failed, using extractive answer", error);
    }
  }
  return new Response(extractiveAnswer(question, sources), { headers: { ...streamHeaders(sources, "extractive", null), ...limited.headers(request) } });
}
