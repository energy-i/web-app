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

export type ConsumptionScope = "site" | "area" | "appliance";
export type ConsumptionInterval = "hour" | "day" | "week" | "month";

export type ConsumptionPoint = {
  timestamp: string;
  value: number;
};

export type ConsumptionBreakdownItem = {
  id: string;
  name: string;
  total: number;
  series: ConsumptionPoint[];
};

export type Consumption = {
  scope: ConsumptionScope;
  id: string;
  from: string;
  to: string;
  interval: ConsumptionInterval;
  unit: string;
  breakdown: ConsumptionBreakdownItem[];
};

export type AlertStatus = "ALERT" | "OPPORTUNITY" | "INSIGHT";

export type SiteAlert = {
  id: string;
  title: string;
  description: string;
  status: AlertStatus;
  snoozedUntil: string | null;
  dismissedAt: string | null;
  createdAt: string;
  updatedAt: string;
  siteId: string;
};

export type SiteAlertWithSite = SiteAlert & {
  site: { id: string; name: string };
};
