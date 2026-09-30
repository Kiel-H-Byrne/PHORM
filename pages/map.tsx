import AppMap from "@/components/AppMap";
import LocateMeButton from "@/components/LocateMeButton";
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
  const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null);

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
