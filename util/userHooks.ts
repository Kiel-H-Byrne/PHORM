import useSWR from "swr";
import fetcher from "./fetch";
import { IUser } from "@/types";
import { UserImportBuilder } from "firebase-admin/lib/auth/user-import-builder";

export function useCurrentUser() {
  const { data, mutate } = useSWR("/api/user", fetcher);
  const user = data?.user;
  return [user, { mutate }];
}

export function useFetchUser(userId?: string | string[]): IUser | undefined {
  let url = `/api/users/${userId}`
  if (Array.isArray(userId)) { url = `/api/users/${userId[0]}` }
  const { data, error } = useSWR(url, fetcher, {
    revalidateOnFocus: false,
  });
  if (error) {
    console.log("error", error);
    return;
  }
  return data?.user;
}
