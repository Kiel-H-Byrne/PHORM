import { memo, useState } from "react";

import {
  GoogleMap,
  MarkerClusterer,
  useJsApiLoader
} from "@react-google-maps/api";

import fetcher from "@/util/fetch";
import {
  Box,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import SWR from "swr";
import { GLocation, IAppMap, IListing } from "../types";
import { GEOCENTER, MAP_STYLES } from "../util/constants";
import MyInfoWindow from "./InfoWindow";
import { InteractiveUserName } from "./InteractiveUserName";
import MyMarker from "./MyMarker";


const clusterStyles = [
  {
    url: "img/m1.png",
    height: 53,
    width: 53,
    anchor: [26, 26],
    textColor: "#000",
    textSize: 11,
  },
  {
    url: "img/m2.png",
    height: 56,
    width: 56,
    anchor: [28, 28],
    textColor: "#000",
    textSize: 11,
  },
  {
    url: "img/m3.png",
    height: 66,
    width: 66,
    anchor: [33, 33],
    textColor: "#000",
    textSize: 11,
  },
  {
    url: "img/m4.png",
    height: 78,
    width: 78,
    anchor: [39, 39],
    textColor: "#000",
    textSize: 11,
  },
  {
    url: "img/m5.png",
    height: 90,
    width: 90,
    anchor: [45, 45],
    textColor: "#000",
    textSize: 11,
  },
];

const defaultProps = {
  center: GEOCENTER,
  zoom: 11, //vs 11
  options: {
    // mapTypeId:google.maps.MapTypeId.TERRAIN,
    backgroundColor: "#555",
    clickableIcons: false,
    disableDefaultUI: true,
    fullscreenControl: false,
    zoomControl: true,
    // zoomControlOptions: {
    //   position: window.google.maps.ControlPosition.RIGHT_CENTER,
    // },
    mapTypeControl: false,
    // mapTypeControlOptions: {
    //   style: window.google.maps.MapTypeControlStyle.DROPDOWN_MENU,
    //   position: window.google.maps.ControlPosition.RIGHT_CENTER,
    //   mapTypeIds: ['roadmap', 'terrain']
    // },
    scaleControl: false,
    rotateControl: true,
    streetViewControl: false,
    // streetViewControlOptions: {
    //   position: window.google.maps.ControlPosition.BOTTOM_CENTER,
    // },
    //gestureHandling sets the mobile panning on a scrollable page: COOPERATIVE, GREEDY, AUTO, NONE
    gestureHandling: "greedy",
    scrollwheel: true,
    maxZoom: 18,
    minZoom: 4, //3 at mobbv0
    // Map styles; snippets from 'Snazzy Maps'.
    styles: MAP_STYLES.lightGray,
  },
};



const AppMap = ({ clientLocation, setMapInstance, mapInstance }: IAppMap) => {
  let { center, zoom, options } = defaultProps;
  const uri = clientLocation
    ? `api/listings?lat=${clientLocation.lat}&lng=${clientLocation.lng}`
    : 'api/listings';

    
  const {
    isOpen: isDrawerOpen,
    onOpen: toggleDrawer,
    onClose: setDrawerClose,
  } = useDisclosure();
  const {
    isOpen: isWindowOpen,
    onToggle: toggleWindow,
    onClose: setWindowClose,
  } = useDisclosure();
  const [infoWindowPosition, setInfoWindowPosition] = useState({} as GLocation);
  const [activeData, setActiveData] = useState([] as IListing[]);

const { data: fetchData, error } = SWR(uri, fetcher, { loadingTimeout: 1000, errorRetryCount: 2 });

  // console.log(fetchData, error)
  const toast = useToast();
  // activeData && toast.closeAll();
  // const uri = clientLocation ? `api/fetchData?lat=${getTruncated(clientLocation.lat)}&lng=${getTruncated(clientLocation.lng)}` : null;
  //clusterer needs to return one element?
  const checkForOverlaps = (data: IListing[]) => {
    const result: { [key: string]: IListing[] } = data.reduce( (r, a) => {
      if (a.lng && a.lat) {
        const locString = `{lng: ${a.lng
        .toString()
        .slice(0, -3)}, lat: ${a.lat.toString().slice(0, -3)}}`;
      r[locString] = r[locString] || [];
      r[locString].push(a);
      return r;
    }
    return {}
    }, Object.create(null) as { [key: string]: IListing[] });
    // console.log(result)
    const dupes = Object.values(result).find((el) => el.length > 1);
    return dupes;
  };
  const onClick = (e: any) => {
    //if map zoom is max, and still have cluster, make infowindow with multiple fetchData...
    // (tab through cards of pins that sit on top of each other)
    toggleDrawer();
  };

  const handleMouseOver = (e: any) => {
    if (mapInstance.zoom == mapInstance.maxZoom) {
      //there may be potential for this to not work as expected if multiple groups of markers closeby instead of one?
      const dupes = checkForOverlaps(fetchData);
      // e.markerclusterer.markers.length //length should equal fetchData length with close centers (within 5 sig dig)
      const clusterCenter = e.markerClusterer.clusters[0].center;
      // const clusterCenter = JSON.parse(JSON.stringify(e.markerClusterer.clusters[0].center));
      setInfoWindowPosition(clusterCenter);
      // console.log(JSON.stringify(dupes[0].location))
      dupes && setActiveData(dupes);
      dupes && toggleWindow();
    }
  };
  const handleMouseOut = () => {
    if (infoWindowPosition) {
      // setWindowPosition(null)
      toggleWindow();
    }
  };
  const {isLoaded} = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY!
  })
  return (
    // Important! Always set the container height explicitly via mapContainerClassName
    // <LoadScript
    //   id="script-loader"
    //   // googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY!}
    //   language="en"
    //   region="us"
    //   libraries={LIBRARIES}
    // >
    <>
{isLoaded ? (
      <GoogleMap
        onLoad={(map) => {
          // const bounds = new window.google.maps.LatLngBounds();
          setMapInstance(map);
        }}
        id="GMap"
        // mapContainerClassName={style.map}
        center={clientLocation || center}
        zoom={clientLocation ? 16 : zoom}
        options={options}
      >
        {/* {fetchData && (
          <MapAutoComplete
            fetchData={fetchData}
            categories={categories}
            mapInstance={mapInstance}
            selectedCategories={selectedCategories}
            setSelectedCategories={setSelectedCategories}
          />
        )} */}
        {clientLocation &&
          !fetchData &&
          toast({ title: "Searching...", status: "info" })}
        {clientLocation &&
          fetchData &&
          fetchData.length == 0 &&
          toast({ title: "No Results", status: "info" })}
        {clientLocation && fetchData && fetchData.length !== 0 && (
          <MarkerClusterer
            styles={clusterStyles}
            averageCenter
            enableRetinaIcons
            onClick={onClick}
            onMouseOver={handleMouseOver}
            onMouseOut={handleMouseOut}
            // onClick={(event) =>{console.log(event.getMarkers())}}
            gridSize={2}
            minimumClusterSize={2}
          >
            {(clusterer) =>
              fetchData.map((markerData: IListing) => {
                //return marker if element categories array includes value from selected_categories\\

                // if ( //if closeby
                // pullup.categories &&
                // pullup.categories.some((el) => selectedCategories.has(el))
                // && mapInstance.containsLocation(fetchData.location)
                // ) {yav
                // if (pullup.location) {
                //   const [lat, lng] = pullup.location.split(",");

                //   let isInside = new window.google.maps.LatLngBounds().contains(
                //     { lat: +lat, lng: +lng }
                //   );
                //   // console.log(isInside);
                // }
                return (
                  // return (
                  //   pullup.categories
                  //     ? pullup.categories.some((el) =>
                  //         selected_categories.includes(el)
                  //       )
                  //     : false
                  // ) ? (

                  <MyMarker
                    key={`${markerData.lat}${markerData.lng}`}
                    //what data can i set on marker?
                    data={markerData}
                    // label={}
                    // title={}
                    clusterer={clusterer}
                    activeData={activeData}
                    setActiveData={setActiveData}
                    setWindowClose={setWindowClose}
                    toggleWindow={toggleWindow}
                    toggleDrawer={toggleDrawer}
                  />
                );
                // }
              })
            }
          </MarkerClusterer>
        )}
        {activeData && isWindowOpen && (
          <MyInfoWindow
            activeData={activeData}
            clusterCenter={infoWindowPosition}
          />
        )}

        {activeData && isDrawerOpen && (
          <Drawer
            // activeData={activeData}
            isOpen={isDrawerOpen}
            placement="left"
            onClose={setDrawerClose}
            // mapInstance={mapInstance}
          >
            <DrawerOverlay />
            <DrawerContent>
              <DrawerCloseButton />
              <DrawerHeader>Info</DrawerHeader>
              <DrawerBody p={0}>
                {activeData.length > 1 ? (
                  <Tabs isFitted variant="enclosed">
                    <TabList>
                      {activeData.map((el, i) => (
                        <Tab key={i}>
                          <Text fontSize="sm" fontWeight="semibold">
                            {" "}
                            @userName -{" "}
                            {/* {new Date(el.timestamp).toLocaleDateString()}{" "} */}
                          </Text>
                        </Tab>
                      ))}
                    </TabList>
                    <TabPanels>
                      {activeData.map((el, i) => {
                        const { name, place_id } = el;
                        return (
                          <TabPanel
                            key={i}
                            p={0}
                            bgColor="goldenrod"
                            boxShadow="xl"
                          >
                            <Flex direction="column">
                              <Box p={1}>
                                <Text as="h2">{name}</Text>
                                {/* <InteractiveUserName userName={userName} uid={uid} /> */}
                                <Text
                                  fontWeight="semibold"
                                  fontSize=".7rem"
                                  color="gray.400"
                                >
                                  @{place_id}
                                </Text>
                              </Box>
                            </Flex>
                          </TabPanel>
                        );
                      })}
                    </TabPanels>
                  </Tabs>
                ) : (
                  <>
                    {activeData[0].place_id}
                    <InteractiveUserName
                      userName={activeData[0].name!}
                      uid={activeData[0].place_id!}
                    />
                  </>
                )}
              </DrawerBody>
            </DrawerContent>
          </Drawer>
        )}

        {/* <HeatmapLayer map={this.state.map && this.state.map} data={data.map(x => {x.location})} /> */}
      </GoogleMap>
) : null}
</>
    // </LoadScript>
  );
};

export default memo(AppMap);
