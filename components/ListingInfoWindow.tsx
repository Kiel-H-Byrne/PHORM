import { Progress } from "@chakra-ui/react";
import { InfoWindow } from "@react-google-maps/api";
import React from "react";
import style from "styled-jsx/style";
import CondensedCard from "./CondensedCard";

const ListingInfoWindow = ({ activeListing }) => {
  const { location } = activeListing;
  let loc = location.split(",");
  let locObj = { lat: parseFloat(loc[0]), lng: parseFloat(loc[1]) };

  return (
    <InfoWindow
      position={locObj}
      options={{
        pixelOffset: { height: -30, width: 0, equals: () => false },
        disableAutoPan: true
      }}
    >
      {activeListing ? (
        <div className={style.root}>
          <CondensedCard activeListing={activeListing} />
        </div>
      ) : <Progress />}
    </InfoWindow>
  );
};


export default React.memo(ListingInfoWindow);
