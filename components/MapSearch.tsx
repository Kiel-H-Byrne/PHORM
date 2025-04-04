import { searchListings } from "@/db/listings";
import { IListing } from "@/types";
import {
  Box,
  Button,
  Flex,
  Icon,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  List,
  ListItem,
  Popover,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
  Spinner,
  Text,
  useDisclosure,
} from "@chakra-ui/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { FaMapMarkerAlt, FaSearch, FaTimes } from "react-icons/fa";

interface MapSearchProps {
  onSelectListing: (listing: IListing) => void;
  mapInstance?: google.maps.Map | null;
}

const MapSearch = ({ onSelectListing, mapInstance }: MapSearchProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<IListing[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Debounced search function
  const handleSearch = useCallback(
    async (term: string) => {
      if (!term || term.length < 2) {
        setResults([]);
        return;
      }

      setIsLoading(true);
      try {
        const searchResults = await searchListings(term, 5);
        setResults(searchResults);
        if (searchResults.length > 0) {
          onOpen();
        }
      } catch (error) {
        console.error("Error searching listings:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [onOpen]
  );

  // Handle input change with debounce
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setSearchTerm(value);

      // Clear previous timeout
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }

      // Set new timeout
      searchTimeoutRef.current = setTimeout(() => {
        handleSearch(value);
      }, 500); // 500ms debounce
    },
    [handleSearch]
  );

  // Clear search
  const handleClearSearch = useCallback(() => {
    setSearchTerm("");
    setResults([]);
    onClose();
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [onClose]);

  // Handle listing selection
  const handleSelectListing = useCallback(
    (listing: IListing) => {
      onSelectListing(listing);
      onClose();

      // Center map on selected listing if map instance is available
      if (mapInstance && listing.lat && listing.lng) {
        mapInstance.panTo({ lat: listing.lat, lng: listing.lng });
        mapInstance.setZoom(16); // Zoom in
      }
    },
    [mapInstance, onClose, onSelectListing]
  );

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  return (
    <Box
      position="absolute"
      top="20px"
      left="50%"
      transform="translateX(-50%)"
      width={{ base: "90%", md: "400px" }}
      zIndex={10}
    >
      <Popover
        isOpen={isOpen && results.length > 0}
        onClose={onClose}
        placement="bottom"
        autoFocus={false}
        closeOnBlur={true}
        closeOnEsc={true}
      >
        <PopoverTrigger>
          <InputGroup size="md">
            <InputLeftElement pointerEvents="none">
              <Icon as={FaSearch} color="gray.400" />
            </InputLeftElement>
            <Input
              ref={searchInputRef}
              placeholder="Search for businesses..."
              bg="white"
              borderRadius="full"
              boxShadow="md"
              value={searchTerm}
              onChange={handleInputChange}
              onFocus={() => results.length > 0 && onOpen()}
              _focus={{ boxShadow: "outline" }}
            />
            {isLoading ? (
              <InputRightElement>
                <Spinner size="sm" color="blue.500" />
              </InputRightElement>
            ) : searchTerm ? (
              <InputRightElement>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleClearSearch}
                  aria-label="Clear search"
                >
                  <Icon as={FaTimes} color="gray.400" />
                </Button>
              </InputRightElement>
            ) : null}
          </InputGroup>
        </PopoverTrigger>
        <PopoverContent
          width={{ base: "90%", md: "400px" }}
          maxH="300px"
          overflowY="auto"
        >
          <PopoverBody p={0}>
            <List spacing={0}>
              {results.map((listing) => (
                <ListItem
                  key={listing.id}
                  p={3}
                  _hover={{ bg: "gray.100" }}
                  cursor="pointer"
                  onClick={() => handleSelectListing(listing)}
                  borderBottom="1px solid"
                  borderColor="gray.100"
                >
                  <Flex align="center">
                    <Icon as={FaMapMarkerAlt} color="blue.500" mr={2} />
                    <Box>
                      <Text fontWeight="bold" noOfLines={1}>
                        {listing.name}
                      </Text>
                      <Text fontSize="sm" color="gray.600" noOfLines={1}>
                        {listing.address}
                      </Text>
                    </Box>
                  </Flex>
                </ListItem>
              ))}
            </List>
          </PopoverBody>
        </PopoverContent>
      </Popover>
    </Box>
  );
};

export default MapSearch;
