import { InfoWindow } from "@react-google-maps/api";
import { memo } from "react";
import { IListing } from "../types";
import Card from "./ListingCard2";

interface InfoWindowOptions {
  position: google.maps.LatLng | google.maps.LatLngLiteral;
  pixelOffset?: google.maps.Size | null;
  disableAutoPan?: boolean;
  maxWidth?: number;
  zIndex?: number;
}

const SingleInfoContent = ({
  data,
  options,
}: {
  data: IListing[];
  options: InfoWindowOptions;
}) => {
  const listing = data[0];
  if (!listing) return null;

  const { lat, lng } = listing;

  if (lat && lng) {
    return (
      <InfoWindow position={{ lat, lng }} options={options}>
        <Card activeListing={listing} />
      </InfoWindow>
    );
  }

  return null;
};
export default memo(SingleInfoContent);
