import { api, HydrateClient } from "@/api/@server";
import { Todos } from "@/components/todos";
import { getFiltersFromSearchParams } from "@/lib/utils";

export default async function TodosPage({
  searchParams,
}: {
  searchParams: { [key: string]: string };
}) {
  const offset = Array.isArray(searchParams.offset)
    ? parseInt(searchParams.offset[0])
    : parseInt(searchParams.offset ?? "0");

  const filters = getFiltersFromSearchParams(new URLSearchParams(searchParams));

  void api.todos.getTodos.prefetchInfinite({
    cursor: offset,
    ...filters,
  });

  return (
    <HydrateClient>
      <div className="min-h-screen grid place-items-center">
        <Todos />
      </div>
    </HydrateClient>
  );
}
