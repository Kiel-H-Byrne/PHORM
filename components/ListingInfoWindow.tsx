import { Progress } from "@chakra-ui/react";
import { InfoWindow } from "@react-google-maps/api";
import React from "react";
import { IListing } from "../types";
import { CondensedCard } from "./";

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
          <CondensedCard activeListing={activeListing} />
        </div>
      ) : <Progress />}
    </InfoWindow>
  );
}
};


export default React.memo(ListingInfoWindow);
