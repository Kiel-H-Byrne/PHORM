// Server-only user access via Firebase Admin.
import { ProfileSchema } from "@/db/schemas";
import { adminDb } from "./admin";

/** Profile fields other signed-in members may see. Contact details stay private. */
const PUBLIC_PROFILE_FIELDS = [
  "firstName",
  "lastName",
  "nickName",
  "profilePhoto",
  "occupation",
  "location",
  "bio",
  "classYear",
  "specialties",
  "orgs",
] as const;

export function toPublicMember(id: string, data: Record<string, any>) {
  const profile: Record<string, any> = {};
  for (const key of PUBLIC_PROFILE_FIELDS) {
    if (data?.profile?.[key] !== undefined) profile[key] = data.profile[key];
  }
  return { id, name: data?.name ?? "", image: data?.image ?? "", profile };
}

/** Fields a user may change on their own profile (roles, listings, etc. are server-controlled). */
export const ProfileUpdateSchema = ProfileSchema.omit({
  roles: true,
  ownedListings: true,
  verifiedListings: true,
  deverifiedListings: true,
  favorites: true,
})
  .partial()
  .strip();

/** Only members who opted in via their profile are visible to other members. */
export const isListedInDirectory = (data: Record<string, any> | undefined) =>
  data?.profile?.listInDirectory === true;

export const usersCollection = () => adminDb().collection("users");
