export function fetcher(url: string) {
  return fetch(url).then((r) => r.json());
}
