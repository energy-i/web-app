"use client";

import { useRouter } from "next/navigation";
import * as React from "react";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export type AlertsView = "active" | "snoozed";

export function ViewTabs({ value }: { value: AlertsView }) {
  const router = useRouter();
  const [isPending, startTransition] = React.useTransition();

  const handleChange = (next: string) => {
    if (next === value) return;
    const nextView = next as AlertsView;
    const url = nextView === "active" ? "/alerts" : `/alerts?view=${nextView}`;
    startTransition(() => {
      router.push(url);
    });
  };

  return (
    <Tabs
      value={value}
      onValueChange={handleChange}
      data-pending={isPending ? "" : undefined}
      className="w-fit"
    >
      <TabsList>
        <TabsTrigger value="active">Active</TabsTrigger>
        <TabsTrigger value="snoozed">Snoozed</TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
