import { createFileRoute } from "@tanstack/react-router";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

async function handle(request: Request) {
  const secret = process.env["BUYBACK_CRON_SECRET"];
  if (!secret) return json({ error: "Buyback runner is not configured" }, 503);
  const provided =
    request.headers.get("x-buyback-secret") ??
    new URL(request.url).searchParams.get("key") ??
    "";
  if (provided !== secret) return new Response("Unauthorized", { status: 401 });

  const { runBuyback } = await import("@/lib/buyback.server");
  try {
    return json(await runBuyback());
  } catch (error) {
    console.error("buyback run failed", error);
    return json({ ok: false, error: error instanceof Error ? error.message : "Buyback failed" }, 500);
  }
}

export const Route = createFileRoute("/api/public/buyback-run")({
  server: { handlers: { POST: ({ request }) => handle(request), GET: ({ request }) => handle(request) } },
});
