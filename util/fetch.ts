import { fetch } from 'ts-node';
export default function fetcher(url: string) {
  return fetch(url).then((r) => r.json());
}
