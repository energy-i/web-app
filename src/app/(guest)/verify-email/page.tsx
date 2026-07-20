"use client";

import { Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef } from "react";
import { toast } from "sonner";

import { Card, CardContent } from "@/components/ui/card";
import { FieldDescription } from "@/components/ui/field";
import { verifyEmail } from "@/lib/auth-client";

function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const hasRunRef = useRef(false);

  const token = searchParams.get("token");

  useEffect(() => {
    if (hasRunRef.current) return;
    hasRunRef.current = true;

    (async () => {
      if (!token) {
        toast.error("Invalid or missing verification token");
        router.replace("/sign-in");
        return;
      }

      const { error } = await verifyEmail({ query: { token } });

      if (error) {
        toast.error(error.message || "Unable to verify email");
        router.replace("/sign-in");
        return;
      }

      router.replace("/");
    })();
  }, [token, router]);

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-muted p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-4xl">
        <div className="flex flex-col gap-6">
          <Card className="overflow-hidden p-0">
            <CardContent className="grid p-0 md:grid-cols-2">
              <div className="p-6 md:p-8">
                <div className="flex items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              </div>
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

function Page() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      }
    >
      <VerifyEmailPage />
    </Suspense>
  );
}

export default Page;
