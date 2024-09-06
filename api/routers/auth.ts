import { hash, verify } from "@node-rs/argon2";
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { generateIdFromEntropySize } from "lucia";

import { publicProcedure } from "../procedures/public";
import { LoginInputSchema, SignupInputSchema } from "../shared/schemas/auth";

import { router } from "@/trpc/init";
import { db } from "@/drizzle/db";
import { users } from "@/drizzle/schema";
import { auth } from "@/lucia/auth";
import { protectedProcedure } from "../procedures/protected";
import { z } from "zod";

export const authRouter = router({
  validateSession: publicProcedure
    .input(z.object({ sessionId: z.string() }))
    .query(async ({ input }) => {
      const result = await auth.validateSession(input.sessionId);
      return result;
    }),

  refreshSession: publicProcedure
    .input(z.object({ sessionId: z.string() }))
    .mutation(async ({ input }) => {
      const result = auth.createSessionCookie(input.sessionId);
      return result;
    }),

  blankSession: publicProcedure.mutation(async () => {
    return auth.createBlankSessionCookie();
  }),

  currentUser: protectedProcedure.query(async ({ ctx }) => {
    const [user] = await db
      .select({
        id: users.id,
        username: users.username,
      })
      .from(users)
      .where(eq(users.id, ctx.user.id))
      .limit(1);

    if (!user) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Invalid session",
      });
    }

    return user;
  }),

  login: publicProcedure.input(LoginInputSchema).mutation(async ({ input }) => {
    const { username, password } = input;

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1);

    if (!user) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Invalid username or password",
      });
    }

    const valid = await verify(user.passwordHash, password);

    if (!valid) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Invalid username or password",
      });
    }

    const session = await auth.createSession(user.id, {});
    const sessionCookie = auth.createSessionCookie(session.id);

    cookies().set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes,
    );

    return true;
  }),

  signup: publicProcedure
    .input(SignupInputSchema)
    .mutation(async ({ input }) => {
      const { username, password } = input;

      if (
        (
          await db
            .select()
            .from(users)
            .where(eq(users.username, username))
            .limit(1)
        ).length > 0
      ) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Username already exists",
        });
      }

      const userId = generateIdFromEntropySize(10); // 16 characters long
      const passwordHash = await hash(password, {
        // recommended minimum parameters
        memoryCost: 19456,
        timeCost: 2,
        outputLen: 32,
        parallelism: 1,
      });

      await db.insert(users).values({
        id: userId,
        username,
        passwordHash,
      });

      const session = await auth.createSession(userId, {});

      const sessionCookie = auth.createSessionCookie(session.id);

      cookies().set(
        sessionCookie.name,
        sessionCookie.value,
        sessionCookie.attributes,
      );

      return true;
    }),

  signout: protectedProcedure.mutation(async ({ ctx }) => {
    const sessionId = ctx.session.id;

    await auth.invalidateSession(sessionId);

    const blankCookie = auth.createBlankSessionCookie();

    cookies().set(blankCookie.name, blankCookie.value, blankCookie.attributes);

    return true;
  }),
});
