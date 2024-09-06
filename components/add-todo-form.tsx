// AddTodoForm component
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { CreateTodoInput } from "@/api/shared/schemas/todos";
import { api } from "@/api/@client";
import { useQueryClient } from "@tanstack/react-query";
import { getQueryKey } from "@trpc/react-query";

const formSchema = CreateTodoInput.extend({});

interface AddTodoFormProps {}

export function AddTodoForm(_: AddTodoFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
    },
  });

  const queryClient = useQueryClient();

  const todosQueryKey = getQueryKey(api.todos.getTodos, undefined, "infinite");

  const mutation = api.todos.createTodo.useMutation({
    onSuccess: () => {
      form.reset();
      queryClient.invalidateQueries({
        queryKey: todosQueryKey,
      });
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    mutation.mutate(values);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex space-x-2 mb-4"
      >
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem className="flex-grow">
              <FormControl>
                <Input placeholder="Add a new todo..." {...field} />
              </FormControl>
            </FormItem>
          )}
        />
        <Button type="submit">Add Todo</Button>
      </form>
    </Form>
  );
}
