import { AppMap } from "@/components";
import Contractors from "@/components/Contractors";
import OnlineListings from "@/components/OnlineListings";
import { Box, Button, Heading, Text, VStack } from "@chakra-ui/react";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { MdEmojiTransportation, MdShoppingCart } from "react-icons/md";
import { TbMapPin2 } from "react-icons/tb";
const IndexPage = () => {
  const [clientLocation, setClientLocation] = useState(null);
  const [mapInstance, setMapInstance] = useState({} as google.maps.Map);

  const params = useSearchParams();
  const viewType = params?.get("viewType");

  // return viewType === "list" ? (
  //   <AppList />
  // ) : (
  //   <>
  //     <AppMap
  //       client_location={clientLocation}
  //       mapInstance={mapInstance}
  //       setMapInstance={setMapInstance}
  //     />
  //     <LocateMeButton
  //       mapInstance={mapInstance}
  //       clientLocation={clientLocation}
  //       setClientLocation={setClientLocation}
  //     />
  //   </>
  // );
  //a home page for this app
  return (
    <Box>
      {/* Above-the-fold image */}
      <Box
        width={"full"}
        height={"300px"}
        backgroundImage={"img/phorm-banner.png"}
        backgroundPosition={"bottom"}
      />

      <Box mx="auto" px="4">
        {/* Description */}
        <VStack spacing="8">
          <Heading as="h1" fontSize="3xl" textAlign="center" py={3}>
            Welcome to The P.H.O.R.M
          </Heading>
          <Text fontSize="lg" textAlign="center">
            The Prince Hall Online Registry of Merchants is your go-to platform
            for finding physical retail locations, independent contractors, and
            online businesses owned by members of Prince Hall Freemasonry &
            affiliated organizations.
          </Text>
        </VStack>

        {/* Section for Google Map */}
        <Box mt="8">
          <Heading as="h2" fontSize="2xl" textAlign={"center"} py={3}>
            Physical Retail Locations
          </Heading>
          <Text as={"p"} m={"auto"} p={3}>
            Browse the Brick & Mortar locations of businesses owned (or managed)
            by PHAmily.
          </Text>
          <Box
            position="relative"
            height={"500px"}
            width={"full"}
            border={"1px solid black"}
            borderRadius={"md"}
            p={5}
          >
            <AppMap
              client_location={clientLocation}
              mapInstance={mapInstance}
              setMapInstance={setMapInstance}
            />
            <Button
              position="absolute"
              aria-label="View Map"
              right="10"
              top="50%"
              variant="solid"
              colorScheme="mwphgldc.blue"
              size="lg"
              rightIcon={<TbMapPin2 />}
            >
              View Map
            </Button>
          </Box>
        </Box>

        {/* Section for Service Professionals */}
        <Box mt="8">
          <Heading as="h2" fontSize="2xl" mb="2" textAlign={"center"} py={3}>
            Service Professionals
          </Heading>
          {/* Gallery of service professionals */}

          <Box
            height={"300px"}
            position={"relative"}
            border={"1px solid black"}
            borderRadius={"md"}
            p={5}
          >
            <Contractors radius={10} />
            <Button
              position={"absolute"}
              top={"50%"}
              right={10}
              variant="solid"
              size="lg"
              rightIcon={<MdEmojiTransportation />}
            >
              View Service Professionals
            </Button>
          </Box>
        </Box>

        {/* Section for Online Businesses */}
        <Box mt="8">
          <Heading as="h2" fontSize="2xl" mb="2" py={3} textAlign={"center"}>
            Online Businesses
          </Heading>
          <Box
            height={"300px"}
            position={"relative"}
            border={"1px solid black"}
            borderRadius={"md"}
            p={5}
          >
            <OnlineListings />
            <Button
              float="right"
              variant="solid"
              size="lg"
              position={"absolute"}
              top={"50%"}
              right={10}
              rightIcon={<MdShoppingCart />}
            >
              View Online Businesses
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default IndexPage;
