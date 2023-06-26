import { useState } from "react";
import { AppMap, Layout, LocateMeButton } from "../components";
const IndexPage = () => {
  const [clientLocation, setClientLocation] = useState(null);
  const [mapInstance, setMapInstance] = useState({} as google.maps.Map);

  return (
    <>
      <Layout title="The P.H.O.R.M">
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
      </Layout>
    </>
  );
};

export default IndexPage;
