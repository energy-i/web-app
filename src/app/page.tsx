"use client";

import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

export default function Home() {
  const router = useRouter();

  return (
    <div className="flex flex-row gap-4 justify-center items-center h-screen">
      <Button onClick={() => router.push("/sign-up")}>Sign Up</Button>
      <Button onClick={() => router.push("/sign-in")}>Sign In</Button>
    </div>
  );
}
