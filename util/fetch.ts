export default async function fetcher(url: string) {
  const res = await fetch(url);
  // Throw so SWR exposes `error` instead of treating an error body as data.
  if (!res.ok) throw new Error(`Request failed (${res.status})`);
  return res.json();
}
