import { ChevronDownIcon, ChevronUpIcon } from '@chakra-ui/icons';
import { Box, Button, Collapse, Flex, IconButton, Image, Text } from '@chakra-ui/react';
import { useState } from 'react';
import { MdDirections, MdShare } from 'react-icons/md';

const BusinessCard = ({ activeListing }) => {
  const [isOwnerInfoOpen, setIsOwnerInfoOpen] = useState(false);
  const {owner, imageUri } = activeListing
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
      {/* Image section */}
      <Image src={imageUri} alt="Business Image" />

      {/* Business Information */}
      <Box p="4">
        <Text fontWeight="bold" fontSize="lg">{activeListing}</Text>
        <Text fontSize="sm" color="gray.600">{owner.name}</Text>
        <Text fontSize="sm" color="gray.600">{owner.address}</Text>

        {/* Owner Information Dropdown */}
        <Flex justify="space-between" align="center" mt="2">
          <Button
            size="sm"
            colorScheme="teal"
            onClick={handleOwnerInfoToggle}
          >
            Owned by {owner.username}
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
            <Text fontSize="sm" fontWeight="bold">Owner Information</Text>
            <Text fontSize="sm">{owner.lodge}</Text>
            <Text fontSize="sm">{owner.name}</Text>
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
