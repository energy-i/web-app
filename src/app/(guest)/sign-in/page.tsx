"use client";

import { InfoIcon, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Alert, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { signIn } from "@/lib/auth-client";

function Page() {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleSignIn(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const form = e.currentTarget;
    const formData = new FormData(form);

    const data = await signIn.email({
      email: formData.get("email") as string,
      password: formData.get("password") as string,
    });

    if (data.error) {
      setError(data.error.message || "An error occurred during sign in");
      setLoading(false);
    } else {
      router.push("/");
    }
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-muted p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-4xl">
        <div className="flex flex-col gap-6">
          <Card className="overflow-hidden p-0">
            <CardContent className="grid p-0 md:grid-cols-2">
              <form onSubmit={handleSignIn} className="p-6 md:p-8">
                <FieldGroup>
                  <div className="flex flex-col items-center gap-2 text-center">
                    <CardTitle className="text-2xl font-semibold">
                      Welcome back
                    </CardTitle>
                    <CardDescription>
                      Sign in to your energyi account
                    </CardDescription>
                  </div>
                  {error && (
                    <Alert variant="destructive" className="mb-4">
                      <InfoIcon />
                      <AlertTitle>{error}</AlertTitle>
                    </Alert>
                  )}
                  <Field>
                    <FieldLabel htmlFor="email">Email</FieldLabel>
                    <Input
                      id="email"
                      type="email"
                      name="email"
                      placeholder="you@example.com"
                      required
                    />
                  </Field>
                  <Field>
                    <div className="flex items-center">
                      <FieldLabel htmlFor="password">Password</FieldLabel>
                      <a
                        href="/forgot-password"
                        className="ml-auto text-sm underline-offset-2 hover:underline"
                      >
                        Forgot your password?
                      </a>
                    </div>
                    <Input
                      id="password"
                      type="password"
                      name="password"
                      required
                    />
                  </Field>
                  <Field>
                    <Button disabled={loading} type="submit">
                      {loading && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}{" "}
                      Sign in
                    </Button>
                  </Field>
                  <FieldDescription className="text-center">
                    Don&apos;t have an account? <a href="/sign-up">Sign up</a>
                  </FieldDescription>
                </FieldGroup>
              </form>
              <div className="relative hidden bg-muted md:block">
                <img
                  src="/renewable-energy.webp"
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover"
                />
              </div>
            </CardContent>
          </Card>
          <FieldDescription className="px-6 text-center">
            By clicking continue, you agree to our{" "}
            <a href="#">Terms of Service</a>.
          </FieldDescription>
        </div>
      </div>
    </div>
  );
}

export default Page;
