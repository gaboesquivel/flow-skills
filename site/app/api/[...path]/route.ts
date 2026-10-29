import { jsonError } from "@/lib/api";
import { resolveSiteOrigin } from "@/lib/site";

export const dynamic = "force-dynamic";

const notFound = async (request: Request, context: { params: Promise<{ path: string[] }> }) => {
  const { path } = await context.params;
  const origin = resolveSiteOrigin(request);
  return jsonError({
    code: "not_found",
    message: `No API endpoint at /api/${path.join("/")}.`,
    resolution: `See ${origin}/api for endpoints or ${origin}/openapi.json for the full contract.`,
    status: 404,
  });
};

export const GET = notFound;
export const POST = notFound;
export const PUT = notFound;
export const PATCH = notFound;
export const DELETE = notFound;
