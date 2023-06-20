import { Button, Center, Icon, IconButton, Modal, ModalBody, ModalCloseButton, ModalContent, ModalHeader, ModalOverlay, Text, useDisclosure } from '@chakra-ui/react';
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { GLocation } from '../types';
import { findClosestMarker, targetClient } from '../util/helpers';
import { MdMyLocation } from 'react-icons/md'
import { BiMapPin, BiMessageAltAdd } from 'react-icons/bi';
import { signIn, useSession } from 'next-auth/client';
import { PullUpForm } from './PullUpForm';

interface Props {
  mapInstance: google.maps.Map | google.maps.StreetViewPanorama;
  setClientLocation: any //a usestate fxn returning {latlng};
  clientLocation: GLocation
}

export const LocateMeButton = (props: Props) => {
  // const [clientLocation, setClientLocation] = useState(null); //hoisted 
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [closestListing, setClosestListing] = useState(null);
  const [geoWatchId, setGeoWatchId] = useState(0);
  const [clientMarker, setClientMarker] = useState(null);
  const [toggleDisplay, setToggleDisplay] = useState(false);
  const [session, loading] = useSession();
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
  const handleClick = () => {
    const googleWindow: typeof google = (window as any).google;
    //when clicked, find users location. keep finding every x minutes or as position changes. if position doesn't change after x minutes. turn off
    //zoom to position
    //calculate closest listing(s)
    //when user clicks again, turn tracking off.
    let oldMarker: google.maps.Marker;
    if (!geoWatchId && !clientLocation) {
      const location = window.navigator && window.navigator.geolocation;
      if (location) {
        const watchId = location.watchPosition(
          (position) => {
            const positionObject: GLocation = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            };

            if (!clientMarker) {
              let marker = new googleWindow.maps.Marker({
                position: new googleWindow.maps.LatLng(positionObject),
                map: mapInstance,
                icon: { url: "/img/orange_dot_sm_2.png" },
                title: "My Location",
                // animation: googleWindow.maps.Animation.BOUNCE,
              });
              const clientRadius = new googleWindow.maps.Circle({
                map: mapInstance as google.maps.Map,
                center: new googleWindow.maps.LatLng(positionObject),
                radius: 2 * 1609.34,
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

            if (!closestListing) {
              setClosestListing(findClosestMarker([], positionObject));
            } else {
              // IN order to change the marker background i need the marker. in the old app an array of markers were stored in redux state
              if (oldMarker !== closestListing) {
                // set old marker icon
                //   url: "img/map/orange_marker_sm.png",
                // console.log("change color of marker")
                console.log("changing markers..." + closestListing);
              } else {
                // set closest marker icon
                //   url: "img/map/red_marker_sm.png",
                oldMarker = closestListing;
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
  };
  const handleOpen =() => {
    handleClick()
    onOpen()
  }
  return (
    <>
      <IconButton
        position="absolute"
        bottom="7rem"
        right="10px"
        borderRadius="50%"
        color={clientLocation ? "secondary" : "default"}
        // className={`${classes.root} ${clientLocation && classes.hasLocation}` }
        aria-label="My Location"
        onClick={handleClick}
        bgColor={clientLocation ? "green" : "red"}
      >
        <Icon as={MdMyLocation} />
      </IconButton>
      <IconButton
        position="absolute"
        bottom="10rem"
        right="10px"
        borderRadius="50%"
        colorScheme="yellow"
        aria-label="Add PullUp"
        onClick={handleOpen}
      >
        <Icon as={BiMessageAltAdd} />
      </IconButton>
      <Modal isOpen={isOpen} onClose={onClose} closeOnOverlayClick={false}>
        <ModalOverlay />
        <ModalContent>
          {!loading && session ? (
            <>
              <ModalHeader>
                <Text fontSize="2xl">Pull Up!</Text>
                <Text fontSize="xx-small" fontColor="grey">
                  <Icon as={BiMapPin} /> @{clientLocation?.lat},
                  {clientLocation?.lng}
                </Text>
              </ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                <PullUpForm
                  onClose={onClose}
                  locationData={clientLocation}
                  uid={session.id as string}
                  userName={session.user.name}
                />
              </ModalBody>
            </>
          ) : (
            <Center padding="22">
              <Button onClick={() => signIn()}>Register / Log In</Button>
            </Center>
          )}
        </ModalContent>
      </Modal>

      {/* {(closestListing && toggleDisplay) && <ClosestList closestListing={closestListing}/>} */}
      {/* {(closestListing && toggleDisplay) && <ClosestCard closestListing={closestListing}/>} */}
    </>
  );
}
