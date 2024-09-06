import "server-only"; // <-- ensure this file cannot be imported from the client

import { createHydrationHelpers } from "@trpc/react-query/rsc";
import { cache } from "react";
import { makeQueryClient } from "./shared/query-client";
import { createCallerFactory } from "@/trpc/init";
import { appRouter } from "./routers/_app";
import { createContext } from "./context";

const caller = createCallerFactory(appRouter)(cache(createContext));

export const getQueryClient = cache(makeQueryClient);

export const { trpc: api, HydrateClient } = createHydrationHelpers<
  typeof appRouter
>(caller, getQueryClient);
