"use client";

import { GetTodosInputSchema } from "@/api/shared/schemas/todos";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { z } from "zod";
import { useDebouncedCallback } from "use-debounce";
import { getFiltersFromSearchParams } from "@/lib/utils";
import { X } from "lucide-react";
import { Button } from "./ui/button";

export function FilterBar() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const filters = getFiltersFromSearchParams(searchParams);

  const handleTitle = useDebouncedCallback((value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value && value.trim().length > 0) {
      params.set("title", value);
    } else {
      params.delete("title");
    }
    router.replace(`${pathname}?${params.toString()}`);
  }, 300);

  function handleStatus(value: z.infer<typeof GetTodosInputSchema>["status"]) {
    const params = new URLSearchParams(searchParams);
    console.log(params.get("status"));
    if (params.get("status") === value) {
      params.delete("status");
    } else {
      params.set("status", value);
    }
    router.replace(`${pathname}?${params.toString()}`);
  }

  function handleDate(value: z.infer<typeof GetTodosInputSchema>["date"]) {
    const params = new URLSearchParams(searchParams);
    if (params.get("date") !== value) {
      params.set("date", value);
    } else {
      params.delete("date");
    }
    router.replace(`${pathname}?${params.toString()}`);
  }

  function clearFilters() {
    const params = new URLSearchParams(searchParams);
    params.delete("title");
    params.delete("status");
    params.delete("date");
    router.replace(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        <Input
          className="flex-1 h-8"
          placeholder="Filter by title"
          defaultValue={filters.title}
          onChange={(e) => handleTitle(e.target.value)}
        />
        <Select
          value={filters.status}
          onValueChange={(
            value: z.infer<typeof GetTodosInputSchema>["status"],
          ) => handleStatus(value)}
        >
          <SelectTrigger className="w-[150px] h-8">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="active">Active</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={filters.date ?? ""}
          onValueChange={(value: z.infer<typeof GetTodosInputSchema>["date"]) =>
            handleDate(value)
          }
        >
          <SelectTrigger className="w-[150px] h-8">
            <SelectValue placeholder="Filter by date" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All time</SelectItem>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="week">This week</SelectItem>
            <SelectItem value="month">This month</SelectItem>
          </SelectContent>
        </Select>

        <Button size="sm" onClick={clearFilters} variant="secondary">
          <X className="w-4 h-4 mr-2" />
          <span>Clear filters</span>
        </Button>
      </div>
    </div>
  );
}
