import { router } from "@/trpc/init";
import { protectedProcedure } from "../procedures/protected";
import { db } from "@/drizzle/db";
import { todos } from "@/drizzle/schema";
import { and, desc, eq, gte, like, lte } from "drizzle-orm";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import {
  CreateTodoInput,
  DeleteTodoInputSchema,
  GetTodoInputSchema,
  GetTodosInputSchema,
  UpdateTodoInputSchema,
} from "../shared/schemas/todos";
import {
  endOfMonth,
  endOfWeek,
  formatDistanceToNow,
  startOfMonth,
  startOfWeek,
} from "date-fns";

const ITEMS_PER_PAGE = 10;

export const todosRouter = router({
  /**
   * @description Get all todos for the current user
   */

  getTodos: protectedProcedure
    .input(GetTodosInputSchema)
    .query(async ({ ctx, input: { cursor: offset, status, date, title } }) => {
      const userId = ctx.user.id;

      const getTitleFilter = (title: string | undefined) => {
        if (title) {
          return like(todos.title, `%${title}%`);
        }
        return undefined;
      };

      const getStatusFilter = (
        status: z.infer<typeof GetTodosInputSchema>["status"],
      ) => {
        switch (status) {
          case "all":
            return undefined;
          case "completed":
            return eq(todos.completed, true);
          case "active":
            return eq(todos.completed, false);
        }
      };

      const getDateFilter = (
        date: z.infer<typeof GetTodosInputSchema>["date"],
      ) => {
        switch (date) {
          case "all":
            return undefined;
          case "today": {
            const start = new Date();
            const end = new Date();
            start.setHours(0, 0, 0, 0);
            end.setHours(23, 59, 59, 999);
            return and(gte(todos.createdAt, start), lte(todos.createdAt, end));
          }
          case "week": {
            const start = startOfWeek(new Date());
            const end = endOfWeek(new Date());
            return and(gte(todos.createdAt, start), lte(todos.createdAt, end));
          }
          case "month": {
            const start = startOfMonth(new Date());
            const end = endOfMonth(new Date());
            return and(gte(todos.createdAt, start), lte(todos.createdAt, end));
          }
        }
      };

      let results = await db
        .select()
        .from(todos)
        .where(
          and(
            eq(todos.userId, userId),
            getTitleFilter(title),
            getStatusFilter(status),
            getDateFilter(date),
          ),
        )
        .limit(ITEMS_PER_PAGE)
        .offset(offset)
        .orderBy(desc(todos.createdAt));

      const nextResult = await db
        .select({
          id: todos.id,
        })
        .from(todos)
        .where(eq(todos.userId, userId))
        .limit(1)
        .offset(offset + ITEMS_PER_PAGE);

      const formattedResults = results.map((todo) => {
        return {
          ...todo,
          createdAt: formatDistanceToNow(todo.createdAt, { addSuffix: true }),
        };
      });

      return {
        todos: formattedResults,
        hasMore: !!nextResult.length,
        itemsPerPage: ITEMS_PER_PAGE,
      };
    }),
  /**
   * @description Get a single todo for the current user
   */
  getTodo: protectedProcedure
    .input(GetTodoInputSchema)
    .query(async ({ ctx, input }) => {
      const userId = ctx.user.id;
      const { id } = input;

      const result = await db
        .select()
        .from(todos)
        .where(and(eq(todos.id, id), eq(todos.userId, userId)));

      return result;
    }),

  /**
   * @description Create a new todo for the current user
   */
  createTodo: protectedProcedure
    .input(CreateTodoInput)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;
      const { title, completed } = input;

      const [todo] = await db
        .insert(todos)
        .values({
          title,
          completed,
          userId,
          description: "",
        })
        .returning();

      console.log("revalidatePath");

      return todo;
    }),

  /**
   * @description Update a todo for the current user
   */
  updateTodo: protectedProcedure
    .input(UpdateTodoInputSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;
      const { id, title, completed } = input;

      if (userId !== ctx.user.id) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You are not authorized to perform this action",
        });
      }

      const result = await db
        .update(todos)
        .set({
          title,
          completed,
        })
        .where(and(eq(todos.id, id), eq(todos.userId, userId)))
        .returning();

      return result;
    }),

  /**
   * @description Delete a todo for the current user
   */
  deleteTodo: protectedProcedure
    .input(DeleteTodoInputSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;
      const { id } = input;

      if (userId !== ctx.user.id) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You are not authorized to perform this action",
        });
      }

      await db
        .delete(todos)
        .where(and(eq(todos.id, id), eq(todos.userId, userId)));

      return true;
    }),
});
