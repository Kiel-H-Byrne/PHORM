import { Box } from "@chakra-ui/react";
import React, { useState } from "react";
import useSWR from "swr";
import { GLocation, PullUp } from "../types";
import fetcher from "../util/fetch";

interface Props {
  mapInstance: google.maps.Map;
  clientLocation: GLocation;
}

const InfoWindow = () => <Box width="container.sm">InfoWIndow Content</Box>;

export const MarkersLayer = (props: Props) => {
  const { mapInstance, clientLocation } = props;
  const [infoContent, setInfoContent] = useState('')

  const infoWindow = new (window as any).google.maps.InfoWindow({
    content: infoContent,
    // content: '<div id="infoWindow" />',
    // maxWidth:
    position: {lat: 0, lng: 0}
  })

  const updateInfoWindow = (content: string, marker: google.maps.Marker) => {
    // infoWindow.setContent(content)
    setInfoContent(content)
    infoWindow.open({
      anchor: marker,
      map: mapInstance,
      shouldFocus: true,
      
    })
      // position: {...clientLocation, lat: clientLocation.lat-.05},
    // }));
    // infoWindow.addListener("domready", () => {
    //   render(<InfoWindow />, document.getElementById("infoWindow"));
    // });
    infoWindow.open(mapInstance);
  };

  if (!clientLocation) {
    return null;
  } else {
    //make api call using user's location
    const uri = `api/pullups?lat=${clientLocation.lat}&lng=${clientLocation.lng}`;

    const { data, error } = useSWR(uri, fetcher);
    data &&
      data.pullups.forEach((el: PullUp) => {
        const marker = new (window as any).google.maps.Marker({
          position: el.location,
          map: mapInstance,
          // title: el.title
          // icon:
        });
        marker.addListener("click", () => {
          updateInfoWindow(el.message, marker);
        });
      });
    //display on map
    return <div></div>;
  }
};
