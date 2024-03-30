import { StatesEnum } from "@/types";
import { phoneRegex } from "@/util/helpers";
import * as z from "zod";
import { ListingTypeEnum, ListingTypeList } from "./listings";

const SocialSchema = z.object({
  facebook: z.string(),
  instagram: z.string(),
  twitter: z.string(),
});
const OrgSchema = z.object({
  type: z.enum(['LODGE', 'CHAPTER', 'APPENDANT']), //"lodge" | "chapter" | "appendant"
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
    name: z.z.string().min(5),
    type: z.enum(ListingTypeList as any),
    //RETAIL
    address: z.string().optional(),
    street: z.string().min(5).optional(),
    city: z.string().min(3).optional(),
    state: StatesEnum.optional(),
    lat: z.number().optional(),
    lng: z.number().optional(),
    place_id: z.string(),
    //CONTRACTOR
    serviceRadius: z.number().min(5).max(200).optional(),
    zip: z.number().min(10000).max(99999).optional(),
    //ONLINE
    url: z.string().url().optional(),
    //THE REST ...
    submitted: z.date(),
    claims: z.array(ClaimSchema),
    claimsCount: z.number(),
    imageUri: z.string(),
    creator: UserSchema.omit({ profile: true }),
    description: z.string(),
    public: z.boolean(),
    categories: z.array(z.string()),
    phone: z.string().regex(phoneRegex, 'Invalid Phone Number'),
    // google_id: z.string(),// yelp_id: z.string(),// email: z.string(),// 
    // social: SocialSchema,creator: UserSchema,submitted: z.date(),
    //5 digits max,country: z.string(),
    // ,lng: z.number(),place_id: z.string(),// verifiers: z.array(z.string()),// verifierCount: z.number(),// deVerifiers: z.array(z.string()),// deVerifierCount: z.number(),geoHash: z.string(),imageUri: z.string(),// // places_details: z.object()
  }).partial()
  // Perform conditional validation to ensure either a valid email or phone number is provided.
  .superRefine(({ type, street, zip, url, serviceRadius, city, state }, refinementContext) => {
    //if type is RETAIL, then make address, lat/long, etc. required
    //if type is ONLINE, then make url required, 
    //if type is CONTRACTOR, then make zip,serviceRadius required
    if (type === (ListingTypeEnum.RETAIL as unknown as string) && !!street && !!zip && !!city && !!state) {
      return refinementContext.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Must include Address (Street, City, State, Zip)',
        path: ['street', 'city', 'state', 'zip'],
      });
    }
    if (type === (ListingTypeEnum.ONLINE as unknown as string) && !!url) {
      return refinementContext.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Must include Url',
        path: ['url'],
      });
    }
    if (type === (ListingTypeEnum.CONTRACTOR as unknown as string) && !!serviceRadius && !!zip) {
      return refinementContext.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Must include Zip and Service Radius',
        path: ['zip', 'serviceRadius'],
      });
    }
  })
  .transform((data, ctx) => {
    //make address, and location? and....
    console.log(ctx)
    const { street, city, state, zip } = data;
    const address = `${street} ${city} ${state} ${zip}`;
    data["submitted"] = new Date();
    data["address"] = address;
    // data["geoHash"] = geoHash;
    return data;
  })

export const ContractorSchema = z.object({
  name: z.string().min(5),
  baseZip: z.number().min(10000).max(99999), // Base area zipcode
  serviceRadius: z.number(), // Service radius in miles
  submitted: z.date(),
  place_id: z.string(),
  // claims: z.array(ClaimSchema),
  // claimsCount: z.number(),
  imageUri: z.string(),
  creator: UserSchema.omit({ profile: true }),
  description: z.string(),
});