import { StatesEnum } from "@/types";
import * as z from "zod";

const SocialSchema = z.object({
  facebook: z.string(),
  instagram: z.string(),
  twitter: z.string(),
});
const reserved_orgs = ["lodge", "chapter", "appendant"] as const;
const OrgSchema = z.object({
  type: z.enum(reserved_orgs),
  name: z.string(),
  number: z.string(),
  state: z.string(),
});
export const ProfileSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  nickName: z.string(),
  orgs: z.array(OrgSchema),
  profilePhoto: z.string(),
  occupation: z.string(),
  location: z.string(),
  bio: z.string(),
  skills: z.array(z.string()),
  // email: z.string().email(),
  contact: z.object({
    email: z.string().email(),
    phone: z.string(),
  }),
  ownedListings: z.array(z.string()),
  verifiedListings: z.array(z.string()),
  deverifiedListings: z.array(z.string()),
  favorites: z.array(z.string()),
  social: SocialSchema,
  roles: z.array(z.string()),
});

export const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  image: z.string(),
  emailVerified: z.string(),
  profile: ProfileSchema.partial().required({
    orgs: true,
  }),
});

export const ClaimSchema = z.object({
  cuid: z.string(),
  phone: z.string(),
  proofUri: z.string().url(),
  member: UserSchema,
});

export const ListingsSchema = z
  .object({
    name: z.string().min(5),
    address: z.string(),
    street: z.string().min(5),
    city: z.string().min(3),
    state: StatesEnum,
    lat: z.number(),
    lng: z.number(),
    submitted: z.date(),
    place_id: z.string(),
    claims: z.array(ClaimSchema),
    claimsCount: z.number(),
    imageUri: z.string(),
    creator: z.string(),
    phone: z.string(),
    url: z.string().url(),
    isPremium: z.boolean(),
    zip: z.number().min(10000).max(99999), //5 digits max,
    // country: z.string(), // verifiers: z.array(z.string()),// verifierCount: z.number(),// deVerifiers: z.array(z.string()),// deVerifierCount: z.number(),geoHash: z.string(), // places_details: z.object()
    description: z.string(),
    businessHours: z.string(),
    // google_id: z.string(),// yelp_id: z.string(),//
    email: z.string(),
    categories: z.array(z.string()),
    social: SocialSchema,
  })
  .partial()
  .transform((data, ctx) => {
    //make address, and location? and....
    const { street, city, state, zip } = data;
    const address = `${street} ${city} ${state} ${zip}`;
    data["submitted"] = new Date();
    data["address"] = address;
    // data["geoHash"] = geoHash;
    return data;
  });
