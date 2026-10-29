import { markdownForPath, notFoundMarkdown } from "@/lib/markdown-pages";
import { resolveSiteOrigin } from "@/lib/site";

export const dynamic = "force-dynamic";

const markdown = (body: string, status: number, canonical?: string) =>
  new Response(body, {
    headers: {
      "Cache-Control": status === 200 ? "public, max-age=300, s-maxage=3600" : "no-store",
      "Content-Type": "text/markdown; charset=utf-8",
      Vary: "Accept",
      ...(canonical ? { Link: `<${canonical}>; rel="canonical"` } : {}),
    },
    status,
  });

export const GET = async (request: Request, context: { params: Promise<{ path?: string[] }> }) => {
  const { path = [] } = await context.params;
  const pathname = `/${path.join("/")}`;
  const origin = resolveSiteOrigin(request);
  const body = markdownForPath(pathname, origin, new URL(request.url).searchParams);
  return body ? markdown(body, 200, `${origin}${pathname}`) : markdown(notFoundMarkdown(pathname, origin), 404);
};
