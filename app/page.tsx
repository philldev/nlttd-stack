import { HydrateClient, trpc } from "@/trpc/server";
import { Greeting } from "./_greeting";

export default async function Home() {
  void trpc.hello.prefetch({ text: "world" });

  return (
    <HydrateClient>
      <Greeting />
    </HydrateClient>
  );
}
