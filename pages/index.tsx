import { GLocation } from "@/types";
import { GEOCENTER } from "@/util/constants";
import { useState } from "react";
import { Layout, LocateMeButton } from "../components";
import AppMap from "../components/AppMap0";
const IndexPage = () => {
  const [clientLocation, setClientLocation] = useState(GEOCENTER as GLocation);
  const [mapInstance, setMapInstance] = useState({} as google.maps.Map);

  return (
    <>
      <Layout title="Pull Up!">
        <AppMap
          clientLocation={clientLocation}
          mapInstance={mapInstance}
          setMapInstance={setMapInstance}
        />
        {/* <MarkerInfo /> */}
        <LocateMeButton
          mapInstance={mapInstance}
          clientLocation={clientLocation}
          setClientLocation={setClientLocation}
        />
      </Layout>
    </>
  );
};

export default IndexPage;
