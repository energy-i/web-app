export const queryKeys = {
  me: ["me"] as const,
  organisation: ["organisation"] as const,
  organisationUsers: ["organisation", "users"] as const,
  sites: ["sites"] as const,
  site: (id: string) => ["sites", id] as const,
  siteAreas: (id: string) => ["sites", id, "areas"] as const,
  siteAlerts: (id: string) => ["sites", id, "alerts"] as const,
  siteConsumption: (id: string, range: string) =>
    ["sites", id, "consumption", range] as const,
  alerts: (view: "active" | "snoozed") => ["alerts", view] as const,
};
