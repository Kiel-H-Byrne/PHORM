import React, { useEffect } from "react";

import { Marker, MarkerProps } from "@react-google-maps/api";

interface IMyMarker {
  data: any;
  clusterer: any;
  activeData: any;
  setActiveData: any;
  setWindowClose: any;
  toggleWindow: any;
  toggleDrawer: any;
}

const MyMarker = ({
  data,
  clusterer,
  setActiveData,
  setWindowClose,
  toggleWindow,
  toggleDrawer,
}: IMyMarker) => {
  let loc;
  const { location, _id } = data;
  // location ? (loc = location.split(",")) : (loc = "50.60982,-1.34987");
  // let locObj = { lat: parseFloat(loc[0]), lng: parseFloat(loc[1]) };
  let image = {
    url: "img/orange_marker_sm.png",
  };

  const handleMouseOverMarker = () => {
    setActiveData([data]);
    toggleWindow();
  };
  const handleMouseOut = () => {
    toggleWindow();
  };
  const handleClickMarker = () => {
    toggleDrawer();
  };
  return (
    <div className="App-marker" key={_id}>
      <Marker
        position={location}
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
