import { IClaims, IListing } from "@/types";
import { Box, Button, Collapse, Heading, Image, Text } from "@chakra-ui/react";
import { useState } from "react";

const ListingCard = ({ activeListing }: { activeListing: IListing }) => {
  const [isOpen, setIsOpen] = useState(false);
  const toggleCollapse = () => {
    setIsOpen(!isOpen);
  };
  const { name, address, description, claims, imageUri } = activeListing;
  const getLikelyOwnerInfo = (claims: IClaims) => claims[0];
  const ownerInfo = claims && getLikelyOwnerInfo(claims);
  return (
    <Box
      borderWidth="1px"
      borderRadius="lg"
      overflow="hidden"
      boxShadow="lg"
      p={4}
      maxW="400px"
    >
      <Box position="relative">
        {imageUri && <Image src={imageUri} alt={name} h="200px" w="100%" objectFit="cover" />}
        <Box
          position="absolute"
          bottom="0"
          left="0"
          right="0"
          bg="rgba(0, 0, 0, 0.6)"
          color="white"
          p={4}
        >
          <Text fontSize="sm">{address}</Text>
          <Heading fontSize="2xl" mt={2}>
            {name}
          </Heading>
          <Text fontSize="md" mt={2}>
            {description}
          </Text>
          <Box mt={4}>
            <Button size="sm" variant="ghost" onClick={toggleCollapse}>
              Owned by {ownerInfo?.member.name}
            </Button>
            <Collapse in={isOpen} animateOpacity>
              <Box mt={2} p={2} bg="gray.100">
                {/* Additional owner information */}
              </Box>
            </Collapse>
          </Box>
        </Box>
      </Box>
      <Box mt={4}>
        <Button colorScheme="blue" size="sm" mr={2}>
          Get Directions
        </Button>
        <Button colorScheme="blue" size="sm">
          Share
        </Button>
        {/* Additional CTA buttons */}
      </Box>
    </Box>
  );
};

export default ListingCard;
