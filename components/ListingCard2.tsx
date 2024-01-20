import { IListing, PHA_LODGES } from "@/types";
import { ChevronDownIcon, ChevronUpIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  Card,
  CardBody,
  CardFooter,
  Collapse,
  Flex,
  HStack,
  IconButton,
  Image,
  Text,
} from "@chakra-ui/react";
import { useState } from "react";
import { MdDirections, MdShare } from "react-icons/md";
import useSWR from "swr";

const getLodgeName = ({
  state,
  lodgeNo,
}: {
  state: string | undefined;
  lodgeNo: number | undefined;
}) => state && lodgeNo && PHA_LODGES[state][lodgeNo];

const BusinessCard = ({ activeListing }: { activeListing: IListing }) => {
  const [isOwnerInfoOpen, setIsOwnerInfoOpen] = useState(false);
  const { claims, imageUri, creator } = activeListing;
  const ownerID = claims?.[0].member.id || creator?.id;
  const { data: owner, error, isLoading } = useSWR(`/api/users/${ownerID}`);
  const handleOwnerInfoToggle = () => {
    setIsOwnerInfoOpen(!isOwnerInfoOpen);
  };
  return (
    <Card
      maxW="md"
      mx="auto"
      p={3}
      borderWidth="1px"
      borderRadius="lg"
      overflow="hidden"
      boxShadow="md"
    >
      {/* Image section */}
      {imageUri && <Image src={imageUri} alt="Business Image" />}

      {/* Business Information */}
      <Box>
        <CardBody>
          <Text fontWeight="bold" fontSize="lg">
            {activeListing.name}
          </Text>
          <Text fontSize="sm" color="gray.600">
            {owner?.name}
          </Text>
          <Text fontSize="sm" color="gray.600">
            {activeListing.address}
          </Text>

          {/* Owner Information Dropdown */}
          <Flex justify="space-between" align="center" mt="2">
            <Button
              size="sm"
              colorScheme="teal"
              onClick={handleOwnerInfoToggle}
            >
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
            <Box mt="2" bg="gray.100" rounded="md">
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
        </CardBody>
        <CardFooter>
          {/* Call to Action Buttons */}
          <HStack align="center" mt="4">
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
          </HStack>
        </CardFooter>
      </Box>
    </Card>
  );
};

export default BusinessCard;
