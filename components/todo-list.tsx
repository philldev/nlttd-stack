import { Checkbox } from "@/components/ui/checkbox";
import { api } from "@/api/@client";
import { useSearchParams } from "next/navigation";
import { Button } from "./ui/button";
import { PencilIcon, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem } from "./ui/form";
import { Input } from "./ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { getFiltersFromSearchParams } from "@/lib/utils";

export function TodoList() {
  const searchParams = useSearchParams();

  const filters = getFiltersFromSearchParams(searchParams);

  const [data, query] = api.todos.getTodos.useSuspenseInfiniteQuery(
    {
      ...filters,
    },
    {
      getNextPageParam: (lastPage, pages) => {
        if (lastPage?.hasMore) {
          return pages.length * lastPage.itemsPerPage;
        }
        return undefined;
      },
    },
  );

  const todos = data?.pages.flatMap((page) => page.todos) ?? [];

  const empty = todos.length === 0;

  const loadMore = () => {
    query.fetchNextPage();
  };

  const [editingId, setEditingId] = useState<string | null>(null);

  const editInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingId && editInputRef.current) {
      editInputRef.current.focus();
    }
  }, [editingId]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        if (editInputRef.current) {
          editInputRef.current.blur();
        }

        setEditingId(null);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [editInputRef.current]);

  return (
    <>
      {empty ? (
        <div className="flex items-center justify-center h-full py-4">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">No todos found</p>
          </div>
        </div>
      ) : (
        <ul className="space-y-2">
          {todos.map((todo) => (
            <li key={todo.id} className="flex items-center space-x-2">
              <ToggleTodoButton todoId={todo.id} completed={todo.completed} />
              {editingId === todo.id ? (
                <EditTodoForm
                  todoId={todo.id}
                  initialTitle={todo.title}
                  onCancel={() => setEditingId(null)}
                  inputRef={editInputRef}
                />
              ) : (
                <>
                  <label
                    htmlFor={todo.id}
                    className={`flex-grow text-sm pl-[13px] ${todo.completed ? "line-through text-muted-foreground" : ""}`}
                  >
                    {todo.title}
                  </label>
                  <span className="text-sm text-muted-foreground">
                    {todo.createdAt}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setEditingId(todo.id)}
                    className="h-8 w-8 p-0"
                    aria-label="Edit todo"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </Button>
                  <DeleteTodoButton todoId={todo.id} />
                </>
              )}
            </li>
          ))}
        </ul>
      )}
      {query.hasNextPage && (
        <div className="flex items-center mt-4">
          <Button variant="outline" onClick={loadMore}>
            Load More
          </Button>
        </div>
      )}
    </>
  );
}
interface DeleteTodoButtonProps {
  todoId: string;
}

export function DeleteTodoButton({ todoId }: DeleteTodoButtonProps) {
  const utils = api.useUtils();
  const searchParams = useSearchParams();
  const offset = parseInt(searchParams.get("offset") ?? "0");
  const filters = getFiltersFromSearchParams(searchParams);

  const mutation = api.todos.deleteTodo.useMutation({
    onMutate: async ({ id }) => {
      await utils.todos.getTodos.cancel();

      utils.todos.getTodos.setInfiniteData(
        {
          cursor: offset,
          ...filters,
        },
        (data) => {
          if (!data)
            return {
              pages: [],
              pageParams: [],
            };

          return {
            ...data,
            pages: data.pages.map((page) => ({
              ...page,
              todos: page.todos.filter((todo) => todo.id !== id),
            })),
          };
        },
      );
    },
  });

  const onDelete = () => {
    mutation.mutate({ id: todoId });
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={onDelete}
      className="h-8 w-8 p-0"
      aria-label="Delete todo"
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  );
}
const formSchema = z.object({
  title: z
    .string()
    .min(1, "Todo title is required")
    .max(100, "Todo title must be 100 characters or less"),
});

interface EditTodoFormProps {
  initialTitle: string;
  todoId: string;
  onCancel: () => void;
  inputRef: React.RefObject<HTMLInputElement>;
}

export function EditTodoForm({
  initialTitle,
  onCancel,
  inputRef,
  todoId,
}: EditTodoFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: initialTitle,
    },
  });

  const utils = api.useUtils();
  const searchParams = useSearchParams();
  const offset = parseInt(searchParams.get("offset") ?? "0");
  const filters = getFiltersFromSearchParams(searchParams);

  const mutation = api.todos.updateTodo.useMutation({
    onMutate: async ({ id, title }) => {
      onCancel();
      await utils.todos.getTodos.cancel();
      utils.todos.getTodos.setInfiniteData(
        {
          cursor: offset,
          ...filters,
        },
        (data) => {
          if (!data || !title)
            return {
              pages: [],
              pageParams: [],
            };

          return {
            ...data,
            pages: data.pages.map((page) => ({
              ...page,
              todos: page.todos.map((todo) => {
                if (todo.id === id) {
                  return {
                    ...todo,
                    title,
                  };
                }
                return todo;
              }),
            })),
          };
        },
      );
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    mutation.mutate({ id: todoId, title: values.title });
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex space-x-2 flex-grow"
      >
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem className="flex-grow">
              <FormControl>
                <Input className="h-8 w-full" {...field} ref={inputRef} />
              </FormControl>
            </FormItem>
          )}
        />
        <Button type="submit" size="sm">
          Save
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={onCancel}>
          Cancel
        </Button>
      </form>
    </Form>
  );
}

interface ToggleTodoButtonProps {
  todoId: string;
  completed: boolean;
}

export function ToggleTodoButton({ todoId, completed }: ToggleTodoButtonProps) {
  const utils = api.useUtils();
  const searchParams = useSearchParams();

  const offset = parseInt(searchParams.get("offset") ?? "0");
  const filters = getFiltersFromSearchParams(searchParams);

  const mutation = api.todos.updateTodo.useMutation({
    onMutate: async ({ id, completed }) => {
      await utils.todos.getTodos.cancel();
      utils.todos.getTodos.setInfiniteData(
        {
          cursor: offset,
          ...filters,
        },
        (data) => {
          if (!data || completed === undefined)
            return {
              pages: [],
              pageParams: [],
            };

          return {
            ...data,
            pages: data.pages.map((page) => ({
              ...page,
              todos: page.todos.map((todo) => {
                if (todo.id === id) {
                  return {
                    ...todo,
                    completed,
                  };
                }
                return todo;
              }),
            })),
          };
        },
      );
    },
  });

  const onToggle = () => {
    mutation.mutate({ id: todoId, completed: !completed });
  };

  return (
    <Checkbox id={todoId} checked={completed} onCheckedChange={onToggle} />
  );
}
