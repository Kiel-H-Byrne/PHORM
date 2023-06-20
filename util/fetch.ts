export default function fetcher(url: string) {
  return fetch(url).then((r) => r.json());
}
