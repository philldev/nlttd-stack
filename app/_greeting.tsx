"use client";

import { trpc } from "@/trpc/client";

export function Greeting() {
  const { data, isLoading } = trpc.hello.useQuery({ text: "world" });
  return <div>{isLoading ? "loading..." : data?.greeting}</div>;
}
