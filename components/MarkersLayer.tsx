import { Box } from "@chakra-ui/react";
import { useState } from "react";
import useSWR from "swr";
import { GLocation, IListing } from "../types";
import fetcher from "../util/fetch";

interface Props {
  mapInstance: google.maps.Map;
  clientLocation: GLocation;
}

const InfoWindow = () => <Box width="container.sm">InfoWIndow Content</Box>;

const MarkersLayer = async (props: Props) => {
  const { mapInstance, clientLocation } = props;
  const [infoContent, setInfoContent] = useState("");
  const { AdvancedMarkerElement } = (await google.maps.importLibrary(
    "marker"
  )) as google.maps.MarkerLibrary;

  //make api call using user's location
  const uri = `api/listings?lat=${clientLocation.lat}&lng=${clientLocation.lng}`;
  const { data, error } = useSWR(uri, fetcher);

  const infoWindow = new (window as any).google.maps.InfoWindow({
    content: infoContent,
    // content: '<div id="infoWindow" />',
    // maxWidth:
    position: { lat: 0, lng: 0 },
  });

  const updateInfoWindow = (
    content: string,
    marker: google.maps.marker.AdvancedMarkerElement
  ) => {
    // infoWindow.setContent(content)
    setInfoContent(content);
    infoWindow.open({
      anchor: marker,
      map: mapInstance,
      shouldFocus: true,
    });
    // position: {...clientLocation, lat: clientLocation.lat-.05},
    // }));
    // infoWindow.addListener("domready", () => {
    //   render(<InfoWindow />, document.getElementById("infoWindow"));
    // });
    infoWindow.open(mapInstance);
  };

  if (!clientLocation) return;
  data &&
    data.pullups.forEach((el: IListing) => {
      const marker =
        el.lat && el.lng
          ? new AdvancedMarkerElement({
              position: { lat: el.lat, lng: el.lng },
              map: mapInstance,
              // title: el.title
              // icon:
            })
          : null;
      console.log(marker);
      // marker.addListener("click", () => {
      //   updateInfoWindow(el.message, marker);
      // });
    });
  //display on map
  return <div></div>;
};
