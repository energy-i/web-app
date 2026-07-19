import "server-only";

import { headers } from "next/headers";

import type {
  Area,
  OrganisationWithSites,
  OrganisationWithUsers,
  Site,
  User,
  UserWithOrganisation,
} from "./types";

// Server-side base URL for the platform API. In dev this defaults to the local
// Hono server; the browser talks to the same endpoints via the /api/* rewrite
// configured in next.config.ts so session cookies stay on the Next.js origin.
const API_BASE_URL = process.env.API_BASE_URL ?? "http://localhost:3001/v1";

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const incoming = await headers();
  const cookie = incoming.get("cookie") ?? "";

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    cache: "no-store",
    headers: {
      accept: "application/json",
      ...(init.body ? { "content-type": "application/json" } : {}),
      ...(cookie ? { cookie } : {}),
      ...init.headers,
    },
  });

  if (!res.ok) {
    let message = res.statusText;
    try {
      const body = await res.json();
      if (body && typeof body === "object" && "message" in body) {
        message = String((body as { message?: unknown }).message ?? message);
      }
    } catch {
      // ignore JSON parse failures
    }
    throw new ApiError(res.status, message);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return (await res.json()) as T;
}

export async function getMe(): Promise<UserWithOrganisation | null> {
  try {
    const { user } = await apiFetch<{ user: UserWithOrganisation }>("/me");
    return user;
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      return null;
    }
    throw error;
  }
}

export async function getOrganisation(): Promise<OrganisationWithSites> {
  const { organisation } = await apiFetch<{
    organisation: OrganisationWithSites;
  }>("/organisation");
  return organisation;
}

export async function getOrganisationUsers(): Promise<OrganisationWithUsers> {
  const { organisation } = await apiFetch<{
    organisation: OrganisationWithUsers;
  }>("/organisation/users");
  return organisation;
}

export async function getSites(): Promise<Site[]> {
  const { sites } = await apiFetch<{ sites: Site[] }>("/sites");
  return sites;
}

export async function getSite(id: string): Promise<Site | null> {
  try {
    const { site } = await apiFetch<{ site: Site }>(`/sites/${id}`);
    return site;
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return null;
    }
    throw error;
  }
}

export async function getSiteAreas(id: string): Promise<Area[]> {
  const { areas } = await apiFetch<{ areas: Area[] }>(`/sites/${id}/areas`);
  return areas;
}

export type SiteInput = {
  name: string;
  addressLine1: string;
  city: string;
  postcode: string;
  sector?: string | null;
  area?: number | null;
  eac?: number | null;
};

export async function createSite(data: SiteInput): Promise<Site> {
  const { site } = await apiFetch<{ site: Site }>("/sites", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return site;
}

export async function updateSite(id: string, data: SiteInput): Promise<Site> {
  const { site } = await apiFetch<{ site: Site }>(`/sites/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
  return site;
}

export async function createUser(data: {
  name: string;
  email: string;
}): Promise<User> {
  const { user } = await apiFetch<{ user: User }>("/users", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return user;
}

export async function deleteUser(id: string): Promise<void> {
  await apiFetch<void>(`/users/${id}`, { method: "DELETE" });
}
