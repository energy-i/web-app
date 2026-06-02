import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";
import { hashPassword } from "better-auth/crypto";
import { randomUUID } from "crypto";

import { PrismaClient } from "../src/generated/prisma/client";

const pool = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter: pool });

const SECTORS = [
  "Retail",
  "Manufacturing",
  "Healthcare",
  "Education",
  "Hospitality",
  "Logistics",
  "Office",
  "Industrial",
  "Residential",
  "Government",
];

const COMMS_VENDORS = ["Stark", "Elster", "Landis+Gyr", "Itron", "Siemens"];

const CITIES = [
  { city: "London", lat: 51.5074, lng: -0.1278 },
  { city: "Manchester", lat: 53.4808, lng: -2.2426 },
  { city: "Birmingham", lat: 52.4862, lng: -1.8904 },
  { city: "Leeds", lat: 53.8008, lng: -1.5491 },
  { city: "Bristol", lat: 51.4545, lng: -2.5879 },
  { city: "Liverpool", lat: 53.4084, lng: -2.9916 },
  { city: "Sheffield", lat: 53.3811, lng: -1.4701 },
  { city: "Edinburgh", lat: 55.9533, lng: -3.1883 },
  { city: "Glasgow", lat: 55.8642, lng: -4.2518 },
  { city: "Cardiff", lat: 51.4816, lng: -3.1791 },
];

const STREET_NAMES = [
  "High Street",
  "Station Road",
  "Church Lane",
  "Park Avenue",
  "Mill Road",
  "King Street",
  "Queen Street",
  "Victoria Road",
  "Green Lane",
  "Manor Drive",
];

function randomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomPostcode(): string {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const area =
    letters[Math.floor(Math.random() * 26)] +
    letters[Math.floor(Math.random() * 26)];
  const district = Math.floor(Math.random() * 20) + 1;
  const sector = Math.floor(Math.random() * 9) + 1;
  const unit =
    letters[Math.floor(Math.random() * 26)] +
    letters[Math.floor(Math.random() * 26)];
  return `${area}${district} ${sector}${unit}`;
}

function randomFloat(min: number, max: number): number {
  return Math.round((Math.random() * (max - min) + min) * 100) / 100;
}

async function main() {
  console.log("Seeding database...");

  const now = new Date();
  const orgId = randomUUID();

  // Create organisation
  const organisation = await prisma.organisation.create({
    data: {
      id: orgId,
      name: "Energy Corp",
      createdAt: now,
      updatedAt: now,
    },
  });
  console.log(`Created organisation: ${organisation.name}`);

  // Create user with credential account
  const userId = randomUUID();
  const hashedPassword = await hashPassword("password123");

  const user = await prisma.user.create({
    data: {
      id: userId,
      name: "Admin User",
      email: "admin@energycorp.com",
      emailVerified: true,
      createdAt: now,
      updatedAt: now,
      organisationId: orgId,
    },
  });
  console.log(`Created user: ${user.email}`);

  // Create credential account for the user
  await prisma.account.create({
    data: {
      id: randomUUID(),
      accountId: userId,
      providerId: "credential",
      userId: userId,
      password: hashedPassword,
      createdAt: now,
      updatedAt: now,
    },
  });
  console.log("Created credential account");

  // Create 10 randomised sites
  const sites = Array.from({ length: 10 }, (_, i) => {
    const location = randomElement(CITIES);
    const jitter = () => (Math.random() - 0.5) * 0.05;

    return {
      id: randomUUID(),
      name: `Site ${String(i + 1).padStart(2, "0")} - ${location.city}`,
      addressLine1: `${Math.floor(Math.random() * 200) + 1} ${randomElement(STREET_NAMES)}`,
      city: location.city,
      postcode: randomPostcode(),
      sector: randomElement(SECTORS),
      latitude: location.lat + jitter(),
      longitude: location.lng + jitter(),
      area: randomFloat(500, 50000),
      eac: randomFloat(10000, 500000),
      commsVendor: randomElement(COMMS_VENDORS),
      commsId: `COM-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
      createdAt: now,
      updatedAt: now,
      organisationId: orgId,
    };
  });

  for (const site of sites) {
    await prisma.site.create({ data: site });
  }
  console.log(`Created ${sites.length} sites`);

  console.log("\nSeed complete!");
  console.log("Login credentials: admin@energycorp.com / password123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
