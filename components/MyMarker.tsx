import React from "react";

import { Marker } from "@react-google-maps/api";
import { IListing } from "../types";

interface IMyMarker {
  data: IListing;
  clusterer: any;
  activeData: any;
  setActiveData: any;
  setWindowClosed: any;
  setWindowOpen: any;
  toggleDrawer: any;
}

const MyMarker = ({
  data,
  clusterer,
  setActiveData,
  setWindowClosed,
  setWindowOpen,
  toggleDrawer,
}: IMyMarker) => {
  const { lat,lng, place_id } = data;
  // location ? (loc = location.split(",")) : (loc = "50.60982,-1.34987");
  // let locObj = { lat: parseFloat(loc[0]), lng: parseFloat(loc[1]) };
  let image = {
    url: "/img/orange_marker_sm.png",
  };

  const handleMouseOverMarker = () => {
    setActiveData([data]);
    setWindowOpen();
  };
  const handleMouseOut = () => {
    setWindowClosed();
  };
  const handleClickMarker = () => {
    toggleDrawer();
  };
  return (
    <div className="App-marker" key={place_id}>
      <Marker
        position={{lat: lat!,lng: lng!}}
        clusterer={clusterer}
        icon={image}
        onMouseOver={handleMouseOverMarker}
        onMouseOut={handleMouseOut}
        onClick={handleClickMarker}
        //@ts-ignore
        // __data={data}
        // visible={categories.some((el) => selectedCategories.has(el))} //check for if category matches selected categories
      />
    </div>
  );
};

export default React.memo(MyMarker);
