import {
  Button,
  Heading,
  Icon,
  IconButton,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverTrigger,
  Text,
  VStack,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { signIn, useSession } from "next-auth/react";
import { memo, useCallback, useEffect, useState } from "react";
import { IconType } from "react-icons";
import { BiMessageAltAdd } from "react-icons/bi";
import { MdMyLocation } from "react-icons/md";
import { GLocation, ILocateMe } from "../types";
import { milesToMeters, targetClient } from "../util/helpers";
import AddListingForm from "./AddListingForm";

const FloatingButtons = (props: ILocateMe) => {
  // const [clientLocation, setClientLocation] = useState(null); //hoisted
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [closestMarker, setClosestMarker] = useState({} as google.maps.Marker);
  const [geoWatchId, setGeoWatchId] = useState(0);
  const [clientMarker, setClientMarker] = useState({} as google.maps.Marker);
  const [toggleDisplay, setToggleDisplay] = useState(false);
  const { data: session, status } = useSession();
  const { mapInstance, setClientLocation, clientLocation } = props;

  useEffect(() => {
    //pan map to new center every new lat/long
    //do nothing, then cleanup
    return () => {
      if (geoWatchId) {
        window.navigator.geolocation.clearWatch(geoWatchId);
      }
    };
  }, [geoWatchId, clientLocation]);

  const searchingToast = useToast({
    colorScheme: "yellow",
    status: "info",
    title: "User Location:",
    description: `Searching...`,
  });

  const handleGetLocation = useCallback(() => {
    // const googleWindow: typeof google = (window as any).google;
    //when clicked, find users location. keep finding every x minutes or as position changes. if position doesn't change after x minutes. turn off
    //zoom to position
    //calculate closest listing(s)
    //when user clicks again, turn tracking off.
    let oldMarker: google.maps.Marker;
    if (!geoWatchId || !clientLocation) {
      searchingToast();
      const location = window.navigator && window.navigator.geolocation;
      if (location) {
        const watchId = location.watchPosition(
          (position) => {
            const positionObject: GLocation = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            };

            if (Object.keys(clientMarker).length == 0) {
              let marker = new google.maps.Marker({
                position: new google.maps.LatLng(positionObject),
                map: mapInstance,
                icon: { url: "/img/orange_dot_sm_2.png" },
                title: "My Location",
                // animation: googleWindow.maps.Animation.BOUNCE,
              });
              const clientRadius = new google.maps.Circle({
                map: mapInstance as google.maps.Map,
                center: new google.maps.LatLng(positionObject),
                radius: milesToMeters(5),
                strokeColor: "#FF7733",
                strokeOpacity: 0.2,
                strokeWeight: 2,
                fillColor: "#FFAA00",
                fillOpacity: 0.1,
              });
              setClientMarker(marker);
            } else {
              //MARKER EXISTS, SO WE MOVE IT TO NEW POSITION.
              clientMarker.setMap(mapInstance);
              clientMarker.setPosition(positionObject);
            }
            setClientLocation(positionObject);
            targetClient(mapInstance, positionObject);

            if (!closestMarker) {
              //where are all the markers coming from?
              // setClosestListing(findClosestMarker(fetchData, positionObject));
            } else {
              // IN order to change the marker background i need the marker. in the old app an array of markers were stored in redux state
              if (oldMarker !== closestMarker) {
                // set old marker icon
                //   url: "img/map/orange_marker_sm.png",
                // console.log("change color of marker")
                console.log("changing markers..." + closestMarker);
              } else {
                // set closest marker icon
                //   url: "img/map/red_marker_sm.png",
                oldMarker = closestMarker;
              }
            }
          },
          (error) => {
            console.warn(error);
            setClientLocation({
              latitude: null,
              longitude: null,
            });
          },
          {
            enableHighAccuracy: true,
            // timeout: 5000,
            maximumAge: 0,
          }
        );
        setGeoWatchId(watchId);
      } else {
        console.log("geolocation is not available");
      }
    }
    //center marker in window
    clientLocation && targetClient(mapInstance, clientLocation);
    //toggle some view
    !toggleDisplay ? setToggleDisplay(true) : setToggleDisplay(false);
  }, [
    clientLocation,
    clientMarker,
    closestMarker,
    geoWatchId,
    mapInstance,
    searchingToast,
    setClientLocation,
    toggleDisplay,
  ]);

  const handleOpen = useCallback(() => {
    handleGetLocation();
    onOpen();
  }, [handleGetLocation, onOpen]);
  return (
    <>
      <VStack position="absolute" top="50%" right="10px">
        <FloatingPopoverButton
          colorScheme={"mwphgldc.purple"}
          icon={BiMessageAltAdd}
          handleClick={onOpen}
          popOverText={"Add A Business!"}
        />
        <FloatingPopoverButton
          colorScheme={clientLocation ? "mwphgldc.purple" : "mwphgldc.gold"}
          handleClick={handleGetLocation}
          icon={MdMyLocation}
          popOverText={
            clientLocation ? "Pinpoint Location" : "Find My Location"
          }
        />
      </VStack>

      <Modal isOpen={isOpen} onClose={onClose} closeOnOverlayClick={true}>
        <ModalOverlay />
        <ModalContent>
          {status == "authenticated" ? (
            <>
              <ModalHeader>
                <Text fontSize="2xl">Add Listing:</Text>
              </ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                <AddListingForm onDrawerClose={onClose} />
              </ModalBody>
            </>
          ) : (
            <VStack padding="22">
              <Heading textAlign="center" size="lg">
                Sign In to Add Your Business
              </Heading>
              <Button onClick={() => signIn()}>Sign In</Button>
            </VStack>
          )}
        </ModalContent>
      </Modal>

      {/* {(closestListing && toggleDisplay) && <ClosestList closestListing={closestListing}/>} */}
      {/* {(closestListing && toggleDisplay) && <ClosestCard closestListing={closestListing}/>} */}
    </>
  );
};

export default memo(FloatingButtons);
function FloatingPopoverButton({
  colorScheme,
  popOverText,
  icon,
  handleClick,
}: {
  colorScheme: string;
  popOverText: string;
  icon: IconType;
  handleClick?: () => void;
}) {
  return (
    <Popover trigger="hover" placement="left" closeOnBlur={true}>
      <PopoverTrigger>
        <IconButton
          borderRadius="50%"
          aria-label="My Location"
          onClick={handleClick}
          colorScheme={colorScheme}
        >
          <Icon as={icon} />
        </IconButton>
      </PopoverTrigger>
      <PopoverContent width={"11em"}>
        <PopoverArrow />
        <PopoverCloseButton />
        <PopoverBody>{popOverText}</PopoverBody>
      </PopoverContent>
    </Popover>
  );
}
