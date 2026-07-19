"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createSite as apiCreateSite } from "@/lib/api";

export type CreateSiteInput = {
  name: string;
  addressLine1: string;
  city: string;
  postcode: string;
  sector?: string | null;
  area?: number | null;
  eac?: number | null;
};

export async function createSite(data: CreateSiteInput) {
  const site = await apiCreateSite(data);

  revalidatePath("/sites");
  redirect(`/sites/${site.id}`);
}
