"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getUserWithOrganisation } from "@/lib/auth";
import prisma from "@/lib/prisma";

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
  const currentUser = await getUserWithOrganisation();

  if (!currentUser) {
    throw new Error("Unauthorized");
  }

  const now = new Date();

  const site = await prisma.site.create({
    data: {
      name: data.name,
      addressLine1: data.addressLine1,
      city: data.city,
      postcode: data.postcode,
      sector: data.sector || null,
      area: data.area ?? null,
      eac: data.eac ?? null,
      organisationId: currentUser.organisationId,
      createdAt: now,
      updatedAt: now,
    },
  });

  revalidatePath("/sites");
  redirect(`/sites/${site.id}`);
}
