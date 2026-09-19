import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/coin-metadata/$id")({
  server: {
    handlers: {
      GET: async ({ params, request }) => {
        if (!/^[0-9a-f-]{36}$/i.test(params.id)) return new Response("Not found", { status: 404 });
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const launch = await supabaseAdmin
          .from("coin_launches")
          .select("name, ticker, description, image_url")
          .eq("id", params.id)
          .maybeSingle();
        if (launch.error || !launch.data) return new Response("Not found", { status: 404 });
        const origin = new URL(request.url).origin;
        const image = new URL(launch.data.image_url, origin).toString();
        return Response.json(
          {
            name: launch.data.name,
            symbol: launch.data.ticker,
            description: launch.data.description || `${launch.data.name} launched on Poke.`,
            image,
            showName: true,
            createdOn: "https://collectpoke.fun",
          },
          { headers: { "Cache-Control": "public, max-age=300" } },
        );
      },
    },
  },
});