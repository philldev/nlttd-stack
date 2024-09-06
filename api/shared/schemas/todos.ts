import { z } from "zod";

export const CreateTodoInput = z.object({
  title: z.string(),
  completed: z.boolean().optional().default(false),
});

export const GetTodosInputSchema = z.object({
  cursor: z.number().optional().default(0),
  status: z
    .union([z.literal("all"), z.literal("completed"), z.literal("active")])
    .optional()
    .default("all"),
  date: z
    .union([
      z.literal("all"),
      z.literal("today"),
      z.literal("week"),
      z.literal("month"),
    ])
    .optional()
    .default("all"),
  title: z.string().optional(),
});
