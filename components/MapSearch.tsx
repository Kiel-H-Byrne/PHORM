import { searchListings } from "@/db/listings";
import { IListing } from "@/types";
import {
  BUSINESS_CATEGORIES,
  POPULAR_SEARCHES,
  SERVICE_TAGS,
} from "@/util/constants";
import {
  Badge,
  Box,
  Button,
  Flex,
  HStack,
  Icon,
  IconButton,
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
  Spinner,
  Tag,
  TagLabel,
  Text,
  Wrap,
  WrapItem,
  useToast,
} from "@chakra-ui/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FaFilter, FaMapMarkerAlt, FaPlus, FaSearch, FaTimes } from "react-icons/fa";

interface MapSearchProps {
  onSelectListing: (listing: IListing) => void;
  mapInstance?: google.maps.Map | null;
  onFilterChange?: (filters: SearchFilters) => void;
  onAddListing?: (name?: string) => void;
  layout?: "overlay" | "inline";
  placeholder?: string;
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
  onAddListing,
  layout = "overlay",
  placeholder = "Search for businesses...",
}: MapSearchProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<IListing[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<SearchFilters>({});
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const toast = useToast();

  type Suggestion = {
    type: "category" | "tag" | "popular";
    label: string;
    value: string;
  };

  const suggestions: Suggestion[] = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    const match = (s: string) => s.toLowerCase().includes(term);
    const fromCats = BUSINESS_CATEGORIES.filter((c) => (term ? match(c) : true))
      .slice(0, 6)
      .map((c) => ({ type: "category" as const, label: c, value: c }));
    const fromTags = SERVICE_TAGS.filter((t) => (term ? match(t) : true))
      .slice(0, 6)
      .map((t) => ({ type: "tag" as const, label: t, value: t }));
    const fromPopular = POPULAR_SEARCHES.filter((p) => (term ? match(p) : true))
      .slice(0, 6)
      .map((p) => ({ type: "popular" as const, label: p, value: p }));

    // Deduplicate by label
    const all = [...fromCats, ...fromTags, ...fromPopular];
    const seen = new Set<string>();
    return all
      .filter((s) => (seen.has(s.label) ? false : (seen.add(s.label), true)))
      .slice(0, 10);
  }, [searchTerm]);

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
          filteredResults = filteredResults.filter((listing) => {
            if (!filters.location) return false;
            return (
              listing.state === filters.location ||
              (listing.city
                ?.toLowerCase()
                .includes(filters.location.toLowerCase()) ??
                false)
            );
          });
        }

        // Apply sorting
        if (filters.sortBy) {
          filteredResults = [...filteredResults].sort((a, b) => {
            if (filters.sortBy === "name") {
              return (a.name || "").localeCompare(b.name || "");
            } else if (filters.sortBy === "distance" && mapInstance) {
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
        setIsOpen(true);

        if (searchResults.length > 0 && filteredResults.length === 0) {
          toast({
            title: "No matches found",
            description: "Try adjusting your filters",
            status: "info",
            duration: 3000,
          });
        }
      } catch (err) {
        console.error("Error searching listings:", err);
        setError("Failed to search listings. Please try again.");
      } finally {
        setIsLoading(false);
      }
    },
    [filters, mapInstance, toast]
  );

  // Handle input change with debounce
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setSearchTerm(value);
      setHighlightedIndex(-1);
      setIsOpen(true);

      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }

      searchTimeoutRef.current = setTimeout(() => {
        handleSearch(value);
      }, 400);
    },
    [handleSearch]
  );

  // Clear search input
  const handleClearSearch = useCallback(() => {
    setSearchTerm("");
    setResults([]);
    setHighlightedIndex(-1);
    setIsOpen(true);
    searchInputRef.current?.focus();
  }, []);

  // Handle listing selection
  const handleSelectListing = useCallback(
    (listing: IListing) => {
      onSelectListing(listing);
      setIsOpen(false);
      setHighlightedIndex(-1);

      if (mapInstance && listing.lat && listing.lng) {
        mapInstance.panTo({ lat: listing.lat, lng: listing.lng });
        mapInstance.setZoom(16);
      }
    },
    [mapInstance, onSelectListing]
  );

  // Handle suggestion chip selection
  const handleSelectSuggestion = useCallback(
    (suggestion: Suggestion) => {
      if (suggestion.type === "category") {
        const newFilters = { ...filters, category: suggestion.label };
        setFilters(newFilters);
        if (onFilterChange) {
          onFilterChange(newFilters);
        }
      }
      setSearchTerm(suggestion.value);
      setHighlightedIndex(-1);
      handleSearch(suggestion.value);
      searchInputRef.current?.focus();
    },
    [filters, handleSearch, onFilterChange]
  );

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setHighlightedIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  // Clean up search timeout on unmount
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

      if (onFilterChange) {
        onFilterChange(newFilters);
      }

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

    if (searchTerm && searchTerm.length >= 2) {
      handleSearch(searchTerm);
    }

    toast({
      title: "Filters cleared",
      status: "info",
      duration: 2000,
    });
  }, [handleSearch, onFilterChange, searchTerm, toast]);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (!isOpen) {
        if (e.key === "ArrowDown" || e.key === "ArrowUp") {
          e.preventDefault();
          setIsOpen(true);
        }
        return;
      }

      if (e.key === "ArrowDown") {
        e.preventDefault();
        if (results.length > 0) {
          setHighlightedIndex((prev) =>
            prev < results.length - 1 ? prev + 1 : 0
          );
        }
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        if (results.length > 0) {
          setHighlightedIndex((prev) =>
            prev > 0 ? prev - 1 : results.length - 1
          );
        }
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (highlightedIndex >= 0 && results[highlightedIndex]) {
          handleSelectListing(results[highlightedIndex]);
        } else if (searchTerm && searchTerm.length >= 2) {
          if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
          }
          handleSearch(searchTerm);
        }
      } else if (e.key === "Escape") {
        e.preventDefault();
        setIsOpen(false);
        setHighlightedIndex(-1);
      }
    },
    [
      handleSearch,
      handleSelectListing,
      highlightedIndex,
      isOpen,
      results,
      searchTerm,
    ]
  );

  const activeFilterCount = Object.keys(filters).length;

  return (
    <Box
      ref={searchContainerRef}
      position={layout === "overlay" ? "absolute" : "relative"}
      top={layout === "overlay" ? "16px" : undefined}
      left={layout === "overlay" ? "50%" : undefined}
      transform={layout === "overlay" ? "translateX(-50%)" : undefined}
      width={layout === "overlay" ? { base: "92%", sm: "80%", md: "460px" } : "100%"}
      zIndex={15}
      mx={layout === "inline" ? "auto" : undefined}
      my={layout === "inline" ? 4 : undefined}
      px={layout === "inline" ? 4 : undefined}
    >
      <Flex gap={2} align="center">
        {/* Search Input */}
        <InputGroup size="md" flex={1}>
          <InputLeftElement pointerEvents="none">
            <Icon as={FaSearch} color="gray.400" />
          </InputLeftElement>
          <Input
            ref={searchInputRef}
            role="combobox"
            aria-expanded={isOpen}
            aria-haspopup="listbox"
            aria-autocomplete="list"
            aria-controls="map-search-listbox"
            aria-activedescendant={
              highlightedIndex >= 0
                ? `map-search-item-${highlightedIndex}`
                : undefined
            }
            aria-label="Search businesses"
            placeholder={placeholder}
            bg="white"
            borderRadius="full"
            boxShadow="md"
            value={searchTerm}
            onChange={handleInputChange}
            onFocus={() => setIsOpen(true)}
            onClick={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
            _focus={{ boxShadow: "0 0 0 2px #3a3ef1" }}
          />
          {isLoading ? (
            <InputRightElement>
              <Spinner size="sm" color="blue.500" />
            </InputRightElement>
          ) : searchTerm ? (
            <InputRightElement>
              <IconButton
                size="xs"
                isRound
                variant="ghost"
                onClick={handleClearSearch}
                aria-label="Clear search"
                icon={<Icon as={FaTimes} color="gray.400" />}
              />
            </InputRightElement>
          ) : null}
        </InputGroup>

        {/* Filter Menu */}
        <Menu closeOnSelect={false} onOpen={() => setIsOpen(false)}>
          <MenuButton
            as={Button}
            rightIcon={<Icon as={FaFilter} />}
            bg="white"
            boxShadow="md"
            borderRadius="full"
            size="md"
            aria-label="Filter results"
            colorScheme={activeFilterCount > 0 ? "blue" : "gray"}
            flexShrink={0}
          >
            {activeFilterCount > 0
              ? `Filters (${activeFilterCount})`
              : "Filter"}
          </MenuButton>
          <MenuList minWidth="240px" zIndex={25} boxShadow="xl">
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

            <Flex justify="center" mt={4} pb={2}>
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
      </Flex>

      {/* Combobox Dropdown */}
      {isOpen && (
        <Box
          id="map-search-listbox"
          role="listbox"
          aria-label="Search suggestions and results"
          position="absolute"
          top="calc(100% + 6px)"
          left={0}
          right={0}
          bg="white"
          borderRadius="2xl"
          boxShadow="0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)"
          border="1px solid"
          borderColor="gray.200"
          maxH="380px"
          overflowY="auto"
          zIndex={20}
          p={3}
        >
          {/* Suggestions Chips */}
          {suggestions.length > 0 && (
            <Box mb={results.length > 0 ? 3 : 1}>
              <Text
                fontSize="xs"
                fontWeight="semibold"
                color="gray.500"
                textTransform="uppercase"
                letterSpacing="wider"
                mb={2}
                px={1}
              >
                {searchTerm ? "Suggestions" : "Popular Searches"}
              </Text>
              <Wrap spacing={2}>
                {suggestions.map((s) => (
                  <WrapItem key={`${s.type}:${s.label}`}>
                    <Tag
                      size="md"
                      borderRadius="full"
                      variant="subtle"
                      colorScheme={
                        s.type === "category"
                          ? "blue"
                          : s.type === "tag"
                          ? "purple"
                          : "gray"
                      }
                      cursor="pointer"
                      _hover={{
                        opacity: 0.85,
                        transform: "translateY(-1px)",
                        boxShadow: "sm",
                      }}
                      transition="all 0.15s"
                      onClick={() => handleSelectSuggestion(s)}
                    >
                      <TagLabel>{s.label}</TagLabel>
                    </Tag>
                  </WrapItem>
                ))}
              </Wrap>
            </Box>
          )}

          {/* Loading Indicator */}
          {isLoading && (
            <Flex align="center" justify="center" p={4} color="gray.500" gap={2}>
              <Spinner size="sm" color="blue.500" />
              <Text fontSize="sm">Searching businesses...</Text>
            </Flex>
          )}

          {/* Results List */}
          {results.length > 0 && (
            <Box mt={suggestions.length > 0 ? 2 : 0}>
              <Text
                fontSize="xs"
                fontWeight="semibold"
                color="gray.500"
                textTransform="uppercase"
                letterSpacing="wider"
                mb={2}
                px={1}
              >
                Businesses ({results.length})
              </Text>
              <List spacing={1}>
                {results.map((listing, index) => {
                  const isHighlighted = highlightedIndex === index;
                  return (
                    <ListItem
                      key={listing.id || `${listing.lat}-${listing.lng}-${index}`}
                      id={`map-search-item-${index}`}
                      role="option"
                      aria-selected={isHighlighted}
                      p={2.5}
                      borderRadius="lg"
                      bg={isHighlighted ? "blue.50" : "transparent"}
                      _hover={{ bg: "gray.100" }}
                      cursor="pointer"
                      onClick={() => handleSelectListing(listing)}
                      transition="background 0.15s"
                    >
                      <Flex align="center">
                        <Box
                          p={2}
                          borderRadius="full"
                          bg={isHighlighted ? "blue.100" : "gray.100"}
                          color="blue.600"
                          mr={3}
                          flexShrink={0}
                        >
                          <Icon as={FaMapMarkerAlt} boxSize={3.5} />
                        </Box>
                        <Box flex={1} minW={0}>
                          <Text
                            fontWeight="bold"
                            fontSize="sm"
                            noOfLines={1}
                            color="gray.800"
                          >
                            {listing.name}
                          </Text>
                          {listing.address && (
                            <Text fontSize="xs" color="gray.600" noOfLines={1}>
                              {listing.address}
                            </Text>
                          )}
                          {listing.categories &&
                            listing.categories.length > 0 && (
                              <HStack spacing={1} mt={1} wrap="wrap">
                                {listing.categories.slice(0, 3).map((cat) => (
                                  <Badge
                                    key={cat}
                                    fontSize="2xs"
                                    colorScheme="blue"
                                    variant="subtle"
                                    borderRadius="full"
                                    px={1.5}
                                  >
                                    {cat}
                                  </Badge>
                                ))}
                              </HStack>
                            )}
                        </Box>
                      </Flex>
                    </ListItem>
                  );
                })}
              </List>
            </Box>
          )}

          {/* Error Message */}
          {error && (
            <Box p={3} textAlign="center" color="red.500" fontSize="sm">
              {error}
            </Box>
          )}

          {/* Empty State */}
          {!isLoading &&
            !error &&
            searchTerm.length >= 2 &&
            results.length === 0 && (
              <Box p={4} textAlign="center">
                <Text fontSize="sm" color="gray.600">
                  No results found for &ldquo;{searchTerm}&rdquo;.
                </Text>
                <Text fontSize="xs" color="gray.400" mt={1} mb={3}>
                  Try a different search term or adjust your filters.
                </Text>
                <Button
                  size="sm"
                  colorScheme="blue"
                  leftIcon={<Icon as={FaPlus} />}
                  onClick={() => {
                    setIsOpen(false);
                    if (onAddListing) {
                      onAddListing(searchTerm);
                    } else if (typeof window !== "undefined") {
                      window.location.href = `/list?searchQuery=${encodeURIComponent(
                        searchTerm
                      )}`;
                    }
                  }}
                >
                  Add This Business
                </Button>
              </Box>
            )}
        </Box>
      )}
    </Box>
  );
};

export default MapSearch;
