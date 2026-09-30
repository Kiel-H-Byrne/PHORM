import AddListingDrawer from "@/components/AddListingDrawer";
import BusinessCard from "@/components/ListingCard2";
import { useAuth } from "@/contexts/AuthContext";
import { IListing } from "@/types";
import { BUSINESS_CATEGORIES } from "@/util/constants";
import {
  Box,
  Button,
  Container,
  Flex,
  HStack,
  Heading,
  Icon,
  Image,
  Input,
  InputGroup,
  InputLeftElement,
  SimpleGrid,
  Skeleton,
  Stack,
  Text,
  VStack,
  Wrap,
  WrapItem,
  useColorModeValue,
  useDisclosure,
} from "@chakra-ui/react";
import Link from "next/link";
import { useRouter } from "next/router";
import { FormEvent, useRef, useState } from "react";
import { FaBuilding, FaPlus, FaSearch } from "react-icons/fa";
import { MdList, MdMap } from "react-icons/md";
import useSWR from "swr";

/**
 * Homepage
 * Search first, then browse, then add your own business.
 */
export default function IndexPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const {
    isOpen: drawerIsOpen,
    onOpen: onDrawerOpen,
    onClose: onDrawerClose,
  } = useDisclosure();
  const firstField = useRef().current;
  const emptyBg = useColorModeValue("gray.50", "gray.800");
  const emptyBorder = useColorModeValue("gray.200", "gray.700");

  const { data: featured, isLoading } = useSWR<IListing[]>(
    "/api/listings?pageSize=6"
  );

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    router.push(q ? `/list?searchQuery=${encodeURIComponent(q)}` : "/list");
  };

  const handleAddBusiness = () => {
    if (user) onDrawerOpen();
    else router.push("/auth/login?returnUrl=/dashboard");
  };

  return (
    <Container maxW="6xl" py={{ base: 6, md: 12 }} px={{ base: 0, md: 4 }}>
      <VStack spacing={4} mb={{ base: 8, md: 12 }} textAlign="center">
        <Image
          src="/img/Logo1.png"
          height={{ base: 20, md: 28 }}
          alt="PHORM logo"
        />
        <Heading as="h1" size={{ base: "lg", md: "xl" }}>
          Find businesses owned by our{" "}
          <Text as="span" color="royalblue">
            PHAmily
          </Text>
        </Heading>
        <Text fontSize={{ base: "md", md: "lg" }} color="gray.600" maxW="2xl">
          The Prince Hall Online Registry of Merchants. Search for a service,
          call or visit in one tap, and share with your lodge.
        </Text>

        <Flex
          as="form"
          onSubmit={handleSearch}
          w={{ base: "100%", md: "75%" }}
          gap={2}
          direction={{ base: "column", sm: "row" }}
          pt={2}
        >
          <InputGroup size="lg">
            <InputLeftElement pointerEvents="none">
              <Icon as={FaSearch} color="gray.400" />
            </InputLeftElement>
            <Input
              type="search"
              enterKeyHint="search"
              placeholder="What do you need? e.g. plumber, attorney"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search businesses"
              bg="white"
            />
          </InputGroup>
          <Button type="submit" size="lg" colorScheme="blue" px={8}>
            Search
          </Button>
        </Flex>

        <Wrap justify="center" spacing={2}>
          {BUSINESS_CATEGORIES.slice(0, 8).map((c) => (
            <WrapItem key={c}>
              <Button
                as={Link}
                href={`/list?category=${encodeURIComponent(c)}`}
                size="sm"
                borderRadius="full"
                variant="outline"
                colorScheme="blue"
              >
                {c}
              </Button>
            </WrapItem>
          ))}
        </Wrap>

        <HStack spacing={3} pt={2}>
          <Button as={Link} href="/map" leftIcon={<Icon as={MdMap} />}>
            Map
          </Button>
          <Button
            as={Link}
            href="/list"
            leftIcon={<Icon as={MdList} />}
            variant="outline"
          >
            Browse all
          </Button>
          <Button
            leftIcon={<Icon as={FaPlus} />}
            variant="ghost"
            colorScheme="blue"
            onClick={handleAddBusiness}
          >
            Add yours
          </Button>
        </HStack>
      </VStack>

      <VStack align="stretch" spacing={4}>
        <Heading as="h2" size="md">
          Recently added
        </Heading>
        {isLoading ? (
          <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} spacing={6}>
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} height="260px" borderRadius="lg" />
            ))}
          </SimpleGrid>
        ) : !featured?.length ? (
          <Box
            textAlign="center"
            py={10}
            px={6}
            bg={emptyBg}
            borderRadius="lg"
            borderWidth="1px"
            borderColor={emptyBorder}
          >
            <Icon as={FaBuilding} boxSize={12} color="blue.400" mb={4} />
            <Heading size="md" mb={2}>
              No businesses listed yet
            </Heading>
            <Text color="gray.600" maxW="450px" mx="auto" mb={6}>
              Be the first to list your business on PHORM and reach the
              community!
            </Text>
            <Button
              colorScheme="blue"
              leftIcon={<Icon as={FaPlus} />}
              onClick={handleAddBusiness}
            >
              Add your business
            </Button>
          </Box>
        ) : (
          <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} spacing={6}>
            {featured.map((listing) => (
              <BusinessCard key={listing.id} activeListing={listing} />
            ))}
          </SimpleGrid>
        )}
      </VStack>

      <Stack
        mt={12}
        p={6}
        borderRadius="lg"
        bg="mwphgldc.blue.50"
        direction={{ base: "column", md: "row" }}
        align="center"
        justify="space-between"
        spacing={4}
      >
        <Box>
          <Heading size="md">Own a business?</Heading>
          <Text color="gray.600">
            List it for free in about two minutes. Members across the
            jurisdiction can find you.
          </Text>
        </Box>
        <Button colorScheme="blue" size="lg" onClick={handleAddBusiness}>
          Add your business
        </Button>
      </Stack>

      <AddListingDrawer
        drawerIsOpen={drawerIsOpen}
        firstField={firstField}
        onDrawerClose={onDrawerClose}
      />
    </Container>
  );
}
