import { HStack } from '@chakra-ui/react';
import { IListing, fetcher } from "@util/index";
import SWR from "swr";
import BusinessCard from "./ListingCard2";


const AppList = () => {
  const data_uri = "api/listings";
  const { data: fetchData, error } = SWR(data_uri, fetcher, {
    loadingTimeout: 1000,
    errorRetryCount: 2,
  });
  // useEffect(() => {
  //   const getOGData =async () => {
  //     let ogData = await fetchOpenGraphData('https://www.tenksolutions.com')
  //     console.log(ogData) 
  //   }
  //   getOGData()
  // }, [])
  
  return (
    <HStack flexWrap={'wrap'}>
      {fetchData && fetchData.map((listing: IListing) => 
        <BusinessCard activeListing={listing} key={listing.name} />
      )}
    </HStack>
  );
};

export default AppList;
