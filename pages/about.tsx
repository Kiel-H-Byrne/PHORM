import { FeatureCard } from "@/components";
import {
  Box,
  Button,
  Container,
  Heading,
  Link,
  SimpleGrid,
  Stack,
  Text,
} from "@chakra-ui/react";
import Head from "next/head";
import NextLink from "next/link";
import { FaDraftingCompass, FaFistRaised, FaGem } from "react-icons/fa";

const feats = [
  {
    icon: FaGem,
    heading: "Uncover Hidden Gems",
    body: "Discover Prince Hall Affiliated businesses across the DMV and beyond. Explore enterprises rooted in community, service, and excellence.",
  },
  {
    icon: FaDraftingCompass,
    heading: "Verified and Trusted",
    body: "Listings can be connected to named members of the Craft. Shop and hire with confidence while strengthening our economic ecosystem.",
  },
  {
    icon: FaFistRaised,
    heading: "Empowering Our Brotherhood",
    body: "PHORM amplifies Black-owned entrepreneurship within Prince Hall Freemasonry—supporting owners, managers, and consultants.",
  },
];

const siteTitle = "About PHORM — Prince Hall Online Registry of Merchants";
const siteDesc =
  "PHORM is a map-based business directory for Prince Hall Freemasons. Find and support PHA-owned businesses, list your company, and grow our economic network.";

const AboutPage = () => {
  const ldJson = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "PHORM",
    url: "https://phorm.app/",
    description: siteDesc,
    potentialAction: {
      "@type": "SearchAction",
      target: "https://phorm.app/?searchQuery={search_term}",
      "query-input": "required name=search_term",
    },
  } as const;

  return (
    <>
      <Head>
        <title>{siteTitle}</title>
        <meta name="description" content={siteDesc} />
        <meta
          name="keywords"
          content="Prince Hall, business directory, PHA, PHORM, Black-owned businesses, DMV"
        />
        <link rel="canonical" href="https://phorm.app/about" />
        <meta property="og:title" content={siteTitle} />
        <meta property="og:description" content={siteDesc} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://phorm.app/about" />
        <meta property="og:site_name" content="PHORM" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={siteTitle} />
        <meta name="twitter:description" content={siteDesc} />
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ldJson) }}
        />
      </Head>

      <Container as="main" maxW="7xl" py={{ base: 8, md: 14 }}>
        {/* Hero */}
        <Stack spacing={6} textAlign={{ base: "left", md: "center" }}>
          <Heading as="h1" size="2xl" lineHeight={1.2}>
            About PHORM
          </Heading>
          <Text fontSize={{ base: "md", md: "lg" }} color="gray.600">
            The Prince Hall Online Registry of Merchants — a modern, searchable
            directory that helps you discover and support PHA-owned businesses.
          </Text>
          <Stack
            direction={{ base: "column", sm: "row" }}
            spacing={4}
            justify={{ md: "center" }}
          >
            <Button as={NextLink} href="/" colorScheme="blue" size="md">
              Explore Businesses
            </Button>
            <Button as={NextLink} href="/dashboard" variant="outline" size="md">
              Get Listed
            </Button>
          </Stack>
        </Stack>

        {/* Mission */}
        <Box mt={{ base: 10, md: 14 }}>
          <Heading as="h2" size="lg" mb={3}>
            Our Mission
          </Heading>
          <Text color="gray.700">
            PHORM exists to strengthen economic ties within Prince Hall
            Freemasonry. We make it easy to find, verify, and promote businesses
            owned or managed by our members, and to elevate consultants and
            service providers offering their expertise to the community.
          </Text>
        </Box>

        {/* Features */}
        <Box mt={{ base: 10, md: 14 }}>
          <Heading as="h2" size="lg" mb={6}>
            What You Can Do with PHORM
          </Heading>
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
            {feats.map((feature, i) => (
              <FeatureCard key={i} feature={feature} />
            ))}
          </SimpleGrid>
        </Box>

        {/* How it works */}
        <Box mt={{ base: 10, md: 14 }}>
          <Heading as="h2" size="lg" mb={3}>
            How It Works
          </Heading>
          <Text color="gray.700" mb={3}>
            - Browse the map or search for categories, services, and popular
            terms. - Add a business you own, manage, or promote your consulting
            services. - Offer friends-and-family benefits where applicable. -
            Keep your profile up-to-date so customers can connect with you.
          </Text>
          <Link as={NextLink} href="/privacy-and-terms" color="blue.600">
            Read our privacy and terms
          </Link>
        </Box>
      </Container>
    </>
  );
};

export default AboutPage;
