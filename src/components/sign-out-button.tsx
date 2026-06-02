"use client";

import { useRouter } from "next/navigation";

import { signOut } from "@/lib/auth-client";

const SignOutButton = () => {
  const router = useRouter();

  return (
    <button
      onClick={() =>
        signOut({
          fetchOptions: {
            onSuccess: () => {
              router.push("/sign-in");
            },
          },
        })
      }
    >
      Sign out
    </button>
  );
};

export default SignOutButton;
