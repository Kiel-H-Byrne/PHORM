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
  Menu,
  MenuButton,
  MenuItemOption,
  MenuList,
  MenuOptionGroup,
  Popover,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
  Spinner,
  Text,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { FaFilter, FaMapMarkerAlt, FaSearch, FaTimes } from "react-icons/fa";

interface MapSearchProps {
  onSelectListing: (listing: IListing) => void;
  mapInstance?: google.maps.Map | null;
  onFilterChange?: (filters: SearchFilters) => void;
}

interface SearchFilters {
  category?: string;
  location?: string;
  sortBy?: "name" | "distance" | "rating";
}

const MapSearch = ({
  onSelectListing,
  mapInstance,
  onFilterChange,
}: MapSearchProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<IListing[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<SearchFilters>({});
  const { isOpen, onOpen, onClose } = useDisclosure();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const toast = useToast();
  // Debounced search function
  const handleSearch = useCallback(
    async (term: string) => {
      if (!term || term.length < 2) {
        setResults([]);
        return;
      }

      setIsLoading(true);
      setError(null);
      try {
        // Apply filters to search
        const searchResults = await searchListings(term, 10);

        // Apply client-side filtering
        let filteredResults = searchResults;

        if (filters.category) {
          filteredResults = filteredResults.filter((listing) =>
            listing.categories?.includes(filters.category as string)
          );
        }

        if (filters.location) {
          filteredResults = filteredResults.filter(
            (listing) =>
              listing.state === filters.location ||
              listing.city
                ?.toLowerCase()
                .includes(filters.location.toLowerCase())
          );
        }

        // Apply sorting
        if (filters.sortBy) {
          filteredResults = [...filteredResults].sort((a, b) => {
            if (filters.sortBy === "name") {
              return (a.name || "").localeCompare(b.name || "");
            } else if (filters.sortBy === "distance" && mapInstance) {
              // Calculate distance from current map center
              const center = mapInstance.getCenter();
              if (center && a.lat && a.lng && b.lat && b.lng) {
                const distanceA =
                  google.maps.geometry.spherical.computeDistanceBetween(
                    center,
                    new google.maps.LatLng(a.lat, a.lng)
                  );
                const distanceB =
                  google.maps.geometry.spherical.computeDistanceBetween(
                    center,
                    new google.maps.LatLng(b.lat, b.lng)
                  );
                return distanceA - distanceB;
              }
            }
            return 0;
          });
        }

        setResults(filteredResults);

        if (filteredResults.length > 0) {
          onOpen();
        } else if (searchResults.length > 0 && filteredResults.length === 0) {
          // We had results but filters removed them all
          toast({
            title: "No matches found",
            description: "Try adjusting your filters",
            status: "info",
            duration: 3000,
          });
        }
      } catch (error) {
        console.error("Error searching listings:", error);
        setError("Failed to search listings. Please try again.");
      } finally {
        setIsLoading(false);
      }
    },
    [onOpen, filters, mapInstance, toast]
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

  // Handle filter changes
  const handleFilterChange = useCallback(
    (filterType: keyof SearchFilters, value: any) => {
      const newFilters = { ...filters, [filterType]: value };
      setFilters(newFilters);

      // Notify parent component if callback provided
      if (onFilterChange) {
        onFilterChange(newFilters);
      }

      // Re-run search with new filters if we have a search term
      if (searchTerm && searchTerm.length >= 2) {
        handleSearch(searchTerm);
      }
    },
    [filters, handleSearch, onFilterChange, searchTerm]
  );

  // Clear all filters
  const clearFilters = useCallback(() => {
    setFilters({});
    if (onFilterChange) {
      onFilterChange({});
    }

    // Re-run search if we have a search term
    if (searchTerm && searchTerm.length >= 2) {
      handleSearch(searchTerm);
    }

    toast({
      title: "Filters cleared",
      status: "info",
      duration: 2000,
    });
  }, [filters, handleSearch, onFilterChange, searchTerm, toast]);

  return (
    <Box
      position="absolute"
      top="20px"
      left="50%"
      transform="translateX(-50%)"
      width={{ base: "90%", md: "400px" }}
      zIndex={10}
    >
      <Flex mb={2}>
        <Popover
          isOpen={isOpen}
          onClose={onClose}
          placement="bottom"
          autoFocus={false}
          closeOnBlur={true}
          closeOnEsc={true}
        >
          <PopoverTrigger>
            <InputGroup size="md" flex={1} mr={2}>
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
                    borderRadius={"full"}
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

          {/* Filter Menu */}
          <Menu closeOnSelect={false}>
            <MenuButton
              as={Button}
              rightIcon={<Icon as={FaFilter} />}
              bg="white"
              boxShadow="md"
              borderRadius="full"
              size="md"
              aria-label="Filter results"
              colorScheme={Object.keys(filters).length > 0 ? "blue" : "gray"}
            >
              {Object.keys(filters).length > 0
                ? `Filters (${Object.keys(filters).length})`
                : "Filter"}
            </MenuButton>
            <MenuList minWidth="240px" zIndex={20}>
              <MenuOptionGroup
                title="Category"
                type="radio"
                value={filters.category}
                onChange={(value) => handleFilterChange("category", value)}
              >
                <MenuItemOption value="restaurant">Restaurant</MenuItemOption>
                <MenuItemOption value="retail">Retail</MenuItemOption>
                <MenuItemOption value="service">Service</MenuItemOption>
                <MenuItemOption value="professional">
                  Professional
                </MenuItemOption>
              </MenuOptionGroup>

              <MenuOptionGroup
                title="Location"
                type="radio"
                value={filters.location}
                onChange={(value) => handleFilterChange("location", value)}
              >
                <MenuItemOption value="DC">Washington DC</MenuItemOption>
                <MenuItemOption value="MD">Maryland</MenuItemOption>
                <MenuItemOption value="VA">Virginia</MenuItemOption>
              </MenuOptionGroup>

              <MenuOptionGroup
                title="Sort By"
                type="radio"
                value={filters.sortBy}
                onChange={(value) => handleFilterChange("sortBy", value as any)}
              >
                <MenuItemOption value="name">Name</MenuItemOption>
                <MenuItemOption value="distance">Distance</MenuItemOption>
              </MenuOptionGroup>

              <Flex justify="center" mt={4}>
                <Button
                  size="sm"
                  onClick={clearFilters}
                  colorScheme="red"
                  variant="outline"
                >
                  Clear Filters
                </Button>
              </Flex>
            </MenuList>
          </Menu>
          <PopoverContent
            width={{ base: "90%", md: "400px" }}
            maxH="300px"
            overflowY="auto"
          >
            <PopoverBody p={0}>
              <List spacing={0}>
                {error && (
                  <ListItem p={3} textAlign="center" color="red.500">
                    {error}
                  </ListItem>
                )}

                {!error && results.length === 0 && (
                  <ListItem p={3} textAlign="center">
                    No results found. Try a different search term or adjust your
                    filters.
                  </ListItem>
                )}

                {results.map((listing) => (
                  <ListItem
                    key={listing.id || `${listing.lat}-${listing.lng}`}
                    p={3}
                    _hover={{ bg: "gray.100" }}
                    cursor="pointer"
                    onClick={() => handleSelectListing(listing)}
                    borderBottom="1px solid"
                    borderColor="gray.200"
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
                        {listing.categories &&
                          listing.categories.length > 0 && (
                            <Text fontSize="xs" color="gray.500" noOfLines={1}>
                              {listing.categories.join(", ")}
                            </Text>
                          )}
                      </Box>
                    </Flex>
                  </ListItem>
                ))}
              </List>
            </PopoverBody>
          </PopoverContent>
        </Popover>
      </Flex>
    </Box>
  );
};

export default MapSearch;
