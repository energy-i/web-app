import { Link } from "@tanstack/react-router";
import { AlertTriangleIcon, HomeIcon, SearchXIcon } from "lucide-react";
import type * as React from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";

// Shared layout used by the router's default 404 and 500 pages. Mirrors the
// centred, `bg-muted` card look of the unauthed auth pages so error screens
// still feel like part of the app.
export function StatusPage({
  code,
  title,
  description,
  Icon,
  children,
}: {
  code: string;
  title: string;
  description: string;
  Icon: React.ComponentType<{ className?: string }>;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-muted p-6 md:p-10">
      <div className="w-full max-w-md">
        <Card className="overflow-hidden">
          <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
            <div className="flex items-center gap-3 text-muted-foreground">
              <Icon className="h-8 w-8" />
              <span className="text-4xl font-semibold tabular-nums">
                {code}
              </span>
            </div>
            <div className="flex flex-col gap-2">
              <CardTitle className="text-xl font-semibold">{title}</CardTitle>
              <CardDescription>{description}</CardDescription>
            </div>
            {children}
            <Button asChild className="mt-2">
              <Link to="/">
                <HomeIcon />
                Back to dashboard
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export function NotFoundPage() {
  return (
    <StatusPage
      code="404"
      title="Page not found"
      description="The page you are looking for doesn't exist or has been moved."
      Icon={SearchXIcon}
    />
  );
}

export function ErrorPage({ error }: { error?: Error }) {
  return (
    <StatusPage
      code="500"
      title="Something went wrong"
      description="An unexpected error occurred. Please try again in a moment."
      Icon={AlertTriangleIcon}
    >
      {error?.message ? (
        <p className="max-w-full wrap-break-word rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground">
          {error.message}
        </p>
      ) : null}
    </StatusPage>
  );
}
