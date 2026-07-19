"use server";

import { revalidatePath } from "next/cache";

import {
  createUser as apiCreateUser,
  deleteUser as apiDeleteUser,
} from "@/lib/api";

export async function createUser(data: { name: string; email: string }) {
  const user = await apiCreateUser(data);
  revalidatePath("/users");
  return user;
}

export async function deleteUser(userId: string) {
  await apiDeleteUser(userId);
  revalidatePath("/users");
}
