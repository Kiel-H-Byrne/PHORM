import React, { useCallback } from "react";

import { Marker } from "@react-google-maps/api";
import { Clusterer } from "@react-google-maps/marker-clusterer";
import { IListing } from "../types";

interface IMyMarker {
  markerData: IListing;
  clusterer: Clusterer;
  activeData: IListing[];
  setActiveData: (data: IListing[]) => void;
  setWindowClosed: () => void;
  setWindowOpen: () => void;
  toggleDrawer: () => void;
}

const MARKER_ICON = {
  url: "/img/orange_marker_sm.png",
};

const MyMarker = ({
  markerData,
  clusterer,
  setActiveData,
  setWindowClosed,
  setWindowOpen,
  toggleDrawer,
}: IMyMarker) => {
  const lat = Number(markerData.lat);
  const lng = Number(markerData.lng);

  const handleMouseOverMarker = useCallback(() => {
    setActiveData([markerData]);
    setWindowOpen();
  }, [markerData, setActiveData, setWindowOpen]);

  const handleMouseOut = useCallback(() => {
    setWindowClosed();
  }, [setWindowClosed]);

  const handleClickMarker = useCallback(() => {
    setActiveData([markerData]);
    toggleDrawer();
  }, [markerData, setActiveData, toggleDrawer]);

  if (isNaN(lat) || isNaN(lng) || (lat === 0 && lng === 0)) {
    return null;
  }

  return (
    <Marker
      position={{ lat, lng }}
      clusterer={clusterer}
      icon={MARKER_ICON}
      onMouseOver={handleMouseOverMarker}
      onMouseOut={handleMouseOut}
      onClick={handleClickMarker}
    />
  );
};

export default React.memo(MyMarker);
