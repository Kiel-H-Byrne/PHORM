import { GoogleMapProps } from "@react-google-maps/api";
import { z } from "zod";
import { ListingsSchema } from "../db/schemas";

export interface IClaim {
  ownerId?: string;
  ownerName?: string;
  ownerPhone?: string;
  ownerProof?: Date;
}

export type IListing = z.infer<typeof ListingsSchema>

export type Category = "a" | "b" | "c";
export type Libraries = ("drawing" | "geometry" | "localContext" | "places" | "visualization")[];

export interface IAppMap {
  clientLocation: GLocation | null;
  setMapInstance: any;
  mapInstance: GoogleMapProps & any;
}
export interface ILocateMe {
    mapInstance: google.maps.Map | google.maps.StreetViewPanorama;
    setClientLocation: any //a usestate fxn returning {latlng};
    clientLocation: GLocation | null
}
export interface GLocation { lat: number, lng: number }
