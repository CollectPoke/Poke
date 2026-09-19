import { createFileRoute } from "@tanstack/react-router";

// Serves card artwork stored in the database at a permanent public URL:
// /api/public/artwork/<id>
export const Route = createFileRoute("/api/public/artwork/$id")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const id = params.id;
        if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
          return new Response("Not found", { status: 404 });
        }

        const { supabaseAdmin } = await import(
          "@/integrations/supabase/client.server"
        );
        const { data, error } = await supabaseAdmin
          .from("artwork")
          .select("mime, data")
          .eq("id", id)
          .maybeSingle();

        if (error || !data) {
          return new Response("Not found", { status: 404 });
        }

        const hex = String(data.data ?? "");
        const bytes = Buffer.from(
          hex.startsWith("\\x") ? hex.slice(2) : hex,
          "hex",
        );
        if (bytes.length === 0) {
          return new Response("Not found", { status: 404 });
        }

        return new Response(new Uint8Array(bytes), {
          headers: {
            "Content-Type": data.mime || "image/png",
            "Cache-Control": "public, max-age=31536000, immutable",
          },
        });
      },
    },
  },
});
