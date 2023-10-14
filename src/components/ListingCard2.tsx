import { ChevronDownIcon, ChevronUpIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  Collapse,
  Flex,
  HStack,
  IconButton,
  Image,
  Text,
} from "@chakra-ui/react";
import { IListing, PHA_LODGES } from "@util/index";
import { useState } from "react";
import { MdDirections, MdShare } from "react-icons/md";

const getLodgeName = ({
  state,
  lodgeNo,
}: {
  state: string | undefined;
  lodgeNo: number | undefined;
  //@ts-ignore
}) => state && lodgeNo && (PHA_LODGES[state] as any[lodgeNo]);

const BusinessCard = ({ activeListing }: { activeListing: IListing }) => {
  const [isOwnerInfoOpen, setIsOwnerInfoOpen] = useState(false);
  const { claims, imageUri, creator } = activeListing;
  const owner = claims?.[0].member || creator;

  const handleOwnerInfoToggle = () => {
    setIsOwnerInfoOpen(!isOwnerInfoOpen);
  };

  return (
    <Box
      maxW="md"
      mx="auto"
      borderWidth="1px"
      borderRadius="lg"
      overflow="hidden"
      boxShadow="md"
    >
      <HStack justifyContent={'center'}>
        {/* Image section */}
        <Image
          src={imageUri ? imageUri : "/img/red_marker_sm.png"}
          alt="Business Image"
        />

        {/* Business Information */}
        <Text fontWeight="bold" fontSize="lg">
          {activeListing.name}
        </Text>
      </HStack>
      <Box p="4">
        <Text fontSize="sm" color="gray.600">
          {owner?.name}
        </Text>
        <Text fontSize="sm" color="gray.600">
          {activeListing.address}
        </Text>

        {/* Owner Information Dropdown */}
        <Flex justify="space-between" align="center" mt="2">
          <Button size="sm" colorScheme="teal" onClick={handleOwnerInfoToggle}>
            Owned by {owner?.name}
          </Button>

          <IconButton
            icon={isOwnerInfoOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
            aria-label="Toggle Owner Info"
            variant="outline"
            size="sm"
            onClick={handleOwnerInfoToggle}
          />
        </Flex>

        <Collapse in={isOwnerInfoOpen} animateOpacity>
          <Box p="4" mt="2" bg="gray.100" rounded="md">
            <Text fontSize="sm" fontWeight="bold">
              Owner Information
            </Text>
            <Text fontSize="sm">{owner?.name}</Text>
            <Text fontSize="sm">
              {getLodgeName({
                state: owner?.profile.lodgeState,
                lodgeNo: owner?.profile.lodgeNumber,
              })}
            </Text>
          </Box>
        </Collapse>

        {/* Call to Action Buttons */}
        <Flex justify="space-between" align="center" mt="4">
          <Button
            leftIcon={<MdDirections />}
            colorScheme="blue"
            size="sm"
            rounded="full"
            // onClick={directions}
          >
            Get Directions
          </Button>

          <Button
            leftIcon={<MdShare />}
            colorScheme="teal"
            size="sm"
            rounded="full"
            // onClick={share}
          >
            Share Business
          </Button>
        </Flex>
      </Box>
    </Box>
  );
};

export default BusinessCard;
