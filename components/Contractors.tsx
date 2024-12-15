import { ListingTypeEnum } from "@/db/listings";
import { IListing } from "@/types";
import fetcher from "@/util/fetch";
import { Stack, VStack } from "@chakra-ui/react";
import SWR from "swr";
import BusinessCard from "./ListingCard2";
const Contractors = ({ radius }: { radius: number }) => {
  const FETCH_CONTRACTORS_URI = `/api/listings?type=${ListingTypeEnum.CONTRACTOR}&radius=${radius}`;

  const { data: fetchData, error } = SWR(FETCH_CONTRACTORS_URI, fetcher, {
    loadingTimeout: 1000,
    errorRetryCount: 2,
  });
  return (
    <VStack spacing={5}>
      {/* <Heading as={"h1"}>Listings</Heading> */}
      <Stack flexWrap={"wrap"} spacing={5} direction={{base: 'column', sm: 'row'}}>
        {fetchData &&
          fetchData.map((listing: IListing) => (
            <BusinessCard activeListing={listing} key={listing.name} />
          ))}
      </Stack>
    </VStack>
  );
};

export default Contractors;
