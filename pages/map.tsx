import { AppMap, LocateMeButton } from "@/components";
import { useState } from "react";

/**
 * MapPage
 * Renders the interactive map view with the locate-me/add-listing floating actions.
 */
export default function MapPage() {
  const [clientLocation, setClientLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [mapInstance, setMapInstance] = useState({} as google.maps.Map);

  return (
    <>
      <AppMap
        client_location={clientLocation}
        mapInstance={mapInstance}
        setMapInstance={setMapInstance}
      />
      <LocateMeButton
        mapInstance={mapInstance}
        clientLocation={clientLocation}
        setClientLocation={setClientLocation}
      />
    </>
  );
}

