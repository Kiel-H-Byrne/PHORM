import useSWR from "swr";
import fetcher from "./fetch";

export function useCurrentUser() {
  const { data, mutate } = useSWR("/api/user", fetcher);
  const user = data?.user;
  return [user, { mutate }];
}

export function useFetchUser(userId: string) {
  const { data, error } = useSWR(`/api/users/${userId}`, fetcher, {
    revalidateOnFocus: false,
  });
  if (error) {
    console.log('error',error);
    return;
  }
  return data?.user;
}
