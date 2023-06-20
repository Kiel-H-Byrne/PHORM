import React, { useEffect, useRef } from "react";
import { Layout, LocateMeButton } from "../components";
import { MAP_STYLES } from "../util/constants";
import { useState } from "react";
import AppMap from "../components/AppMap";

const mapCenter = { lat: -34.397, lng: 150.644 };

const IndexPage = () => {
  const [clientLocation, setClientLocation] = useState(null);
  const [mapInstance, setMapInstance] = useState(null);

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
