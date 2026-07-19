import { NextRequest, NextResponse } from "next/server";

// Middleware runs in the Edge runtime where `next/headers` is unavailable, so
// we forward the incoming Cookie header directly to the API's /me endpoint.
const API_BASE_URL = process.env.API_BASE_URL ?? "http://localhost:3001/v1";

export async function proxy(request: NextRequest) {
  const cookie = request.headers.get("cookie") ?? "";

  const res = await fetch(`${API_BASE_URL}/me`, {
    headers: cookie ? { cookie } : undefined,
    cache: "no-store",
  });

  if (!res.ok) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/"], // Specify the routes the middleware applies to
};
