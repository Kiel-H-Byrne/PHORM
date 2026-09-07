import AddListingDrawer from "@/components/AddListingDrawer";
import BusinessCard from "@/components/ListingCard2";
import { useAuth } from "@/contexts/AuthContext";
import { IListing } from "@/types";
import fetcher from "@/util/fetch";
import {
  Box,
  Button,
  Container,
  Grid,
  GridItem,
  Heading,
  HStack,
  Icon,
  Image,
  Stack,
  Text,
  VStack,
  useColorModeValue,
  useDisclosure,
} from "@chakra-ui/react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useRef, useState } from "react";
import { FaBuilding, FaPlus } from "react-icons/fa";
import { MdList, MdMap } from "react-icons/md";
import SWR from "swr";

/**
 * Homepage
 * A friendly landing page for members to find businesses and add their own.
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

  const { data: featured } = SWR<IListing[]>("/api/listings", fetcher);

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    const q = query.trim();
    router.push(q ? `/list?searchQuery=${encodeURIComponent(q)}` : "/list");
  };

  const handleAddBusiness = () => {
    if (user) {
      onDrawerOpen();
    } else {
      router.push("/auth/login");
    }
  };

  return (
    <Container maxW="6xl" py={{ base: 8, md: 12 }}>
      {/* About */}
      <VStack spacing={3} p={{ base: 0, small: 5 }} mb={{ base: 8, md: 12 }}>
        <Heading
          textAlign="center"
          as={"h1"}
          fontSize={{ base: "xl", md: "2xl" }}
          width="full"
        >
          Welcome to The{" "}
          <Text as="span" color="royalblue">
            P
          </Text>
          rince{" "}
          <Text as="span" color="royalblue">
            H
          </Text>
          all{" "}
          <Text as="span" color="royalblue">
            O
          </Text>
          nline{" "}
          <Text as="span" color="royalblue">
            R
          </Text>
          egistry of{" "}
          <Text as="span" color="royalblue">
            M
          </Text>
          erchants
        </Heading>
        <Heading
          size="sm"
          color="gray.500"
          fontStyle={"oblique"}
          mb={2}
          textAlign={"center"}
        >
          Connecting Communities, Empowering Entrepreneurs, Strengthening our
          Brotherhood
        </Heading>
        <Stack
          direction={{ base: "column", md: "row" }}
          px={{ base: 3, sm: 10 }}
          spacing={10}
          alignItems={"center"}
        >
          <Image
            src={"/img/Logo1.png"}
            aspectRatio={0.787}
            height={{ base: 24, md: 172 }}
            alt="logo"
          />
          <Text fontSize="lg" fontFamily={"body"}>
            Welcome to{" "}
            <Text as="span" fontWeight="bold" color="blue.600">
              The PHORM
            </Text>
            , the premier online directory dedicated to promoting and supporting
            businesses owned by individuals affiliated with Prince Hall
            Freemasonry. Immerse yourself in <i>the</i> platform that celebrates
            our shared bond while showcasing the talents and offerings of our
            esteemed PHAmily.
          </Text>
        </Stack>
      </VStack>

      {/* Hero */}
      <VStack spacing={4} align="stretch" mb={{ base: 8, md: 12 }}>
        <Heading as="h1" size="xl" textAlign="center">
          Find Your Community Business
        </Heading>
        <Text
          fontSize={{ base: "md", md: "lg" }}
          textAlign="center"
          color="gray.600"
        >
          Welcome to PHORM — a directory of Prince Hall–owned and supported
          businesses.
        </Text>

        {/* Search */}
        <Box
          as="form"
          onSubmit={handleSearch}
          mx="auto"
          w={{ base: "100%", md: "70%" }}
        >
          {/* <MapSearch
            layout="overlay"
            onSelectListing={(listing) => {
              const q = new URLSearchParams({ viewType: "map" });
              if (listing.lat && listing.lng)
                q.set("center", `${listing.lat},${listing.lng}`);
              router.push(`/?${q.toString()}`);
            }}
          /> */}
          <HStack mt={4} justify="center" spacing={4}>
            <Button
              as={Link}
              href="/map"
              size="lg"
              leftIcon={<Icon as={MdMap} />}
              colorScheme="blue"
            >
              View Map
            </Button>
            <Button
              as={Link}
              href={
                query
                  ? `/list?searchQuery=${encodeURIComponent(query)}`
                  : "/list"
              }
              size="lg"
              leftIcon={<Icon as={MdList} />}
              variant="outline"
            >
              View List
            </Button>
          </HStack>
        </Box>
      </VStack>

      {/* Featured */}
      <VStack align="stretch" spacing={4}>
        <Heading as="h2" size="lg">
          Featured Businesses
        </Heading>
        {featured && featured.length === 0 ? (
          <Box
            textAlign="center"
            py={10}
            px={6}
            bg={useColorModeValue("gray.50", "gray.850")}
            borderRadius="lg"
            borderWidth="1px"
            borderColor={useColorModeValue("gray.200", "gray.700")}
          >
            <Icon as={FaBuilding} boxSize={12} color="blue.400" mb={4} />
            <Heading size="md" mb={2}>
              No Businesses Listed Yet
            </Heading>
            <Text color="gray.600" maxW="450px" mx="auto" mb={6}>
              Be the first to list your business on PHORM and reach the community!
            </Text>
            <Button
              colorScheme="blue"
              leftIcon={<Icon as={FaPlus} />}
              onClick={handleAddBusiness}
            >
              Add Your Business
            </Button>
          </Box>
        ) : (
          <Grid
            templateColumns={{
              base: "1fr",
              sm: "repeat(2, 1fr)",
              md: "repeat(3, 1fr)",
            }}
            gap={6}
          >
            {featured?.slice(0, 6).map((listing) => (
              <GridItem key={listing.id ?? listing.name}>
                <BusinessCard activeListing={listing} />
              </GridItem>
            ))}
          </Grid>
        )}
      </VStack>

      <AddListingDrawer
        drawerIsOpen={drawerIsOpen}
        firstField={firstField}
        onDrawerClose={onDrawerClose}
      />
    </Container>
  );
}
