import { memo } from "react";
import { GLocation, IListing } from "../types";
import { MultipleInfoContent, SingleInfoContent } from "./";

const MyInfoWindow = ({
  activeData,
  position: clusterCenter,
}: {
  activeData: IListing[];
  position: GLocation;
}) => {
  // const hasNoData = !activeData || activeData.length == 0
  const hasOneItem = activeData?.length == 1;
  const options = {
    pixelOffset: { height: -40, width: 0, equals: undefined },
    disableAutoPan: true,
    position: hasOneItem
      ? { lat: activeData[0].lat, lng: activeData[0].lng }
      : clusterCenter,
  };
  // console.log(activeData, hasOneItem)
  // if (!position.lat) return
  return hasOneItem ? (
    <SingleInfoContent data={activeData} options={options} />
  ) : (
    <MultipleInfoContent data={activeData} options={options} />
  );
};

export default memo(MyInfoWindow);
