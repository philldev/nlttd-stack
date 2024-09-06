import { auth } from "@/lucia/auth";
import { procedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";

export const protectedProcedure = procedure.use(async ({ ctx, next }) => {
  const result = await auth.validateSession(ctx.sessionId ?? "");

  try {
    if (!result.session) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "You must be logged in to access this route",
      });
    }

    return next({
      ctx: {
        session: result.session,
        user: result.user,
      },
    });
  } catch (error) {
    if (error instanceof TRPCError) {
      throw error;
    }

    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Something went wrong",
    });
  }
});
