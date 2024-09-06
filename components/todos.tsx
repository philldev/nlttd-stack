"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { AddTodoForm } from "./add-todo-form";
import { TodoList } from "./todo-list";
import { Suspense } from "react";
import { FilterBar } from "./todo-filter-bar";

export function Todos() {
  return (
    <Card className="w-full max-w-3xl mx-auto my-20">
      <CardHeader>
        <FilterBar />
      </CardHeader>
      <CardContent>
        <AddTodoForm />
        <Suspense fallback={<div>Loading...</div>}>
          <TodoList />
        </Suspense>
      </CardContent>
    </Card>
  );
}

// TodoList component
