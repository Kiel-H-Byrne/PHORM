import MemberFilter from "@/components/MemberFilter";
import MemberList from "@/components/MemberList";
import { MemberQuery } from "@/types";
import fetcher from "@/util/fetch";
import { CircularProgress, VStack } from "@chakra-ui/react";
import { useState } from "react";
import useSWR, { mutate } from "swr";

export default function MemberDirectory() {
  const [searchParams, setSearchParams] = useState({} as MemberQuery);

  const { data, isLoading, error } = useSWR(() => {
    const params = new URLSearchParams(searchParams as Record<string, string>);
    return `/api/users?${params}`;
  }, fetcher);
  if (error) {
    return <div>Failed to load</div>;
  }
  //filters is an object with parameters of api search
  async function handleSearch() {
    // Update searchParams
    setSearchParams(searchParams);
    // Trigger revalidate
    mutate("/api/users");
  }
  return (
    <VStack spacing={3} p={4}>
      <MemberFilter
        searchParams={searchParams}
        setSearchParams={setSearchParams}
        handleSearch={handleSearch}
      />

      {isLoading && <CircularProgress isIndeterminate />}
      {!isLoading && <MemberList members={data} />}
    </VStack>
  );
}
