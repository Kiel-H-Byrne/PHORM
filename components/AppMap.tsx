import { memo, useCallback, useState } from "react";

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
import {
  GoogleMap,
  MarkerClusterer,
  useJsApiLoader,
} from "@react-google-maps/api";
import { Clusterer } from "@react-google-maps/marker-clusterer";
import SWR from "swr";
import { GLocation, IAppMap, IListing } from "../types";
import { CLUSTER_STYLE, GEOCENTER, MAP_STYLES } from "../util/constants";
import { MyInfoWindow, MyMarker } from "./";
import { InteractiveUserName } from "./InteractiveUserName";

export const default_props = {
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

const AppMap = ({ client_location, setMapInstance, mapInstance }: IAppMap) => {
  let { center, zoom, options } = default_props;
  const uri = client_location
    ? `api/listings?lat=${client_location.lat}&lng=${client_location.lng}`
    : "api/listings";

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

  const { data: fetchData, error } = SWR(uri, fetcher, {
    loadingTimeout: 1000,
    errorRetryCount: 2,
  });

  const toast = useToast();

  const useRenderMarkers: (clusterer: Clusterer) => React.ReactElement =
    useCallback(
      (clusterer) =>
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
        }),
      [fetchData, activeData, setWindowClose, toggleDrawer, toggleWindow]
    );

  //clusterer needs to return one element?
  const checkForOverlaps = useCallback((data: IListing[]) => {
    const result: { [key: string]: IListing[] } = data.reduce((r, a) => {
      if (a.lng && a.lat) {
        const locString = `{lng: ${a.lng.toString().slice(0, -3)}, lat: ${a.lat
          .toString()
          .slice(0, -3)}}`;
        r[locString] = r[locString] || [];
        r[locString].push(a);
        return r;
      }
      return {};
    }, Object.create(null) as { [key: string]: IListing[] });
    // console.log(result)
    const dupes = Object.values(result).find((el) => el.length > 1);
    return dupes;
  }, []);

  const onClick = useCallback(
    (e: any) => {
      //if map zoom is max, and still have cluster, make infowindow with multiple fetchData...
      // (tab through cards of pins that sit on top of each other)
      toggleDrawer();
    },
    [toggleDrawer]
  );

  const handleMouseOver = useCallback(
    (e: any) => {
      if (fetchData && (mapInstance.zoom == mapInstance.maxZoom)) {
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
    },
    [checkForOverlaps, fetchData, mapInstance, toggleWindow]
  );
  const handleMouseOut = useCallback(() => {
    if (infoWindowPosition) {
      // setWindowPosition(null)
      toggleWindow();
    }
  }, [toggleWindow, infoWindowPosition]);
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY!,
  });
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
          mapContainerStyle={{
            position: "absolute",
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
          }}
          center={client_location || center}
          zoom={client_location ? 16 : zoom}
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
          {!fetchData && toast({ title: "Searching Area...", status: "info" })}
          {fetchData &&
            fetchData.length == 0 &&
            toast({ title: "No Results", status: "info" })}
          {fetchData && fetchData.length !== 0 && (
            <MarkerClusterer
              styles={CLUSTER_STYLE}
              averageCenter
              enableRetinaIcons
              onClick={onClick}
              onMouseOver={handleMouseOver}
              onMouseOut={handleMouseOut}
              // onClick={(event) =>{console.log(event.getMarkers())}}
              gridSize={2}
              minimumClusterSize={2}
            >
              {useRenderMarkers}
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
