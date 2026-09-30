import { IListing } from "@/types";
import { trackEvent } from "./analytics";
import { SITE_URL } from "./constants";

export const listingPath = (listing: Pick<IListing, "id">) =>
  `/listing/${listing.id}`;

export const listingUrl = (listing: Pick<IListing, "id">) =>
  `${SITE_URL || window.location.origin}${listingPath(listing)}`;

/**
 * Opens the native share sheet (great for group chats on mobile) or copies
 * the link. Resolves to what happened so callers can show a toast.
 */
export async function shareListing(
  listing: IListing
): Promise<"shared" | "copied" | "cancelled"> {
  const url = listingUrl(listing);
  const category = listing.categories?.[0];
  const text = category
    ? `Looking for ${category.toLowerCase()}? Check out ${
        listing.name
      } on PHORM.`
    : `Check out ${listing.name} on PHORM.`;
  trackEvent("share", { listingId: listing.id });
  try {
    if (navigator.share) {
      await navigator.share({ title: listing.name, text, url });
      return "shared";
    }
    await navigator.clipboard.writeText(`${text} ${url}`);
    return "copied";
  } catch {
    return "cancelled";
  }
}

/** Google Maps directions link for a listing. */
export const directionsUrl = (listing: IListing) =>
  listing.lat && listing.lng
    ? `https://www.google.com/maps/dir/?api=1&destination=${listing.lat},${listing.lng}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        listing.address || `${listing.name} ${listing.city ?? ""}`
      )}`;

/** Ensures user-entered links are absolute. */
export const externalUrl = (url: string) =>
  /^https?:\/\//i.test(url) ? url : `https://${url}`;
