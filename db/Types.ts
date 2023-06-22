import { z } from "zod";
import { ListingsSchema } from "./schemas";

export interface IClaim {
  ownerId?: string;
  ownerName?: string;
  ownerPhone?: string;
  ownerProof?: Date;
}

export type IListing = z.infer<typeof ListingsSchema>

export type Category = "a" | "b" | "c";
export type Libraries = ("drawing" | "geometry" | "localContext" | "places" | "visualization")[];

export interface GLocation { lat: string, lng: string }

