import { STATE_ABBREVIATIONS } from "@/util/constants";
import { GoogleMapProps } from "@react-google-maps/api";
import { z } from "zod";
import { ClaimSchema, ListingsSchema, UserSchema } from "../db/schemas";

export type IClaims = z.infer<typeof ClaimSchema>[];
export type IListing = z.infer<typeof ListingsSchema>;
export type IUser = z.infer<typeof UserSchema>;

export type Category = "a" | "b" | "c";
export type Libraries = (
  | "drawing"
  | "geometry"
  | "localContext"
  | "places"
  | "visualization"
)[];

export interface IAppMap {
  client_location: GLocation | null;
  setMapInstance: any;
  mapInstance: GoogleMapProps & any;
}
export interface ILocateMe {
  mapInstance: google.maps.Map | google.maps.StreetViewPanorama;
  setClientLocation: any; //a usestate fxn returning {latlng};
  clientLocation: GLocation | null;
}
export interface GLocation {
  lat: number;
  lng: number;
}
export const StatesEnum = z.enum(STATE_ABBREVIATIONS);
type GenericRecord = Record<string, Record<number, string>>;
export const PHA_LODGES: GenericRecord = {
  [StatesEnum.enum.DC]: {
    1: "Social",
    3: "Felix",
    4: "Hiram",
    5: "Eureka",
    6: "Meridian",
    7: "Widow's Son",
    8: "Warren",
    9: "Pythagoras",
    10: "John F. Cook",
    12: "St. John's",
    14: "Prince Hall",
    15: "Charles Datcher",
    16: "James H. Hill",
    17: "Ionic",
    18: "Corinthian",
    19: "Doric",
    20: "Fidelity",
    22: "Harmony",
    23: "Victory",
    24: "Redemption",
    25: "Acacia",
    26: "Fellowship",
    27: "Prudence",
    28: "Thomas L. Johnson",
    29: "Nathaniel M. Adams Jr. Military",
  },
};

// export type MemberQuery = {
//   id: string;
//   name: string;
//   by: string;
//   limit: string;
//   from: Date;
//   occupation: string;
//   location: string;
// };
export type IMemberQuery = Partial<IUser["profile"]>;
export type MemberQuery = Partial<
  Pick<IUser["profile"], "occupation" | "location" | "lodgeNumber"> &
    Pick<IUser, "name" | "email">
>;
