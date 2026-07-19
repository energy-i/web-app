"use client";

import { InfoIcon, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Alert, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { CardDescription, CardTitle } from "@/components/ui/card";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { signUp } from "@/lib/auth-client";

export default function SignUpPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();

  async function handleSignUp(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const form = e.currentTarget;
    const formData = new FormData(form);

    const data = await signUp.email({
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      name: formData.get("name") as string,
      organisationName: formData.get("organisation") as string,
    } as never);

    if (data.error) {
      setError(data.error.message || "An error occurred during sign in");
      setLoading(false);
    } else {
      toast.success("Account created", {
        description: "Check your email to complete set up",
      });
      router.push("/");
    }
  }

  return (
    <>
      <form onSubmit={handleSignUp} className="space-y-6">
        <div className="flex flex-col items-center gap-2 text-center">
          <CardTitle className="text-2xl font-semibold">
            Welcome to energyi
          </CardTitle>
          <CardDescription>
            Sign up to create your energyi account
          </CardDescription>
        </div>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <InfoIcon />
            <AlertTitle>{error}</AlertTitle>
          </Alert>
        )}
        <Field>
          <FieldLabel htmlFor="name">Full Name</FieldLabel>
          <Input
            id="name"
            name="name"
            type="text"
            required
            placeholder="Your Full Name"
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="organisation">Organisation</FieldLabel>
          <Input
            id="organisation"
            name="organisation"
            type="text"
            required
            placeholder="Your Organisation Name"
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="email">Email address</FieldLabel>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="you@example.com"
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="password">Password</FieldLabel>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            placeholder="••••••••"
          />
          <FieldDescription>Must be at least 8 characters</FieldDescription>
        </Field>

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? <Loader2 className="animate-spin" /> : ""} Sign up
        </Button>
        <p className="text-sm text-center text-muted-foreground">
          Already have an account?{" "}
          <Link href="/sign-in" className="font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </form>
    </>
  );
}
