import { queryOptions } from "@tanstack/react-query";
import { getMarkets } from "./coins.functions";

export const marketsQueryOptions = queryOptions({
  queryKey: ["markets"],
  queryFn: () => getMarkets(),
  staleTime: 60_000,
  refetchInterval: 60_000,
});
