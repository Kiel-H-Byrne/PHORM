import { AppList, AppMap, Layout, LocateMeButton } from "@components/index";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
const IndexPage = () => {
  const [clientLocation, setClientLocation] = useState(null);
  const [mapInstance, setMapInstance] = useState({} as google.maps.Map);
// type VIEW_TYPE = 'map' | 'list'
  const params =  useSearchParams()
const viewType = params?.get('viewType')

  return (
    <>
      <Layout title="The P.H.O.R.M">
        {viewType === 'map' ? <>
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
        : <AppList mapInstance={mapInstance}
        setMapInstance={setMapInstance}/>
        }
      </Layout>
    </>
  );
};

export default IndexPage;
