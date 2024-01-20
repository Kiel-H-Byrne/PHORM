import { IListing } from "@/types";
import fetcher from "@/util/fetch";
import { HStack, Heading, VStack } from "@chakra-ui/react";
import SWR from "swr";
import BusinessCard from "./ListingCard2";
const AppList = () => {
  const data_uri = "api/listings";
  const { data: fetchData, error } = SWR(data_uri, fetcher, {
    loadingTimeout: 1000,
    errorRetryCount: 2,
  });
  return (
    <VStack spacing={5}>

    <Heading as={"h1"}>Listings</Heading>
    <HStack flexWrap={"wrap"} spacing={5}>
      {fetchData &&
        fetchData.map((listing: IListing) => (
          <BusinessCard activeListing={listing} key={listing.name} />
        ))}
    </HStack>
    </VStack>

  );
};

export default AppList;
