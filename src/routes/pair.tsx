// The pairing engine now lives on the mint page. Anyone landing on /pair
// (old links, bookmarks) is sent straight there.
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/pair")({
  beforeLoad: () => {
    throw redirect({ to: "/mint", replace: true });
  },
});
