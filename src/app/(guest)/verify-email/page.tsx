"use client";

import { Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef } from "react";
import { toast } from "sonner";

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
    <div className="flex items-center justify-center">
      <Loader2 className="h-6 w-6 animate-spin" />
    </div>
  );
}

function Page() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      }
    >
      <VerifyEmailPage />
    </Suspense>
  );
}

export default Page;
