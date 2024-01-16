import { StatesEnum } from "@/types";
import * as z from "zod";

const SocialSchema = z.object({
  facebook: z.string(),
  instagram: z.string(),
  twitter: z.string(),
});

const ProfileSchema = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  nickName: z.string(),
  lodgeNumber: z.number(),
  lodgeState: z.string(),
  profilePhoto: z.string(),
  lodge: z.string(),
  occupation: z.string(),
  location: z.string(),
  bio: z.string(),
  skills: z.array(z.string()),
  email: z.string().email(),

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
  name: z.string(),
  email: z.string().email(),
  image: z.string(),
  emailVerified: z.boolean(),
  profile: ProfileSchema,
});

export const ClaimSchema = z.object({
  cuid: z.string(),
  phone: z.string(),
  proofUri: z.string().url(),
  member: UserSchema,
});

export const ListingsSchema = z.object({
    name: z.string().min(5),
    address: z.string(),
    street: z.string().min(5),
    city: z.string().min(3),
    state: StatesEnum,
    zip: z.number().min(10000).max(99999), //5 digits max,country: z.string(),phone: z.string(),url: z.string().url(),claims: z.array(ClaimSchema),claimsCount: z.number(),lat: z.number(),lng: z.number(),place_id: z.string(),// verifiers: z.array(z.string()),// verifierCount: z.number(),// deVerifiers: z.array(z.string()),// deVerifierCount: z.number(),geoHash: z.string(),imageUri: z.string(),// // places_details: z.object()
    description: z.string(), // google_id: z.string(),// yelp_id: z.string(),// email: z.string(),// categories: z.array(z.string()),social: SocialSchema,creator: UserSchema,submitted: z.date(),
  })
  .partial()
  .transform((data, ctx) => {
    //make address, and location? and....
    const { street, city, state, zip, lat, lng } = data;
    const address = `${street} ${city} ${state} ${zip}`;
    // const geoHash = geohashForLocation([lat, lng]);
    data["country"] = "USA";
    data["submitted"] = new Date();
    data["address"] = address;
    // data["geoHash"] = geoHash;
    return data;
  });
