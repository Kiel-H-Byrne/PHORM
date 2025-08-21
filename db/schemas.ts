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
const experience_levels = ["apprentice", "intermediate", "master"] as const;
export const ProfileSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  contact: z.object({
    email: z
      .string()
      .email("Invalid email address")
      .optional()
      .or(z.literal("")),
    phone: z.string().optional().or(z.literal("")),
  }),
  bio: z.string().optional().or(z.literal("")),
  location: z.string().optional().or(z.literal("")),
  specialties: z.array(z.string()).optional().default([]),
  experienceLevel: z.enum(experience_levels).optional(),
  availability: z.string().optional().or(z.literal("")),
  socialLinks: z.array(z.string()).optional().default([]),
  orgs: z.array(OrgSchema).optional().default([]),
  classYear: z.number().optional(),
  nickName: z.string().optional(),
  profilePhoto: z.string().optional(),
  occupation: z.string().optional(),
  ownedListings: z.array(z.string()).optional(),
  verifiedListings: z.array(z.string()).optional(),
  deverifiedListings: z.array(z.string()).optional(),
  favorites: z.array(z.string()).optional(),
  social: SocialSchema.optional(),
  roles: z.array(z.string()).optional(),
});

export const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  image: z.string(),
  emailVerified: z.string(),
  profile: ProfileSchema.partial().required({
    orgs: true,
    lastName: true,
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
    id: z.string(),
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
