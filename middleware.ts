import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

import { createHttpClient } from "./api/shared/http-client";
import { auth } from "./lucia/auth";

export const trpcClient = createHttpClient();

// 1. Specify protected and public routes
const protectedRoutes = ["/todos"];

export default async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const isProtectedRoute = protectedRoutes.includes(path);

  const sessionId = cookies().get("session")?.value ?? "";

  const session = await trpcClient.auth.validateSession.query({
    sessionId,
  });

  const validSession = session.session !== null;

  if (session.session && session.session.fresh) {
    const sessionCookie = await trpcClient.auth.refreshSession.mutate({
      sessionId: session.session.id,
    });

    cookies().set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes,
    );
  }

  if (!validSession) {
    const blankSessionCookie = await trpcClient.auth.blankSession.mutate();

    cookies().set(
      blankSessionCookie.name,
      blankSessionCookie.value,
      blankSessionCookie.attributes,
    );
  }

  if (isProtectedRoute && !validSession) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }

  return NextResponse.next();
}

// Routes Middleware should not run on
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};
