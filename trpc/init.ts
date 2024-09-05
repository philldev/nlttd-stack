import { initTRPC } from "@trpc/server";
import { cookies } from "next/headers";
import { cache } from "react";
import { auth } from "../lucia/auth";
import superjson from "superjson";

export const createTRPCContext = cache(async () => {
  const sessionId = cookies().get(auth.sessionCookieName)?.value ?? null;

  if (!sessionId) {
    return {
      session: null,
      user: null,
    };
  }

  const result = await auth.validateSession(sessionId);

  try {
    if (result.session && result.session.fresh) {
      const sessionCookie = auth.createSessionCookie(result.session.id);
      cookies().set(
        sessionCookie.name,
        sessionCookie.value,
        sessionCookie.attributes,
      );
    }
    if (!result.session) {
      const sessionCookie = auth.createBlankSessionCookie();
      cookies().set(
        sessionCookie.name,
        sessionCookie.value,
        sessionCookie.attributes,
      );
    }
  } catch {}
  return result;
});

const t = initTRPC.context<typeof createTRPCContext>().create({
  /**
   * @see https://trpc.io/docs/server/data-transformers
   */
  transformer: superjson,
});

// Base router and procedure helpers
export const router = t.router;
export const procedure = t.procedure;
export const createCallerFactory = t.createCallerFactory;
