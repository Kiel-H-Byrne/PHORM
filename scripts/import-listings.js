/* eslint-disable no-console */
/*
  Import real business listings from a CSV into Firestore.

  Usage:
    node scripts/import-listings.js data/listings.csv            # dry run (default DB)
    node scripts/import-listings.js data/listings.csv --prod     # dry run against production
    node scripts/import-listings.js data/listings.csv --prod --commit

  CSV columns (header row required; see data/listings.template.csv):
    name*, category*, city*, state*, and at least one of phone/email/website
    optional: keywords (comma separated, quoted), description, street, zip,
              hours, facebook, instagram, owner_email, owner_phone

  owner_email / owner_phone: if the owner already has a PHORM account (they've
  signed in once), the listing is assigned to them so they can edit it right
  away. Otherwise it's imported unassigned; re-run with --commit after they
  sign in to assign it (existing listings only get their owner updated).

  Credentials: FIREBASE_PROJECT_ID / FIREBASE_CLIENT_EMAIL / FIREBASE_PRIVATE_KEY
  (falls back to the NEXT_PUBLIC_ names), loaded from .env.local.
  Geocoding: GOOGLE_GEOCODING_KEY (a server key with the Geocoding API enabled
  and no HTTP-referrer restriction). Falls back to NEXT_PUBLIC_GOOGLE_MAPS_KEY.
*/
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
require("@next/env").loadEnvConfig(path.resolve(__dirname, ".."));
const admin = require("firebase-admin");
const { getFirestore } = require("firebase-admin/firestore");
const { geohashForLocation } = require("geofire-common");

const args = process.argv.slice(2);
const csvPath = args.find((a) => !a.startsWith("--"));
const PROD = args.includes("--prod");
const COMMIT = args.includes("--commit");
const DATABASE_ID = PROD ? "phorm-db-prod" : "(default)";

const STATES = new Set(
  "AL AK AZ AR CA CO CT DC DE FL GA HI ID IL IN IA KS KY LA ME MD MA MI MN MS MO MT NE NV NH NJ NM NY NC ND OH OK OR PA RI SC SD TN TX UT VT VA WA WV WI WY".split(
    " "
  )
);

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"' && text[i + 1] === '"') {
        field += '"';
        i++;
      } else if (c === '"') inQuotes = false;
      else field += c;
    } else if (c === '"') inQuotes = true;
    else if (c === ",") {
      row.push(field);
      field = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else field += c;
  }
  if (field || row.length) {
    row.push(field);
    rows.push(row);
  }
  const [header, ...body] = rows.filter((r) => r.some((v) => v.trim()));
  const keys = header.map((h) => h.trim().toLowerCase());
  return body.map((r) =>
    Object.fromEntries(keys.map((k, i) => [k, (r[i] || "").trim()]))
  );
}

function initDb() {
  const projectId =
    process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FSDB_PROJECT_ID;
  const clientEmail =
    process.env.FIREBASE_CLIENT_EMAIL ||
    process.env.NEXT_PUBLIC_FIREBASE_CLIENT_EMAIL;
  const privateKey = (
    process.env.FIREBASE_PRIVATE_KEY ||
    process.env.NEXT_PUBLIC_FSDB_PRIVATE_KEY ||
    ""
  ).replace(/\\n/g, "\n");
  if (!projectId || !clientEmail || !privateKey) {
    throw new Error("Missing Firebase Admin credentials in .env.local");
  }
  const app = admin.initializeApp({
    credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
  });
  return { db: getFirestore(app, DATABASE_ID), auth: admin.auth(app) };
}

async function geocode(address) {
  const key =
    process.env.GOOGLE_GEOCODING_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY;
  if (!key) throw new Error("Set GOOGLE_GEOCODING_KEY to geocode addresses");
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
    address
  )}&key=${key}`;
  const res = await fetch(url);
  const json = await res.json();
  if (json.status !== "OK" || !json.results?.[0]) {
    throw new Error(
      `Geocoding failed (${json.status}${
        json.error_message ? `: ${json.error_message}` : ""
      })`
    );
  }
  const { lat, lng } = json.results[0].geometry.location;
  return { lat, lng, place_id: json.results[0].place_id };
}

function validate(r) {
  const errors = [];
  if (!r.name || r.name.length < 2) errors.push("name is required");
  if (!r.category) errors.push("category is required");
  if (!r.city) errors.push("city is required");
  const state = (r.state || "").toUpperCase();
  if (!STATES.has(state)) errors.push(`invalid state "${r.state}"`);
  if (r.zip && !/^\d{5}$/.test(r.zip)) errors.push(`invalid zip "${r.zip}"`);
  if (!r.phone && !r.email && !r.website)
    errors.push("needs phone, email or website");
  if (r.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(r.email))
    errors.push(`invalid email "${r.email}"`);
  return { errors, state };
}

const withProtocol = (url) =>
  !url || /^https?:\/\//i.test(url) ? url : `https://${url}`;

