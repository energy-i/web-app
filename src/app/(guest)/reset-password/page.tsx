"use client";

import { InfoIcon, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { toast } from "sonner";

import { Alert, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { resetPassword } from "@/lib/auth-client";

function ResetPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();

  const token = searchParams.get("token");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError("Invalid or missing reset token");
      return;
    }

    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const newPassword = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    const { error } = await resetPassword({
      newPassword,
      token,
    });

    if (error) {
      setError(error.message || "An error occurred");
      setLoading(false);
    } else {
      toast.success("Password reset successful", {
        description: "Please sign in with your new password",
      });
      router.push("/sign-in");
    }
  }

  if (!token) {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center bg-muted p-6 md:p-10">
        <div className="w-full max-w-sm">
          <Card className="overflow-hidden p-0">
            <CardContent className="p-6 md:p-8">
              <div className="flex flex-col gap-4 text-center">
                <h1 className="text-2xl font-semibold">Invalid link</h1>
                <p className="text-muted-foreground">
                  This password reset link is invalid or has expired.
                </p>
                <Link
                  href="/forgot-password"
                  className="text-sm underline-offset-2 hover:underline"
                >
                  Request a new reset link
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-muted p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-4xl">
        <div className="flex flex-col gap-6">
          <Card className="overflow-hidden p-0">
            <CardContent className="grid p-0 md:grid-cols-2">
              <div className="p-6 md:p-8">
                <form onSubmit={handleSubmit}>
                  <FieldGroup>
                    <div className="flex flex-col items-center gap-2 text-center">
                      <CardTitle className="text-2xl font-semibold flex items-center gap-2">
                        <img
                          src="/logo.svg"
                          alt="Energyi Logo"
                          className="h-12 w-auto"
                        />
                        Energy-i
                      </CardTitle>
                      <p className="text-balance text-muted-foreground">
                        Enter your new password
                      </p>
                    </div>
                    {error && (
                      <Alert variant="destructive" className="mb-4">
                        <InfoIcon />
                        <AlertTitle>{error}</AlertTitle>
                      </Alert>
                    )}
                    <Field>
                      <FieldLabel htmlFor="password">New password</FieldLabel>
                      <Input
                        id="password"
                        type="password"
                        name="password"
                        required
                        minLength={8}
                      />
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="confirmPassword">
                        Confirm password
                      </FieldLabel>
                      <Input
                        id="confirmPassword"
                        type="password"
                        name="confirmPassword"
                        required
                        minLength={8}
                      />
                    </Field>
                    <Field>
                      <Button disabled={loading} type="submit">
                        {loading && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}{" "}
                        Reset password
                      </Button>
                    </Field>
                    <FieldDescription className="text-center">
                      <Link
                        href="/sign-in"
                        className="text-sm underline-offset-2 hover:underline"
                      >
                        Back to sign in
                      </Link>
                    </FieldDescription>
                  </FieldGroup>
                </form>
              </div>
              <div className="relative hidden bg-muted md:block">
                <img
                  src="/renewable-energy.webp"
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover opacity-50"
                />
                <div
                  aria-hidden
                  className="absolute inset-0 bg-primary mix-blend-color blur-2xl"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Page() {
  return (
    // You could have a loading skeleton as the `fallback` too
    <Suspense>
      <ResetPasswordPage />
    </Suspense>
  );
}

export default Page;
