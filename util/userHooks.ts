import { IUser } from "@/types";
import useSWR from "swr";
import { authFetcher } from "./authFetch";

export function useFetchUser(userId?: string | string[]): IUser | undefined {
  const id = Array.isArray(userId) ? userId[0] : userId;
  const { data } = useSWR<IUser>(id ? `/api/users/${id}` : null, authFetcher, {
    revalidateOnFocus: false,
  });
  return data;
}
