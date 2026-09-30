import { StatesEnum } from "@/types";
import { STATE_ABBREVIATIONS } from "@/util/constants";
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
  // Member directory is opt-in: only members who set this appear to others.
  listInDirectory: z.boolean().optional(),
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
    creator: z.union([
      z.string(),
      z
        .object({
          id: z.string().nullable(),
          name: z.string().nullable(),
          email: z.string().nullable(),
        })
        .partial(),
    ]),
    createdAt: z.string().nullable(),
    updatedAt: z.string().nullable(),
    updated: z.date(),
    geoHash: z.string(),
    status: z.enum(["active", "hidden"]),
    deleted: z.boolean(),
    distanceKm: z.number(),
    phone: z.string(),
    url: z.string().url(),
    isPremium: z.boolean(),
    zip: z.union([z.number(), z.string()]),
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
    const { street, city, state, zip } = data as any;
    if (street && city && state && zip) {
      const address = `${street} ${city} ${state} ${zip}`;
      (data as any)["address"] = address;
    }
    (data as any)["submitted"] = new Date();
    return data;
  });

const DiscountTypes = ["percent", "amount", "bogo", "free"] as const;
export const CouponSchema = z
  .object({
    id: z.string(),
    title: z.string().min(3),
    description: z.string().optional().or(z.literal("")),
    discountType: z.enum(DiscountTypes),
    value: z.number().optional(),
    code: z.string().optional().or(z.literal("")),
    memberOnly: z.boolean().default(true),
    terms: z.string().optional().or(z.literal("")),
    validFrom: z.date().optional(),
    validUntil: z.date().optional(),
    tags: z.array(z.string()).optional().default([]),
    listingId: z.string().optional(),
    createdBy: z.string(),
    active: z.boolean().default(true),
    createdAt: z.string().optional(),
    updatedAt: z.string().optional(),
  })
  .partial();

// == Listing input (shared by the add/edit forms and the API) == //

const optionalText = (max: number) =>
  z.string().trim().max(max).optional().or(z.literal(""));

const optionalUrl = z
  .string()
  .trim()
  .max(300)
  .transform((v) => (v && !/^https?:\/\//i.test(v) ? `https://${v}` : v))
  .pipe(z.string().url().or(z.literal("")))
  .optional();

/** Fields a listing owner may set. Everything else is server-controlled. */
export const ListingInputSchema = z.object({
  name: z.string().trim().min(2, "Business name is required").max(100),
  description: optionalText(500),
  street: optionalText(150),
  city: z.string().trim().min(2, "City is required").max(80),
  state: z.enum(STATE_ABBREVIATIONS),
  zip: z
    .union([z.string(), z.number()])
    .transform((v) => String(v ?? "").trim())
    .refine((v) => v === "" || /^\d{5}$/.test(v), "ZIP must be 5 digits")
    .optional(),
  phone: optionalText(30),
  email: z.string().trim().email().max(120).optional().or(z.literal("")),
  url: optionalUrl,
  categories: z.array(z.string().trim().min(1).max(40)).max(5).default([]),
  businessHours: optionalText(300),
  imageUri: optionalUrl,
  place_id: optionalText(300),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  social: z
    .object({
      facebook: optionalText(200),
      instagram: optionalText(200),
      twitter: optionalText(200),
    })
    .partial()
    .optional(),
});

export const ListingCreateSchema = ListingInputSchema.refine(
  (d) => !!(d.phone || d.email || d.url),
  { message: "Add at least one way to contact the business", path: ["phone"] }
);

export const ListingUpdateSchema = ListingInputSchema.partial();

export type ListingInput = z.infer<typeof ListingInputSchema>;
