import MemberFilter from "@/components/MemberFilter";
import MemberList from "@/components/MemberList";
import { MemberQuery } from "@/types";
import fetcher from "@/util/fetch";
import { CircularProgress, Container, VStack } from "@chakra-ui/react";
import { useSession } from "next-auth/react";
import { useState } from "react";
import useSWR, { mutate } from "swr";

export default function MemberDirectory() {
  const [searchParams, setSearchParams] = useState({} as MemberQuery);
  const { status } = useSession();
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
  const isAuthenticated = status == "authenticated";
  return (
    <>
    <Container py={10}>
      {isLoading && <CircularProgress isIndeterminate w="full" size={"lg"} m="auto" />}
      {isAuthenticated && !isLoading && (
      <VStack spacing={3} p={4}>
        <MemberFilter
          searchParams={searchParams}
          setSearchParams={setSearchParams}
          handleSearch={handleSearch}
        />
        <MemberList members={data} />
      </VStack>
      )}
    </Container>

    </>
  );
}
