import { GetTodosInputSchema } from "@/api/shared/schemas/todos";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const FilterSchema = GetTodosInputSchema.pick({
  status: true,
  date: true,
  title: true,
}).partial();

export function getFiltersFromSearchParams(searchParams: URLSearchParams) {
  const status = searchParams.get("status") ?? undefined;
  const date = searchParams.get("date") ?? undefined;
  const title = searchParams.get("title") ?? undefined;

  const parseResult = FilterSchema.safeParse({
    status,
    date,
    title,
  });

  if (!parseResult.success) {
    return {};
  } else {
    return parseResult.data;
  }
}
