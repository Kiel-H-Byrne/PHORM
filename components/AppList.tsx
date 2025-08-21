import { IListing } from "@/types";
import fetcher from "@/util/fetch";
import { HStack, Heading, VStack } from "@chakra-ui/react";
import { useRouter } from "next/router";
import SWR from "swr";
import BusinessCard from "./ListingCard2";
const AppList = () => {
  const router = useRouter();
  const { searchQuery } = router.query as { searchQuery?: string };
  const data_uri = searchQuery ? `/api/listings?searchQuery=${encodeURIComponent(searchQuery)}` : "api/listings";
  const { data: fetchData } = SWR<IListing[]>(data_uri, fetcher, {
    loadingTimeout: 1000,
    errorRetryCount: 2,
    revalidateOnFocus: false,
  });
  return (
    <VStack spacing={5}>
      <Heading as={"h1"}>Listings</Heading>
      <HStack flexWrap={"wrap"} spacing={5}>
        {fetchData?.map((listing) => (
          <BusinessCard activeListing={listing} key={listing.id ?? listing.name} />
        ))}
      </HStack>
    </VStack>
  );
};

export default AppList;
