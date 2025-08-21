import { Box, Button, Container, Grid, GridItem, Heading, HStack, Icon, Input, InputGroup, InputLeftElement, Text, VStack } from "@chakra-ui/react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import SWR from "swr";
import { IListing } from "@/types";
import fetcher from "@/util/fetch";
import BusinessCard from "@/components/ListingCard2";
import { MdSearch, MdMap, MdList } from "react-icons/md";

/**
 * Homepage
 * A friendly landing page for members to find businesses and add their own.
 */
export default function IndexPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const { data: featured } = SWR<IListing[]>("/api/listings?pageSize=6", fetcher);

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    const q = query.trim();
    router.push(q ? `/list?searchQuery=${encodeURIComponent(q)}` : "/list");
  };

  return (
    <Container maxW="6xl" py={{ base: 8, md: 12 }}>
      {/* Hero */}
      <VStack spacing={4} align="stretch" mb={{ base: 8, md: 12 }}>
        <Heading as="h1" size="xl" textAlign="center">
          Find Your Community Business
        </Heading>
        <Text fontSize={{ base: "md", md: "lg" }} textAlign="center" color="gray.600">
          Welcome to PHORM — a directory of Prince Hall–owned and supported businesses.
        </Text>

        {/* Search */}
        <Box as="form" onSubmit={handleSearch} mx="auto" w={{ base: "100%", md: "70%" }}>
          <InputGroup size="lg">
            <InputLeftElement pointerEvents="none">
              <Icon as={MdSearch} color="gray.400" boxSize={6} />
            </InputLeftElement>
            <Input
              aria-label="Search businesses"
              placeholder="Search by name or category"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              fontSize="md"
              bg="white"
            />
          </InputGroup>
          <HStack mt={4} justify="center" spacing={4}>
            <Button as={Link} href="/map" size="lg" leftIcon={<Icon as={MdMap} />} colorScheme="blue">
              View Map
            </Button>
            <Button as={Link} href={query ? `/list?searchQuery=${encodeURIComponent(query)}` : "/list"} size="lg" leftIcon={<Icon as={MdList} />} variant="outline">
              View List
            </Button>
          </HStack>
        </Box>
      </VStack>

      {/* Featured */}
      <VStack align="stretch" spacing={4}>
        <Heading as="h2" size="lg">Featured Businesses</Heading>
        <Grid templateColumns={{ base: "1fr", sm: "repeat(2, 1fr)", md: "repeat(3, 1fr)" }} gap={6}>
          {featured?.slice(0, 6).map((listing) => (
            <GridItem key={listing.id ?? listing.name}>
              <BusinessCard activeListing={listing} />
            </GridItem>
          ))}
        </Grid>
      </VStack>
    </Container>
  );
}
