import { memo } from "react";
import { GLocation, IListing } from "../types";
import { MultipleInfoContent, SingleInfoContent } from "./";

const MyInfoWindow = ({
  activeData,
  clusterCenter,
}: {
  activeData: IListing[];
  clusterCenter: GLocation;
}) => {
  const hasOneItem = activeData.length && activeData.length == 1;
  
  const options = {
    pixelOffset: { height: -40, width: 0, equals: undefined },
    disableAutoPan: true,
    position: hasOneItem
      ? { lat: activeData[0].lat, lng: activeData[0].lng }
      : clusterCenter,
  };
  // const hasNoData = !activeData || activeData.length == 0
  // console.log(activeData, hasOneItem)

  return hasOneItem ? (
    <SingleInfoContent data={activeData} options={options} />
  ) : (
    <MultipleInfoContent data={activeData} options={options} />
  );
};

export default memo(MyInfoWindow);
