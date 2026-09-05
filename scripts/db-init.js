require("dotenv").config({ path: ".env.local" });

/*
  Database initialization/seed script for PHORM
  Usage: npm run db-init

  Requirements:
  - Environment vars for Firebase Admin:
    FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY
    (Private key may contain literal \n sequences; we will normalize.)
    OR GOOGLE_APPLICATION_CREDENTIALS pointing to a service account JSON file.
*/

/* eslint-disable no-console */
const fs = require("fs");
const path = require("path");
const admin = require("firebase-admin");
const { faker } = require("@faker-js/faker");

function initAdmin() {
  if (process.env.NEXT_PUBLIC_GOOGLE_APPLICATION_CREDENTIALS) {
    admin.initializeApp();
    return admin.firestore();
  }
  const projectId = process.env.NEXT_PUBLIC_FSDB_PROJECT_ID;
  const clientEmail = process.env.NEXT_PUBLIC_FIREBASE_CLIENT_EMAIL;
  let privateKey = process.env.NEXT_PUBLIC_FSDB_PRIVATE_KEY;
  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      "Missing Firebase Admin credentials. Set FIREBASE_* env vars."
    );
  }
  // Normalize private key with escaped newlines
  privateKey = privateKey.replace(/\\n/g, "\n");

  admin.initializeApp({
    credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
  });
  return admin.firestore();
}

// Attempt to read BUSINESS_CATEGORIES from util/constants.ts to avoid duplication
function readBusinessCategories(repoRoot) {
  try {
    const constantsPath = path.join(repoRoot, "util", "constants.ts");
    const ts = fs.readFileSync(constantsPath, "utf8");
    const match = ts.match(
      /export const BUSINESS_CATEGORIES\s*=\s*\[(.*?)\]\s*as const;/s
    );
    if (!match)
      throw new Error("BUSINESS_CATEGORIES not found in constants.ts");
    const arrayContent = match[1]
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .map((s) => s.replace(/^"|"$/g, ""));
    // Clean up trailing comments or artifacts if any
    return arrayContent.filter((s) => s && !s.includes("/*"));
  } catch (e) {
    console.warn(
      "Falling back to default categories (could not parse BUSINESS_CATEGORIES):",
      e.message
    );
    return [
      "Restaurant",
      "Retail",
      "Professional Services",
      "Consulting",
      "Legal",
      "Financial",
      "Healthcare",
      "Education",
      "Technology",
      "Construction",
      "Real Estate",
      "Transportation",
      "Entertainment",
      "Hospitality",
      "Manufacturing",
      "Non-Profit",
      "Other",
    ];
  }
}

function randomDMVCoordinate() {
  // Rough DMV bounding box (focus DC/MD/VA metro)
  const lat = faker.location.latitude({ min: 38.6, max: 39.2 });
  const lng = faker.location.longitude({ min: -77.5, max: -76.5 });
  return { lat, lng };
}

function randomDMVCityState() {
  const cities = [
    { city: "Washington", state: "DC" },
    { city: "Arlington", state: "VA" },
    { city: "Alexandria", state: "VA" },
    { city: "Silver Spring", state: "MD" },
    { city: "Bethesda", state: "MD" },
    { city: "Rockville", state: "MD" },
    { city: "Hyattsville", state: "MD" },
    { city: "Falls Church", state: "VA" },
  ];
  return faker.helpers.arrayElement(cities);
}

function buildListing(categories) {
  const crypto = require("crypto");
  const { city, state } = randomDMVCityState();
  const street = `${faker.location.buildingNumber()} ${faker.location.street()}`;
  const zip = faker.location.zipCode("#####");
  const address = `${street} ${city} ${state} ${zip}`;
  const { lat, lng } = randomDMVCoordinate();
  const name = faker.company.name();
  const place_id = `place_${faker.string.alphanumeric(27)}`;
  // Deterministic doc id based on name+address for idempotency
  const docId = crypto
    .createHash("sha1")
    .update(`${name}|${address}`)
    .digest("hex")
    .slice(0, 28);

  const listing = {
    name,
    description: faker.company.buzzPhrase(),
    street,
    city,
    state,
    zip: parseInt(zip, 10),
    address,
    lat,
    lng,
    imageUri: `https://picsum.photos/seed/${encodeURIComponent(name)}/400/200`,
    submitted: new Date(),
    creator: "seed-bot",
    phone: faker.phone.number("###-###-####"),
    email: faker.internet.email(),
    url: faker.internet.url(),
    place_id,
    isPremium: faker.datatype.boolean({ probability: 0.15 }),
    categories: faker.helpers.arrayElements(categories, { min: 1, max: 3 }),
    businessHours: `Mon-Fri: ${faker.helpers.arrayElement([
      "9:00 AM - 5:00 PM",
      "8:00 AM - 6:00 PM",
      "10:00 AM - 8:00 PM",
    ])}`,
    social: { facebook: "", instagram: "", twitter: "" },
    claims: [],
    claimsCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  return { docId, listing };
}

async function main() {
  const repoRoot = path.resolve(__dirname, "..");
  const db = initAdmin();
  const listingsRef = db.collection("listings");

  // Check current count up to threshold
  const snapshot = await listingsRef.limit(10).get();
  const count = snapshot.size;
  if (count >= 10) {
    console.log(
      `Listings collection already seeded (count: ${count}). Nothing to do.`
    );
    return;
  }

  const categories = readBusinessCategories(repoRoot);
  const target = faker.number.int({ min: 20, max: 50 });
  console.log(`Seeding ${target} listings...`);

  let created = 0;
  for (let i = 0; i < target; i++) {
    const { docId, listing } = buildListing(categories);
    const docRef = listingsRef.doc(docId);
    const exists = await docRef.get();
    if (exists.exists) {
      // Skip duplicates to preserve idempotency
      continue;
    }
    await docRef.set(listing, { merge: false });
    created++;
  }

  console.log(`Seeding complete. Created ${created} new listings.`);
}

main().catch((err) => {
  console.error("db-init failed:", err);
  process.exit(1);
});
