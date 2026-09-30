import { phormApp } from "@/db/firebase";
import { track as vercelTrack } from "@vercel/analytics";
import type { Analytics } from "firebase/analytics";

/**
 * Product events we care about for MVP:
 * - Discovery: search, search_no_results, listing_view, contact_click, share
 * - Supply: add_listing_start, add_listing_step, add_listing_complete, add_listing_error
 * - Accounts: login
 */
export type AnalyticsEvent =
  | "search"
  | "search_no_results"
  | "listing_view"
  | "contact_click"
  | "share"
  | "locate_me"
  | "add_listing_start"
  | "add_listing_step"
  | "add_listing_complete"
  | "add_listing_error"
  | "edit_listing_complete"
  | "login";

type Props = Record<string, string | number | boolean | null | undefined>;

let firebaseAnalytics: Promise<Analytics | null> | undefined;

function getFirebaseAnalytics() {
  if (
    typeof window === "undefined" ||
    !phormApp ||
    !process.env.NEXT_PUBLIC_FSDB_MEASUREMENT_ID
  ) {
    return Promise.resolve(null);
  }
  firebaseAnalytics ??= import("firebase/analytics")
    .then(async ({ getAnalytics, isSupported }) =>
      (await isSupported()) ? getAnalytics(phormApp!) : null
    )
    .catch(() => null);
  return firebaseAnalytics;
}

/** Initializes GA4 early so automatic page_view events are recorded. */
export function initAnalytics() {
  void getFirebaseAnalytics();
}

export function trackEvent(name: AnalyticsEvent, props: Props = {}) {
  const clean = Object.fromEntries(
    Object.entries(props).filter(([, v]) => v !== undefined)
  ) as Record<string, string | number | boolean | null>;
  try {
    vercelTrack(name, clean);
  } catch {
    // analytics must never break the app
  }
  void getFirebaseAnalytics().then(async (analytics) => {
    if (!analytics) return;
    const { logEvent } = await import("firebase/analytics");
    logEvent(analytics, name as string, clean);
  });
}
