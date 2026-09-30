import MemberFilter from "@/components/MemberFilter";
import MemberList from "@/components/MemberList";
import { useAuth } from "@/contexts/AuthContext";
import { MemberQuery } from "@/types";
import { authFetcher } from "@/util/authFetch";
import {
  Alert,
  AlertIcon,
  CircularProgress,
  Container,
  Heading,
  Link,
  VStack,
} from "@chakra-ui/react";
import NextLink from "next/link";
import { useState } from "react";
import useSWR, { mutate } from "swr";

export default function MemberDirectory() {
  const [searchParams, setSearchParams] = useState({} as MemberQuery);
  const { user } = useAuth();
  const { data, isLoading, error } = useSWR(() => {
    const params = new URLSearchParams(searchParams as Record<string, string>);
    return `/api/users?${params}`;
  }, authFetcher);
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
  return user ? (
    <VStack spacing={4} p={4} align="stretch">
      <Heading as="h1" size="lg">
        Member Directory
      </Heading>
      <Alert status="info" borderRadius="md">
        <AlertIcon />
        Members appear here only if they opt in. Want to be listed?&nbsp;
        <Link as={NextLink} href="/dashboard?editProfile=1" fontWeight="bold">
          Update your profile
        </Link>
      </Alert>
      <MemberFilter
        searchParams={searchParams}
        setSearchParams={setSearchParams}
        handleSearch={handleSearch}
      />

      {isLoading && <CircularProgress isIndeterminate />}
      {!isLoading && <MemberList members={data} />}
    </VStack>
  ) : (
    <Container py={10}>
      <Heading textAlign={"center"}>You must be Logged In</Heading>
    </Container>
  );
}
