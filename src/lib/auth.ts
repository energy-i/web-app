import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { APIError } from "better-auth/api";
import { redirect } from "next/navigation";

import prisma from "@/lib/prisma";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  advanced: {
    database: {
      generateId: false, // "serial" for auto-incrementing numeric IDs
    },
  },
  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ user, url }) => {
      // TODO: Replace with your email provider (e.g. Resend, SendGrid)
      console.log(`Password reset link for ${user.email}: ${url}`);
    },
  },
  user: {
    additionalFields: {
      organisationId: {
        type: "string",
        required: false,
        input: false,
      },
    },
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user, ctx) => {
          const organisationName = ctx?.body?.organisationName;

          if (!organisationName) {
            throw new APIError("BAD_REQUEST", {
              message: "Organisation name is required",
            });
          }

          const org = await prisma.organisation.create({
            data: {
              name: organisationName,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          });

          return {
            data: {
              ...user,
              organisationId: org.id,
            },
          };
        },
      },
    },
  },
  signUp: {
    onSuccess: async () => {
      redirect("/dashboard");
    },
  },
  signIn: {
    onSuccess: async () => {
      redirect("/dashboard");
    },
  },
});
