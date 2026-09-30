import { appAuth } from "@/db/firebase";

/**
 * fetch() that attaches the signed-in user's Firebase ID token and sends JSON.
 * Use for any API call that writes data or reads private data.
 */
export default async function authFetch(
  url: string,
  init: RequestInit = {}
): Promise<Response> {
  // Wait for Firebase to restore a persisted session before reading currentUser.
  await appAuth?.authStateReady();
  const token = await appAuth?.currentUser?.getIdToken();
  const headers = new Headers(init.headers);
  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  return fetch(url, { ...init, headers });
}

/** SWR fetcher for authenticated GET endpoints. */
export const authFetcher = async (url: string) => {
  const res = await authFetch(url);
  if (!res.ok) throw new Error(`Request failed (${res.status})`);
  return res.json();
};
