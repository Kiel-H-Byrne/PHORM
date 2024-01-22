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
  Icon,
  Progress,
  SlideOptions,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  createStandaloneToast,
  useBreakpointValue,
  useDisclosure,
} from "@chakra-ui/react";
import {
  GoogleMap,
  MarkerClusterer,
  useJsApiLoader,
} from "@react-google-maps/api";
import {
  Cluster,
  Clusterer,
  MarkerExtended,
} from "@react-google-maps/marker-clusterer";
import { MdInfoOutline } from "react-icons/md";
import SWR from "swr";
import { GLocation, IAppMap, IListing } from "../types";
import { CLUSTER_STYLE, GEOCENTER, MAP_STYLES } from "../util/constants";
import { MyInfoWindow, MyMarker } from "./";
import ListingCard from "./ListingCard";

export const default_props = {
  center: GEOCENTER,
  // 11 is metro area level
  zoom: 11,
  options: {
    // mapTypeId:google.maps.MapTypeId.TERRAIN,
    backgroundColor: "#555",
    clickableIcons: false,
    disableDefaultUI: true,
    fullscreenControl: false,
    zoomControl: true,
    // zoomControlOptions: {
    //   position: google.maps.ControlPosition.RIGHT_CENTER,
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
    minZoom: 4,
    // Map styles; snippets from 'Snazzy Maps'.
    styles: MAP_STYLES.whiteMono,
  },
};

const AppMap = ({ client_location, setMapInstance }: IAppMap) => {
  let { center, zoom, options } = default_props;
  const uri = client_location
    ? `api/listings?lat=${client_location.lat}&lng=${client_location.lng}`
    : "api/listings";

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY!,
  });

  const {
    isOpen: isDrawerOpen,
    onOpen: toggleDrawer,
    onClose: setDrawerClose,
  } = useDisclosure();
  const {
    isOpen: isWindowOpen,
    onOpen: setWindowOpen,
    onClose: setWindowClosed,
  } = useDisclosure();
  const [infoWindowPosition, setInfoWindowPosition] = useState(
    null as GLocation | null
  );
  const [activeData, setActiveData] = useState(
    [] as IListing[] & MarkerExtended[]
  );
  const { data: fetchData, error } = SWR(uri, fetcher, {
    loadingTimeout: 1000,
    errorRetryCount: 2,
  });

  const { ToastContainer, toast } = createStandaloneToast();

  const useRenderMarkers: (clusterer: Clusterer) => React.ReactElement =
    useCallback(
      (clusterer) => {
        return (
          isLoaded &&
          fetchData &&
          fetchData.map((markerData: IListing) => {
            const { lat, lng } = markerData;
            return (
              lat &&
              lng && (
                <MyMarker
                  key={`${lat}, ${lng}-${markerData.name}`}
                  //what data can i set on marker?
                  markerData={markerData}
                  // label={}
                  // title={}
                  clusterer={clusterer}
                  activeData={activeData}
                  setActiveData={setActiveData}
                  setWindowClosed={setWindowClosed}
                  setWindowOpen={setWindowOpen}
                  toggleDrawer={toggleDrawer}
                />
              )
            );
            // }
          })
        );
      },
      [
        fetchData,
        activeData,
        setWindowClosed,
        toggleDrawer,
        setWindowOpen,
        isLoaded,
      ]
    );

  const handleMouseOverClusterOrMarker = useCallback(
    (e: Cluster) => {
      // detect mouse or touch event, then handle display or not
      // if mouse hover, show infowindow. if click & touch, open drawer
      // or if mouse hover, show infowindow, if mouse click show drawer. if touch once, show infowindow, if touch while infowdindow open, show drawer.
      const { center, getMarkers } = e;
      const clusterMarkers = getMarkers();
      if (center && center.lat() && center.lng()) {
        const centerTuple = { lat: center?.lat(), lng: center?.lng() };
        center && setInfoWindowPosition(centerTuple);
      }
      setActiveData(clusterMarkers);
      setWindowOpen();
    },
    [setWindowOpen]
  );

  const handleMouseOutClusterOrMarker = useCallback(() => {
    if (infoWindowPosition) {
      setInfoWindowPosition(null);
      setWindowClosed();
    }
  }, [setWindowClosed, infoWindowPosition]);

  const handleClickCluster = useCallback(() => {
    setWindowClosed();
  }, [setWindowClosed]);
  const searchToastData = {
    title: "Searching Area...",
    status: "loading" as any,
    id: "searching-toast",
  };
  const noResultsToastData = {
    title: "No Results",
    status: "info" as any,
    id: "noresults-toast",
  };
  const responsivePlacement: SlideOptions["direction"] =
    useBreakpointValue({ base: "bottom", md: "left" }) || "left";
  return isLoaded ? (
    <>
      <GoogleMap
        onLoad={(map) => {
          // const bounds = new window.google.maps.LatLngBounds();
          setMapInstance(map);
        }}
        id="GMap"
        // mapContainerClassName={style.map}
        mapContainerStyle={{
          position: "absolute",
          height: "calc(100% - 106px)",
          top: "64px",
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
        {/* {!fetchData && toast(searchToastData)} */}
        {isLoaded && fetchData?.length !== 0 ? (
          <MarkerClusterer
            styles={CLUSTER_STYLE}
            averageCenter
            enableRetinaIcons
            onClick={handleClickCluster}
            // onMouseOver={handleMouseOutClusterOrMarker}
            // onMouseOut={handleMouseOutClusterOrMarker}
            gridSize={2}
            minimumClusterSize={2}
          >
            {useRenderMarkers}
          </MarkerClusterer>
        ) : null}

        {activeData && isWindowOpen && (
          <MyInfoWindow
            activeData={activeData}
            position={{ lat: activeData[0]?.lat!, lng: activeData[0]?.lng! }}
          />
        )}

        {activeData && (
          <Drawer
            // activeData={activeData}
            isOpen={isDrawerOpen}
            placement={responsivePlacement}
            onClose={setDrawerClose}
            // mapInstance={mapInstance}
          >
            <DrawerOverlay />
            <DrawerContent>
              <DrawerCloseButton />
              <DrawerHeader bgColor={"gray.200"} pl={1} display={"flex"}>
                {" "}
                <Icon boxSize={7} mx={2} as={MdInfoOutline} />
                Listing Information
              </DrawerHeader>
              <DrawerBody p={3} alignSelf="center">
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
                  <ListingCard activeListing={activeData[0]} />
                )}
              </DrawerBody>
            </DrawerContent>
          </Drawer>
        )}

        {/* <HeatmapLayer map={this.state.map && this.state.map} data={data.map(x => {x.location})} /> */}
      </GoogleMap>
      {/* 100% - header hight + footer height */}
      {/* <Flex style={{ height: "calc(100% - 106px)" }} /> */}
    </>
  ) : (
    <Progress />
  );
};

export default memo(AppMap);
