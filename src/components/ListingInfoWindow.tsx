import { Progress } from "@chakra-ui/react";
import { InfoWindow } from "@react-google-maps/api";
import { IListing } from "@util/index";
import React from "react";
import ListingCard from "./ListingCard2";

const ListingInfoWindow = ({ activeListing }: {activeListing: IListing}) => {
  const { lat,lng } = activeListing;
  if (lat && lng) {
    let locObj = { lat, lng };
    return (
      <InfoWindow
      position={locObj}
      options={{
        pixelOffset: { height: -30, width: 0, equals: () => false },
        disableAutoPan: true
      }}
      >
      {activeListing ? (
        <div /*className={style.root}*/>
          <ListingCard activeListing={activeListing} />
        </div>
      ) : <Progress />}
    </InfoWindow>
  );
}
};


export default React.memo(ListingInfoWindow);
