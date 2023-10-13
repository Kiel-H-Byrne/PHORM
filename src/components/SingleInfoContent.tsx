import { InfoWindow } from "@react-google-maps/api";
import { IListing } from "@util/index";
import { memo } from "react";
import Card from "./ListingCard2";

 const SingleInfoContent = ({
  data, options,
}: {
  data: IListing[];
  options: any;
}) => {
  const { lat, lng, name } = data[0];
  const listing = data[0]
  if (lat && lng) {
    return (
      <InfoWindow position={{ lat, lng }} options={options}>
        <Card activeListing={listing} />
      </InfoWindow>
    );
  }
};
export default memo(SingleInfoContent)