import AppList from "@/components/AppList";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { AppMap, LocateMeButton } from "../components";
const IndexPage = () => {
  const [clientLocation, setClientLocation] = useState(null);
  const [mapInstance, setMapInstance] = useState({} as google.maps.Map);

  const params = useSearchParams();
  const viewType = params?.get("viewType");

  return viewType === "list" ? (
    <AppList />
  ) : (
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
};

export default IndexPage;
