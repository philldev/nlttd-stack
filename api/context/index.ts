import { auth } from "@/lucia/auth";
import { cookies } from "next/headers";
import { cache } from "react";

export const createContext = cache(async () => {
  const sessionId = cookies().get(auth.sessionCookieName)?.value ?? null;

  return {
    sessionId,
  };
});

export type Context = Awaited<ReturnType<typeof createContext>>;
