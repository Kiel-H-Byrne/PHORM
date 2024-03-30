import { ListingTypeEnum } from "@/db/listings";
import { IListing } from "@/types";
import fetcher from "@/util/fetch";
import { HStack, VStack } from "@chakra-ui/react";
import SWR from "swr";
import BusinessCard from "./ListingCard2";
const OnlineListings = () => {
  const FETCH_CONTRACTORS_URI = `/api/listings?type=${ListingTypeEnum.ONLINE}`;

  const { data: fetchData, error } = SWR(FETCH_CONTRACTORS_URI, fetcher, {
    loadingTimeout: 1000,
    errorRetryCount: 2,
  });
  return (
    <VStack spacing={5}>
      {/* <Heading as={"h1"}>Listings</Heading> */}
      <HStack flexWrap={"wrap"} spacing={5}>
        {fetchData &&
          fetchData.map((listing: IListing) => (
            <BusinessCard activeListing={listing} key={listing.name} />
          ))}
      </HStack>
    </VStack>
  );
};

export default OnlineListings;
