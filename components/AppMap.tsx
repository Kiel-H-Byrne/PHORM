"use client";

import { memo, useCallback, useEffect, useRef, useState } from "react";

import fetcher from "@/util/fetch";
import { findClosestMarker } from "@/utils/helpers";
import {
  Button,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  Icon,
  IconButton,
  Progress,
  SlideOptions,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  Tooltip,
  createStandaloneToast,
  useBreakpointValue,
  useDisclosure,
} from "@chakra-ui/react";
import {
  GoogleMap,
  MarkerClusterer,
  useJsApiLoader,
} from "@react-google-maps/api";
import { Clusterer, MarkerExtended } from "@react-google-maps/marker-clusterer";
import { FaDirections, FaHeart, FaShare } from "react-icons/fa";
import { MdInfoOutline, MdMyLocation } from "react-icons/md";
import SWR from "swr";
import { IAppMap, IListing } from "../types";
import { CLUSTER_STYLE, GEOCENTER, MAP_STYLES } from "../util/constants";
import { MyInfoWindow, MyMarker } from "./";
import ListingCard from "./ListingCard";
import MapSearch from "./MapSearch";

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

const WASHINGTON_DC = { lat: 38.9072, lng: -77.0369 };

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
  // We'll use the position of the first marker in activeData for the info window
  const [activeData, setActiveData] = useState(
    [] as IListing[] & MarkerExtended[]
  );
  const [mapRef, setMapRef] = useState<google.maps.Map | null>(null);
  const [selectedListing, setSelectedListing] = useState<IListing | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);

  const { data: fetchData } = SWR(uri, fetcher, {
    loadingTimeout: 1000,
    errorRetryCount: 2,
    revalidateOnFocus: false,
  });

  const { toast } = createStandaloneToast();

  // Handle map load
  const handleMapLoad = useCallback(
    (map: google.maps.Map) => {
      setMapRef(map);
      setMapInstance(map);
    },
    [setMapInstance]
  );

  // Handle listing selection from search
  const handleSelectListing = useCallback(
    (listing: IListing) => {
      setSelectedListing(listing);
      setActiveData([listing as IListing & MarkerExtended]);
      toggleDrawer();
    },
    [toggleDrawer]
  );

  // Handle favorite toggle
  const handleFavoriteToggle = useCallback(() => {
    setIsFavorite(!isFavorite);
    toast({
      title: isFavorite ? "Removed from favorites" : "Added to favorites",
      status: "success",
      duration: 2000,
      isClosable: true,
    });
  }, [isFavorite, toast]);

  // Handle share
  const handleShare = useCallback(() => {
    if (selectedListing) {
      if (navigator.share) {
        navigator
          .share({
            title: selectedListing.name,
            text: `Check out ${selectedListing.name} on PHORM!`,
            url: `${window.location.origin}/listing/${selectedListing.place_id}`,
          })
          .catch(console.error);
      } else {
        // Fallback for browsers that don't support navigator.share
        navigator.clipboard.writeText(
          `${window.location.origin}/listing/${selectedListing.place_id}`
        );
        toast({
          title: "Link copied to clipboard",
          status: "success",
          duration: 2000,
          isClosable: true,
        });
      }
    }
  }, [selectedListing, toast]);

  // Handle get directions
  const handleGetDirections = useCallback(() => {
    if (selectedListing?.lat && selectedListing?.lng) {
      window.open(
        `https://www.google.com/maps/dir/?api=1&destination=${selectedListing.lat},${selectedListing.lng}`,
        "_blank"
      );
    } else if (selectedListing?.address) {
      window.open(
        `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          selectedListing.address
        )}`,
        "_blank"
      );
    }
  }, [selectedListing]);

  // Update selected listing when active data changes
  useEffect(() => {
    if (activeData && activeData.length > 0) {
      setSelectedListing(activeData[0]);
    }
  }, [activeData]);

  const useRenderMarkers: (clusterer: Clusterer) => React.ReactElement =
    useCallback(
      (clusterer) => {
        return (
          isLoaded &&
          fetchData?.listings &&
          fetchData.listings.map((markerData: IListing) => {
            const { lat, lng } = markerData;
            return (
              lat &&
              lng && (
                <MyMarker
                  key={`${lat}, ${lng}-${markerData.name}`}
                  markerData={markerData}
                  clusterer={clusterer}
                  activeData={activeData}
                  setActiveData={setActiveData}
                  setWindowClosed={setWindowClosed}
                  setWindowOpen={setWindowOpen}
                  toggleDrawer={toggleDrawer}
                />
              )
            );
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

  // Handle cluster click
  const handleClickCluster = useCallback(() => {
    setWindowClosed();
  }, [setWindowClosed]);
  const responsivePlacement: SlideOptions["direction"] =
    useBreakpointValue({ base: "bottom", md: "left" }) || "left";

  const handleLocateMe = () => {
    if (!mapRef || !navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userPos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setUserLocation(userPos);
        mapRef.panTo(userPos);
        mapRef.setZoom(15);

        // Find and highlight closest marker
        if (fetchData?.listings.length > 0) {
          const closest = findClosestMarker(userPos, fetchData.listings);
          setSelectedListing(closest);
          setActiveData([closest as IListing & MarkerExtended]);
          toggleDrawer();
        }
      },
      (error) => {
        console.error("Error getting location:", error);
      }
    );
  };

  return isLoaded ? (
    <>
      <GoogleMap
        onLoad={handleMapLoad}
        id="GMap"
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
        {/* Map Search Component */}
        <MapSearch onSelectListing={handleSelectListing} mapInstance={mapRef} />
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
        {isLoaded && fetchData?.listings && fetchData.listings.length > 0 ? (
          <MarkerClusterer
            styles={CLUSTER_STYLE}
            averageCenter
            enableRetinaIcons
            onClick={handleClickCluster}
            gridSize={2}
            minimumClusterSize={2}
          >
            {useRenderMarkers}
          </MarkerClusterer>
        ) : null}

        {activeData && activeData.length > 0 && isWindowOpen && (
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
              <DrawerBody p={3} alignSelf="center" overflowY="auto">
                {activeData.length > 1 ? (
                  <Tabs isFitted variant="enclosed">
                    <TabList>
                      {activeData.map((listing, i) => (
                        <Tab key={i}>
                          <Text fontSize="sm" fontWeight="semibold">
                            {listing.name || "Listing"}
                          </Text>
                        </Tab>
                      ))}
                    </TabList>
                    <TabPanels>
                      {activeData.map((listing, i) => {
                        return (
                          <TabPanel
                            key={i}
                            p={0}
                            bgColor="white"
                            boxShadow="md"
                          >
                            <ListingCard
                              activeListing={listing}
                              showActions={false}
                            />
                          </TabPanel>
                        );
                      })}
                    </TabPanels>
                  </Tabs>
                ) : (
                  <ListingCard
                    activeListing={activeData[0]}
                    showActions={false}
                  />
                )}
              </DrawerBody>
              <DrawerFooter borderTopWidth="1px" p={3}>
                <Flex width="100%" justifyContent="space-between">
                  <Button
                    leftIcon={<Icon as={FaDirections} />}
                    colorScheme="blue"
                    size="sm"
                    onClick={handleGetDirections}
                    flex={1}
                    mr={2}
                  >
                    Directions
                  </Button>
                  <Button
                    leftIcon={<Icon as={FaHeart} />}
                    colorScheme={isFavorite ? "red" : "gray"}
                    variant={isFavorite ? "solid" : "outline"}
                    size="sm"
                    onClick={handleFavoriteToggle}
                    flex={1}
                    mr={2}
                  >
                    {isFavorite ? "Saved" : "Save"}
                  </Button>
                  <Button
                    leftIcon={<Icon as={FaShare} />}
                    colorScheme="gray"
                    size="sm"
                    onClick={handleShare}
                    flex={1}
                  >
                    Share
                  </Button>
                </Flex>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>
        )}

        {/* <HeatmapLayer map={this.state.map && this.state.map} data={data.map(x => {x.location})} /> */}
      </GoogleMap>
      <Tooltip label="Locate me">
        <IconButton
          aria-label="Get my location"
          icon={<MdMyLocation />}
          position="absolute"
          bottom={4}
          right={4}
          colorScheme="blue"
          onClick={handleLocateMe}
        />
      </Tooltip>
      {/* 100% - header hight + footer height */}
      {/* <Flex style={{ height: "calc(100% - 106px)" }} /> */}
    </>
  ) : (
    <Progress />
  );
};

export default memo(AppMap);
