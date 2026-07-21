import { createAuthClient } from "better-auth/react";

// Better Auth's client appends its route (e.g. `/sign-in/email`) directly to
// `baseURL`, so the URL must include the `/auth` mount point. In dev the Vite
// server proxies same-origin `/api/*` -> `${API_BASE_URL}/*`, so a browser
// POST to `/api/auth/sign-in/email` lands on the backend's `/v1/auth/...`. In
// production set VITE_API_BASE_URL to the API's public URL (e.g.
// `https://api.example.com/v1`); we append `/auth` to it here.
const configured = import.meta.env.VITE_API_BASE_URL;
const baseURL = configured
  ? `${configured.replace(/\/$/, "")}/auth`
  : `${window.location.origin}/api/auth`;

export const {
  signIn,
  signUp,
  signOut,
  useSession,
  requestPasswordReset,
  resetPassword,
  verifyEmail,
} = createAuthClient({ baseURL });
