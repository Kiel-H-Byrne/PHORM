import React from "react";

import { Marker } from "@react-google-maps/api";
import {
  Clusterer,
} from "@react-google-maps/marker-clusterer";
import { IListing } from "@util/index";
interface IMyMarker {
  markerData: IListing;
  clusterer: Clusterer;
  activeData: IListing[];
  setActiveData: any;
  setWindowClosed: any;
  setWindowOpen: any;
  toggleDrawer: any;
}

const MyMarker = ({
  markerData,
  clusterer,
  setActiveData,
  setWindowClosed,
  setWindowOpen,
  toggleDrawer,
}: IMyMarker) => {
  const { lat,lng, place_id } = markerData;
  // location ? (loc = location.split(",")) : (loc = "50.60982,-1.34987");
  // let locObj = { lat: parseFloat(loc[0]), lng: parseFloat(loc[1]) };
  let image = {
    url: "/img/orange_marker_sm.png",
  };
const mockData = {
  name: "Sample Business",
  address: "123 Main Street, City",
  description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
  owner: {
    username: "john_doe",
    lodge: "ABC Lodge",
    name: "John Doe",
  },  imageUri: "https://picsum.photos/200/300",
}
  const handleMouseOverMarker = () => {
    setActiveData([mockData]);
    // setActiveData([markerData]);
    setWindowOpen();
  };
  const handleMouseOut = () => {
    setWindowClosed();
  };
  const handleClickMarker = () => {
    // infowindow needs to be set for mobile (touch, no hover)
    setActiveData([mockData]);
    // setActiveData([markerData]);
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