async function findOwner(auth, r) {
  try {
    if (r.owner_email) return await auth.getUserByEmail(r.owner_email);
    if (r.owner_phone) return await auth.getUserByPhoneNumber(r.owner_phone);
  } catch (e) {
    if (e.code !== "auth/user-not-found") throw e;
  }
  return null;
}

async function main() {
  if (!csvPath) {
    console.error(
      "Usage: node scripts/import-listings.js <file.csv> [--prod] [--commit]"
    );
    process.exit(1);
  }
  const rows = parseCsv(fs.readFileSync(csvPath, "utf8"));
  console.log(
    `${rows.length} rows · database "${DATABASE_ID}" · ${
      COMMIT ? "COMMIT" : "dry run (add --commit to write)"
    }\n`
  );
  const { db, auth } = initDb();
  const listings = db.collection("listings");
  const summary = { created: 0, ownerUpdated: 0, skipped: 0, failed: 0 };

  for (const [i, r] of rows.entries()) {
    const label = `Row ${i + 2} "${r.name || "?"}"`;
    const { errors, state } = validate(r);
    if (errors.length) {
      console.log(`✗ ${label}: ${errors.join("; ")}`);
      summary.failed++;
      continue;
    }
    const docId = crypto
      .createHash("sha1")
      .update(`${r.name.toLowerCase()}|${r.city.toLowerCase()}|${state}`)
      .digest("hex")
      .slice(0, 20);
    const ref = listings.doc(docId);
    const owner = await findOwner(auth, r);
    const creator = owner
      ? {
          id: owner.uid,
          name: owner.displayName || null,
          email: owner.email || null,
        }
      : { id: null, name: null, email: null };

    const existing = await ref.get();
    if (existing.exists) {
      if (owner && existing.data().creator?.id !== owner.uid) {
        console.log(`↻ ${label}: assigning to ${owner.email || owner.uid}`);
        if (COMMIT)
          await ref.update({ creator, updatedAt: new Date().toISOString() });
        summary.ownerUpdated++;
      } else {
        console.log(`• ${label}: already imported`);
        summary.skipped++;
      }
      continue;
    }

    try {
      const cityState = `${r.city}, ${state}${r.zip ? ` ${r.zip}` : ""}`;
      const address = [r.street, cityState].filter(Boolean).join(", ");
      const geo = await geocode(address);
      const keywords = (r.keywords || "")
        .split(",")
        .map((k) => k.trim())
        .filter(Boolean);
      const now = new Date().toISOString();
      const listing = {
        id: docId,
        name: r.name,
        description: r.description || "",
        street: r.street || "",
        city: r.city,
        state,
        zip: r.zip || "",
        address,
        phone: r.phone || "",
        email: r.email || "",
        url: withProtocol(r.website || ""),
        businessHours: r.hours || "",
        categories: Array.from(new Set([r.category, ...keywords])).slice(0, 5),
        social: {
          facebook: r.facebook || "",
          instagram: r.instagram || "",
          twitter: "",
        },
        ...geo,
        geoHash: geohashForLocation([geo.lat, geo.lng]),
        creator,
        source: "import",
        status: "active",
        isPremium: false,
        claimsCount: 0,
        createdAt: now,
        updatedAt: now,
      };
      if (COMMIT) await ref.set(listing);
      console.log(
        `✓ ${label}: ${address}${
          owner ? ` (owner ${owner.email || owner.uid})` : " (unassigned)"
        }`
      );
      summary.created++;
    } catch (e) {
      console.log(`✗ ${label}: ${e.message}`);
      summary.failed++;
    }
  }

  console.log(
    `\n${COMMIT ? "Done" : "Dry run done"}: ${summary.created} new, ${
      summary.ownerUpdated
    } owner updates, ${summary.skipped} unchanged, ${summary.failed} failed.`
  );
}

main().catch((err) => {
  console.error("import failed:", err.message);
  process.exit(1);
});
