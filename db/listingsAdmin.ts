// Server-only listing access via Firebase Admin.
import { ListingInput } from "@/db/schemas";
import { IListing } from "@/types";
import { distanceBetween, geohashForLocation } from "geofire-common";
import { adminDb } from "./admin";

export { ListingCreateSchema, ListingUpdateSchema } from "@/db/schemas";

const MAX_LISTINGS = 2000;

const toIso = (v: any): string | undefined => {
  if (!v) return undefined;
  if (typeof v === "string") return v;
  if (typeof v.toDate === "function") return v.toDate().toISOString();
  if (v instanceof Date) return v.toISOString();
  return undefined;
};

/** Serializable, public-safe view of a listing document. */
export function toPublicListing(
  id: string,
  data: Record<string, any>
): IListing {
  const creator =
    data.creator && typeof data.creator === "object"
      ? { id: data.creator.id ?? null, name: data.creator.name ?? null }
      : data.creator ?? null;
  const out: Record<string, any> = {
    ...data,
    id,
    creator,
    createdAt: toIso(data.createdAt) ?? toIso(data.submitted) ?? null,
    updatedAt: toIso(data.updatedAt) ?? toIso(data.updated) ?? null,
  };
  delete out.submitted;
  delete out.updated;
  delete out.deletedAt;
  delete out.claims; // contains claimant contact details
  return out as IListing;
}

/** Accepts both the current `creator: { id }` shape and legacy string creators. */
export const listingOwnerId = (listing: Record<string, any>): string | null =>
  listing?.creator?.id ??
  (typeof listing?.creator === "string" ? listing.creator : null) ??
  listing?.createdBy ??
  null;

export const isVisible = (data: Record<string, any>) =>
  data.deleted !== true && data.status !== "hidden";

export async function getListing(id: string) {
  const snap = await adminDb().collection("listings").doc(id).get();
  if (!snap.exists) return null;
  return { id: snap.id, data: snap.data() as Record<string, any> };
}

export async function getVisibleListings(): Promise<IListing[]> {
  const snap = await adminDb().collection("listings").limit(MAX_LISTINGS).get();
  return snap.docs
    .filter((d) => isVisible(d.data()))
    .map((d) => toPublicListing(d.id, d.data()));
}

export function matchesSearch(listing: IListing, term: string) {
  const haystack = [
    listing.name,
    listing.description,
    listing.address,
    listing.city,
    listing.state,
    ...(listing.categories || []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return term
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every((word) => haystack.includes(word));
}

export function withDistance(listings: IListing[], near: [number, number]) {
  return listings
    .map((l) => ({
      ...l,
      distanceKm:
        typeof l.lat === "number" && typeof l.lng === "number"
          ? distanceBetween([l.lat, l.lng], near)
          : undefined,
    }))
    .sort((a, b) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity));
}

export function buildAddress(d: Partial<ListingInput>) {
  const cityState = [d.city, [d.state, d.zip].filter(Boolean).join(" ")]
    .filter(Boolean)
    .join(", ");
  return [d.street, cityState].filter(Boolean).join(", ");
}

export function geoFields(lat: number, lng: number) {
  return { lat, lng, geoHash: geohashForLocation([lat, lng]) };
}
