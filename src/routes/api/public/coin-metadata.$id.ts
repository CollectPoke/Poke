import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/coin-metadata/$id")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        if (!/^[0-9a-f-]{36}$/i.test(params.id)) return new Response("Not found", { status: 404 });
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const launch = await supabaseAdmin
          .from("coin_launches")
          .select("name, ticker, description, image_url")
          .eq("id", params.id)
          .maybeSingle();
        if (launch.error || !launch.data) return new Response("Not found", { status: 404 });
        // Always publish the live public URL — Pump.fun fetches this from
        // the open internet, so a preview/localhost origin breaks the image.
        const image = new URL(launch.data.image_url, "https://mintjpeg.com").toString();
        return Response.json(
          {
            name: launch.data.name,
            symbol: launch.data.ticker,
            description: launch.data.description || `${launch.data.name} launched on JPEG.`,
            image,
            showName: true,
            createdOn: "https://mintjpeg.com",
          },
          { headers: { "Cache-Control": "public, max-age=300" } },
        );
      },
    },
  },
});
