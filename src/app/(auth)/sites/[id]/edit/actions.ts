"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getUserWithOrganisation } from "@/lib/auth";
import prisma from "@/lib/prisma";

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
  const currentUser = await getUserWithOrganisation();

  if (!currentUser) {
    throw new Error("Unauthorized");
  }

  const existing = await prisma.site.findFirst({
    where: {
      id,
      organisationId: currentUser.organisationId,
    },
    select: { id: true },
  });

  if (!existing) {
    throw new Error("Site not found");
  }

  await prisma.site.update({
    where: { id },
    data: {
      name: data.name,
      addressLine1: data.addressLine1,
      city: data.city,
      postcode: data.postcode,
      sector: data.sector || null,
      area: data.area ?? null,
      eac: data.eac ?? null,
      updatedAt: new Date(),
    },
  });

  revalidatePath("/sites");
  revalidatePath(`/sites/${id}`, "layout");
  redirect(`/sites/${id}`);
}
