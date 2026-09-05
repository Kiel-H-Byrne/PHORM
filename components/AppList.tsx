import { IListing } from "@/types";
import fetcher from "@/util/fetch";
import {
  Button,
  HStack,
  Heading,
  NumberInput,
  NumberInputField,
  Select,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import SWR from "swr";
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

  return (
    <VStack spacing={5}>
      <MapSearch
        layout="inline"
        onSelectListing={(listing) => {
          const q = new URLSearchParams({ viewType: "map" });
          if (listing.lat && listing.lng)
            q.set("center", `${listing.lat},${listing.lng}`);
          router.push(`/?${q.toString()}`);
        }}
      />

      <Heading as={"h1"}>Listings</Heading>

      <HStack w="100%" justify="space-between">
        <Text color="gray.600">
          Page {page} of {totalPages} • {total} results
        </Text>
        <HStack>
          <Text fontSize="sm">Page size:</Text>
          <Select
            size="sm"
            value={String(pageSize)}
            onChange={(e) => pushQuery({ pageSize: e.target.value, page: 1 })}
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
    </VStack>
  );
};

export default AppList;
