import { handleMcpRequest } from "@/lib/mcp/handle-mcp-request";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const POST = handleMcpRequest;
export const GET = handleMcpRequest;
export const DELETE = handleMcpRequest;
export const OPTIONS = () =>
  new Response(null, {
    headers: {
      "Access-Control-Allow-Headers": "Content-Type, Accept, Mcp-Session-Id, Mcp-Protocol-Version",
      "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
      "Access-Control-Allow-Origin": "*",
      Allow: "GET, POST, DELETE, OPTIONS",
    },
    status: 204,
  });
