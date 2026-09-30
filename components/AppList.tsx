import { useAuth } from "@/contexts/AuthContext";
import { IListing } from "@/types";
import { trackEvent } from "@/util/analytics";
import { BUSINESS_CATEGORIES } from "@/util/constants";
import {
  Box,
  Button,
  Flex,
  HStack,
  Heading,
  Icon,
  Input,
  InputGroup,
  InputLeftElement,
  SimpleGrid,
  Skeleton,
  Text,
  VStack,
  Wrap,
  WrapItem,
  useColorModeValue,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import { FormEvent, useEffect, useRef, useState } from "react";
import { FaBuilding, FaPlus, FaSearch } from "react-icons/fa";
import { MdMyLocation } from "react-icons/md";
import useSWR from "swr";
import AddListingDrawer from "./AddListingDrawer";
import BusinessCard from "./ListingCard2";

type ListingsPageResponse = {
  data: IListing[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

const PAGE_SIZE = 12;
const QUICK_CATEGORIES = BUSINESS_CATEGORIES.slice(0, 10);

const AppList = () => {
  const router = useRouter();
  const { user } = useAuth();
  const toast = useToast();
  const {
    isOpen: drawerIsOpen,
    onOpen: onDrawerOpen,
    onClose: onDrawerClose,
  } = useDisclosure();
  const firstField = useRef().current;
  const [locating, setLocating] = useState(false);

  const { searchQuery, category, near } = router.query as Record<
    string,
    string | undefined
  >;
  const page = parseInt((router.query.page as string) || "1", 10);
  const [term, setTerm] = useState(searchQuery || "");
  useEffect(() => setTerm(searchQuery || ""), [searchQuery]);

  const params = new URLSearchParams({
    includeCount: "true",
    page: String(page),
    pageSize: String(PAGE_SIZE),
  });
  if (searchQuery) params.set("searchQuery", searchQuery);
  if (category) params.set("category", category);
  if (near) params.set("near", near);

  const { data, error, isLoading } = useSWR<ListingsPageResponse>(
    router.isReady ? `/api/listings?${params.toString()}` : null,
    { revalidateOnFocus: false }
  );

  const items = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;
  const hasFilter = Boolean(searchQuery || category);

  useEffect(() => {
    if (!data || !hasFilter || page !== 1) return;
    trackEvent(data.total ? "search" : "search_no_results", {
      term: searchQuery,
      category,
      source: "list",
      results: data.total,
    });
  }, [data, hasFilter, page, searchQuery, category]);

  const pushQuery = (patch: Record<string, string | number | undefined>) => {
    const query: Record<string, any> = { ...router.query, ...patch };
    Object.keys(query).forEach(
      (k) => query[k] === undefined && delete query[k]
    );
    router.push({ pathname: router.pathname, query }, undefined, {
      shallow: true,
    });
  };

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    pushQuery({ searchQuery: term.trim() || undefined, page: undefined });
  };

  const handleNearMe = () => {
    if (near) return pushQuery({ near: undefined, page: undefined });
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setLocating(false);
        trackEvent("locate_me", { source: "list" });
        pushQuery({
          near: `${coords.latitude.toFixed(4)},${coords.longitude.toFixed(4)}`,
          page: undefined,
        });
      },
      () => {
        setLocating(false);
        toast({
          title: "Couldn't get your location",
          description: "Check your browser's location permission.",
          status: "warning",
        });
      },
      { timeout: 10000 }
    );
  };

  const handleAddBusinessClick = () => {
    if (user) onDrawerOpen();
    else router.push("/auth/login?returnUrl=/list");
  };

  const emptyBg = useColorModeValue("gray.50", "gray.800");
  const emptyBorder = useColorModeValue("gray.200", "gray.700");

  return (
    <VStack spacing={5} w="100%" align="stretch" py={6}>
      <Flex justify="space-between" align="center" gap={4} wrap="wrap">
        <Heading as="h1" size="lg">
          Find a business
        </Heading>
        <Button
          colorScheme="blue"
          leftIcon={<Icon as={FaPlus} />}
          onClick={handleAddBusinessClick}
          size={{ base: "sm", md: "md" }}
        >
          Add your business
        </Button>
      </Flex>

      <Flex
        as="form"
        onSubmit={handleSearch}
        gap={2}
        direction={{ base: "column", sm: "row" }}
      >
        <InputGroup size="lg">
          <InputLeftElement pointerEvents="none">
            <Icon as={FaSearch} color="gray.400" />
          </InputLeftElement>
          <Input
            type="search"
            enterKeyHint="search"
            placeholder="What do you need? e.g. plumber, attorney, catering"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            aria-label="Search businesses"
          />
        </InputGroup>
        <HStack>
          <Button
            type="submit"
            size="lg"
            colorScheme="blue"
            flex={{ base: 1, sm: "none" }}
          >
            Search
          </Button>
          <Button
            size="lg"
            variant={near ? "solid" : "outline"}
            colorScheme={near ? "green" : undefined}
            leftIcon={<Icon as={MdMyLocation} />}
            onClick={handleNearMe}
            isLoading={locating}
            flex={{ base: 1, sm: "none" }}
          >
            Near me
          </Button>
        </HStack>
      </Flex>

      <Wrap spacing={2}>
        {QUICK_CATEGORIES.map((c) => {
          const active = category === c;
          return (
            <WrapItem key={c}>
              <Button
                size="sm"
                borderRadius="full"
                variant={active ? "solid" : "outline"}
                colorScheme="blue"
                onClick={() =>
                  pushQuery({
                    category: active ? undefined : c,
                    page: undefined,
                  })
                }
              >
                {c}
              </Button>
            </WrapItem>
          );
        })}
      </Wrap>

      {error ? (
        <Text color="red.500">
          Something went wrong loading businesses. Please refresh the page.
        </Text>
      ) : isLoading || !data ? (
        <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} spacing={5}>
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} height="280px" borderRadius="lg" />
          ))}
        </SimpleGrid>
      ) : items.length === 0 ? (
        <Box
          textAlign="center"
          py={12}
          px={6}
          bg={emptyBg}
          borderRadius="lg"
          borderWidth="1px"
          borderColor={emptyBorder}
        >
          <Icon as={FaBuilding} boxSize={14} color="blue.400" mb={4} />
          <Heading size="md" mb={2}>
            {hasFilter
              ? `No businesses found for "${searchQuery || category}"`
              : "No businesses listed yet"}
          </Heading>
          <Text color="gray.600" maxW="500px" mx="auto" mb={6}>
            {hasFilter
              ? "Try a different word or category. Know a brother or PHA family member in this line of work? Invite them to list their business."
              : "Be the first to add your business to the directory."}
          </Text>
          <HStack justify="center" spacing={4} wrap="wrap">
            <Button
              colorScheme="blue"
              leftIcon={<Icon as={FaPlus} />}
              onClick={handleAddBusinessClick}
            >
              Add a business
            </Button>
            {hasFilter && (
              <Button
                variant="outline"
                onClick={() =>
                  router.push({ pathname: router.pathname }, undefined, {
                    shallow: true,
                  })
                }
              >
                Clear search
              </Button>
            )}
          </HStack>
        </Box>
      ) : (
        <>
          <Text color="gray.600" fontSize="sm">
            {total} {total === 1 ? "business" : "businesses"}
            {near ? " · sorted by distance" : ""}
          </Text>
          <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} spacing={5}>
            {items.map((listing) => (
              <BusinessCard activeListing={listing} key={listing.id} />
            ))}
          </SimpleGrid>
          {totalPages > 1 && (
            <HStack justify="center" spacing={4}>
              <Button
                onClick={() => pushQuery({ page: page - 1 })}
                isDisabled={page <= 1}
              >
                Previous
              </Button>
              <Text>
                Page {page} of {totalPages}
              </Text>
              <Button
                onClick={() => pushQuery({ page: page + 1 })}
                isDisabled={page >= totalPages}
              >
                Next
              </Button>
            </HStack>
          )}
        </>
      )}

      <AddListingDrawer
        drawerIsOpen={drawerIsOpen}
        firstField={firstField}
        onDrawerClose={onDrawerClose}
      />
    </VStack>
  );
};

export default AppList;
