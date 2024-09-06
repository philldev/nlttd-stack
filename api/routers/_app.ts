import { router } from "@/trpc/init";
import { authRouter } from "./auth";
import { todosRouter } from "./todos";
import type { inferReactQueryProcedureOptions } from "@trpc/react-query";
import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";

export const appRouter = router({
  auth: authRouter,
  todos: todosRouter,
});

export type ReactQueryOptions = inferReactQueryProcedureOptions<AppRouter>;
export type RouterInputs = inferRouterInputs<AppRouter>;
export type RouterOutputs = inferRouterOutputs<AppRouter>;

export type AppRouter = typeof appRouter;
