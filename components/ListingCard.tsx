import { IClaims, IListing } from "@/types";
import { Box, Button, Collapse, Heading, Text } from "@chakra-ui/react";
import { useState } from "react";

const ListingCard = ({ activeListing }: { activeListing: IListing }) => {
  const [isOpen, setIsOpen] = useState(false);
  const toggleCollapse = () => {
    setIsOpen(!isOpen);
  };
  const {
    name,
    address,
    description,
    claims,
    imageUri = "https://picsum.photos/640/360",
  } = activeListing;
  const getLikelyOwnerInfo = (claims: IClaims) => claims[0];
  const ownerInfo = claims && getLikelyOwnerInfo(claims);
  return (
    <Box
      bg="rgba(0, 0, 0, 0.6)"
      bgImage={imageUri}
      backgroundSize={"cover"}
      backgroundBlendMode={"multiply"}
      borderWidth="1px"
      borderRadius="lg"
      boxShadow="lg"
      p={4}
      maxW="400px"
    >
      <Box position="relative">
        <Box color="white" p={4}>
          <Heading fontSize="2xl" mt={2}>
            {name}
          </Heading>
          <Text fontSize="sm">{address}</Text>
          <Text fontSize="md" mt={2}>
            {description}
          </Text>
          {ownerInfo && (
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
          )}
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
