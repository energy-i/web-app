// Types mirroring the platform API (`apps/api`) response shapes. Kept as a
// small, hand-maintained subset because the web-app no longer depends on
// Prisma-generated types.

export type Organisation = {
  id: string;
  name: string;
  email: string | null;
  address: string | null;
  createdAt: string;
  updatedAt: string;
};

export type User = {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image: string | null;
  createdAt: string;
  updatedAt: string;
  organisationId: string;
  role: string | null;
  banned: boolean | null;
  banReason: string | null;
  banExpires: string | null;
};

export type UserWithOrganisation = User & { organisation: Organisation };

export type MeterType = "SMETS2" | "SMETS1" | "LEGACY" | "SUB";

export type Site = {
  id: string;
  name: string;
  addressLine1: string;
  city: string;
  postcode: string;
  sector: string | null;
  latitude: number | null;
  longitude: number | null;
  area: number | null;
  eac: number | null;
  commsVendor: string | null;
  commsId: string | null;
  meterType: MeterType | null;
  createdAt: string;
  updatedAt: string;
  organisationId: string;
  tariffId: string | null;
};

export type Area = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  siteId: string;
  _count: { appliances: number };
};

export type OrganisationWithSites = Organisation & { sites: Site[] };
export type OrganisationWithUsers = Organisation & { users: User[] };
