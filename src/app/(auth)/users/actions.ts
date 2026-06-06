"use server";

import { headers } from "next/headers";

import { auth, getUserWithOrganisation } from "@/lib/auth";

export async function createUser(data: { name: string; email: string }) {
  const currentUser = await getUserWithOrganisation();

  if (!currentUser) {
    throw new Error("Unauthorized");
  }

  const response = await auth.api.createUser({
    headers: await headers(),
    body: {
      name: data.name,
      email: data.email,
      password: crypto.randomUUID(), // Temporary password; user resets via invite email
      role: "user",
      data: {
        organisationId: currentUser.organisationId,
      },
    },
  });

  await auth.api.requestPasswordReset({
    body: {
      email: response.user.email,
      redirectTo: "/reset-password",
    },
  });

  return response.user;
}

export async function deleteUser(userId: string) {
  const currentUser = await getUserWithOrganisation();

  if (!currentUser) {
    throw new Error("Unauthorized");
  }

  if (currentUser.id === userId) {
    throw new Error("You cannot delete your own account");
  }

  await auth.api.removeUser({
    headers: await headers(),
    body: {
      userId,
    },
  });
}
