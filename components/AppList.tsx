import { IListing } from "@/types";
import fetcher from "@/util/fetch";
import { HStack } from '@chakra-ui/react';
import SWR from "swr";
import BusinessCard from "./ListingCard2";
const AppList = () => {
  const data_uri = "api/listings";
  const { data: fetchData, error } = SWR(data_uri, fetcher, {
    loadingTimeout: 1000,
    errorRetryCount: 2,
  });
  return (
    <HStack flexWrap={'wrap'}>
      {fetchData && fetchData.map((listing: IListing) => 
        <BusinessCard activeListing={listing} key={listing.name} />
      )}
    </HStack>
  );
};

export default AppList;
