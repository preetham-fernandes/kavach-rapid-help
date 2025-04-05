import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-8">Next.js 14 with shadcn/ui</h1>
      <Button>Login</Button>
    </main>
  );
}