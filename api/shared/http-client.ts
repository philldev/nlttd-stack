import { createTRPCClient, httpBatchLink } from "@trpc/client";

import { getUrl } from "./url";
import superjson from "superjson";

import { type AppRouter } from "../routers/_app";

export const createHttpClient = () =>
  createTRPCClient<AppRouter>({
    links: [
      httpBatchLink({
        transformer: superjson,
        url: getUrl(),
      }),
    ],
  });
