import { useNavigate } from "@tanstack/react-router";

import { signOut } from "@/lib/auth-client";

const SignOutButton = () => {
  const navigate = useNavigate();

  return (
    <button
      onClick={() =>
        signOut({
          fetchOptions: {
            onSuccess: () => {
              navigate({ to: "/sign-in" });
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
