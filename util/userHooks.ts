import useSWR from 'swr';
import fetcher from './fetch';

export function useCurrentUser() {
  const { data, mutate } = useSWR('/api/user', fetcher);
  const user = data?.user;
  return [user, { mutate }];
}

export function fetchUser(userId: string) {
  const { data } = useSWR(`/api/users/${userId}`, fetcher, { revalidateOnFocus: false });
  return data?.user;
}