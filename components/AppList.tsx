import { useAuth } from "@/contexts/AuthContext";
import { IListing } from "@/types";
import fetcher from "@/util/fetch";
import {
  Box,
  Button,
  Flex,
  HStack,
  Heading,
  Icon,
  NumberInput,
  NumberInputField,
  Select,
  Text,
  VStack,
  useColorModeValue,
  useDisclosure,
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import { useRef } from "react";
import { FaBuilding, FaPlus } from "react-icons/fa";
import SWR from "swr";
import AddListingDrawer from "./AddListingDrawer";
import BusinessCard from "./ListingCard2";
import MapSearch from "./MapSearch";

type ListingsPageResponse = {
  data: IListing[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

const AppList = () => {
  const router = useRouter();
  const { user } = useAuth();
  const {
    isOpen: drawerIsOpen,
    onOpen: onDrawerOpen,
    onClose: onDrawerClose,
  } = useDisclosure();
  const firstField = useRef().current;

  const { searchQuery, category } = router.query as {
    searchQuery?: string;
    category?: string;
    page?: string;
    pageSize?: string;
  };

  const page = parseInt((router.query.page as string) || "1", 10);
  const pageSize = parseInt((router.query.pageSize as string) || "12", 10);

  const params = new URLSearchParams();
  params.set("includeCount", "true");
  params.set("page", String(page));
  params.set("pageSize", String(pageSize));
  if (searchQuery) params.set("searchQuery", searchQuery);
  if (category) params.set("category", category);
  const data_uri = `/api/listings?${params.toString()}`;

  const { data: fetchData } = SWR<ListingsPageResponse>(data_uri, fetcher, {
    loadingTimeout: 1000,
    errorRetryCount: 2,
    revalidateOnFocus: false,
  });

  const items = fetchData?.data ?? [];
  const total = fetchData?.total ?? 0;
  const totalPages = fetchData?.totalPages ?? 1;

  const pushQuery = (patch: Record<string, any>) => {
    router.push(
      {
        pathname: router.pathname,
        query: { ...router.query, ...patch },
      },
      undefined,
      { shallow: true }
    );
  };

  const handleAddBusinessClick = () => {
    if (user) {
      onDrawerOpen();
    } else {
      router.push("/auth/login?redirect=/list");
    }
  };

  const clearFilters = () => {
    router.push({ pathname: router.pathname }, undefined, { shallow: true });
  };

  const hasFilter = Boolean(searchQuery || category);
  const emptyBg = useColorModeValue("gray.50", "gray.800");
  const emptyBorder = useColorModeValue("gray.200", "gray.700");

  return (
    <VStack spacing={5} w="100%" align="stretch" px={{ base: 4, md: 8 }} py={6}>
      <MapSearch
        layout="inline"
        onSelectListing={(listing) => {
          const q = new URLSearchParams({ viewType: "map" });
          if (listing.lat && listing.lng)
            q.set("center", `${listing.lat},${listing.lng}`);
          router.push(`/?${q.toString()}`);
        }}
      />

      <Flex
        direction={{ base: "column", sm: "row" }}
        justify="space-between"
        align={{ base: "flex-start", sm: "center" }}
        gap={4}
      >
        <Heading as={"h1"}>Listings</Heading>
        <Button
          colorScheme="blue"
          leftIcon={<Icon as={FaPlus} />}
          onClick={handleAddBusinessClick}
        >
          Add Your Business
        </Button>
      </Flex>

      {items.length === 0 ? (
        <Box
          textAlign="center"
          py={12}
          px={6}
          bg={emptyBg}
          borderRadius="lg"
          borderWidth="1px"
          borderColor={emptyBorder}
          my={4}
        >
          <Icon as={FaBuilding} boxSize={14} color="blue.400" mb={4} />
          <Heading size="lg" mb={2}>
            {hasFilter
              ? `No Businesses Found for "${searchQuery || category}"`
              : "No Businesses Listed Yet"}
          </Heading>
          <Text color="gray.600" maxW="500px" mx="auto" mb={6}>
            {hasFilter
              ? "We couldn't find any businesses matching your search criteria. Try adjusting your filters or be the first to add this business to PHORM!"
              : "No businesses have been listed yet. Be the first to add your business to the directory and connect with the community!"}
          </Text>
          <HStack justify="center" spacing={4}>
            <Button
              colorScheme="blue"
              size="lg"
              leftIcon={<Icon as={FaPlus} />}
              onClick={handleAddBusinessClick}
            >
              Add Your Business
            </Button>
            {hasFilter && (
              <Button size="lg" variant="outline" onClick={clearFilters}>
                Clear Filters
              </Button>
            )}
          </HStack>
        </Box>
      ) : (
        <>
          <HStack w="100%" justify="space-between" wrap="wrap" gap={3}>
            <Text color="gray.600">
              Page {page} of {totalPages} • {total} results
            </Text>
            <HStack>
              <Text fontSize="sm">Page size:</Text>
              <Select
                size="sm"
                value={String(pageSize)}
                onChange={(e) =>
                  pushQuery({ pageSize: e.target.value, page: 1 })
                }
                w="auto"
              >
                {[10, 12, 20, 50].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </Select>
              <HStack>
                <Button
                  size="sm"
                  onClick={() => pushQuery({ page: Math.max(1, page - 1) })}
                  isDisabled={page <= 1}
                >
                  Prev
                </Button>
                <Button
                  size="sm"
                  onClick={() =>
                    pushQuery({ page: Math.min(totalPages, page + 1) })
                  }
                  isDisabled={page >= totalPages}
                >
                  Next
                </Button>
              </HStack>
              <HStack>
                <Text fontSize="sm">Go to:</Text>
                <NumberInput
                  size="sm"
                  value={page}
                  min={1}
                  max={totalPages}
                  onChange={(_, v) => {
                    const next = Math.min(totalPages, Math.max(1, v || 1));
                    if (next !== page) pushQuery({ page: next });
                  }}
                  w="80px"
                >
                  <NumberInputField />
                </NumberInput>
              </HStack>
            </HStack>
          </HStack>

          <HStack flexWrap={"wrap"} spacing={5} w="100%">
            {items.map((listing) => (
              <BusinessCard
                activeListing={listing}
                key={listing.id ?? listing.name}
              />
            ))}
          </HStack>
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
