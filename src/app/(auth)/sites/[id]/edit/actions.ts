"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { updateSite as apiUpdateSite } from "@/lib/api";

export type UpdateSiteInput = {
  name: string;
  addressLine1: string;
  city: string;
  postcode: string;
  sector?: string | null;
  area?: number | null;
  eac?: number | null;
};

export async function updateSite(id: string, data: UpdateSiteInput) {
  await apiUpdateSite(id, data);

  revalidatePath("/sites");
  revalidatePath(`/sites/${id}`, "layout");
  redirect(`/sites/${id}`);
}
