import { EditListingModal } from "@/components/forms";
import { useAuth } from "@/contexts/AuthContext";
import { getListing, isVisible, toPublicListing } from "@/db/listingsAdmin";
import { IListing } from "@/types";
import { trackEvent } from "@/util/analytics";
import { SITE_URL, SUPPORT_EMAIL } from "@/util/constants";
import {
  directionsUrl,
  externalUrl,
  listingPath,
  shareListing,
} from "@/util/share";
import {
  Badge,
  Box,
  Button,
  Container,
  Divider,
  Heading,
  Icon,
  Image,
  Link,
  SimpleGrid,
  Stack,
  Text,
  Wrap,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { GetServerSideProps } from "next";
import Head from "next/head";
import NextLink from "next/link";
import { useRouter } from "next/router";
import { useEffect } from "react";
import {
  FaDirections,
  FaEdit,
  FaEnvelope,
  FaFacebook,
  FaGlobe,
  FaInstagram,
  FaMapMarkedAlt,
  FaPhone,
  FaShareAlt,
  FaTwitter,
} from "react-icons/fa";

type Props = { listing: IListing; origin: string };

export const getServerSideProps: GetServerSideProps<Props> = async ({
  params,
  req,
}) => {
  const id = String(params?.id || "");
  const found = id ? await getListing(id) : null;
  if (!found || !isVisible(found.data)) return { notFound: true };
  const proto = (req.headers["x-forwarded-proto"] as string) || "https";
  const origin = SITE_URL || `${proto}://${req.headers.host}`;
  return {
    props: {
      // JSON round-trip drops undefined values, which Next can't serialize.
      listing: JSON.parse(
        JSON.stringify(toPublicListing(found.id, found.data))
      ),
      origin,
    },
  };
};

export default function ListingPage({ listing, origin }: Props) {
  const { user } = useAuth();
  const toast = useToast();
  const router = useRouter();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const closeEditor = () => {
    onClose();
    // Re-run getServerSideProps so saved edits (or a removal) show immediately.
    router.replace(router.asPath);
  };
  const ownerId =
    typeof listing.creator === "object" ? listing.creator?.id : listing.creator;
  const isOwner = !!user && user.uid === ownerId;
  const location = [listing.city, listing.state].filter(Boolean).join(", ");
  const pageUrl = `${origin}${listingPath(listing)}`;
  const summary =
    listing.description ||
    `${listing.categories?.[0] ?? "Business"} in ${location}`;

  useEffect(() => {
    trackEvent("listing_view", {
      listingId: listing.id,
      category: listing.categories?.[0],
    });
  }, [listing.id, listing.categories]);

  const contact = (method: string) =>
    trackEvent("contact_click", { method, listingId: listing.id });

  const handleShare = async () => {
    const result = await shareListing(listing);
    if (result === "copied") {
      toast({ title: "Link copied", status: "success", duration: 2000 });
    }
  };

  const social: Partial<Record<"facebook" | "instagram" | "twitter", string>> =
    listing.social || {};
  const reportHref = SUPPORT_EMAIL
    ? `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(
        `PHORM listing: ${listing.name} (${listing.id})`
      )}`
    : null;

  return (
    <>
      <Head>
        <title key="title">{`${listing.name} | PHORM`}</title>
        <meta name="description" content={summary} key="description" />
        <meta property="og:title" content={listing.name} key="og:title" />
        <meta
          property="og:description"
          content={summary}
          key="og:description"
        />
        <meta property="og:url" content={pageUrl} key="og:url" />
        {listing.imageUri && (
          <meta property="og:image" content={listing.imageUri} key="og:image" />
        )}
        <link rel="canonical" href={pageUrl} />
      </Head>

      <Container maxW="3xl" py={{ base: 4, md: 10 }} px={{ base: 0, md: 4 }}>
        {listing.imageUri && (
          <Image
            src={listing.imageUri}
            alt={listing.name}
            w="100%"
            maxH="280px"
            objectFit="cover"
            borderRadius="lg"
            mb={6}
          />
        )}

        <Stack spacing={3} mb={6}>
          <Heading as="h1" size="xl">
            {listing.name}
          </Heading>
          {location && <Text color="gray.600">{location}</Text>}
          <Wrap>
            {listing.categories?.map((c) => (
              <Badge key={c} colorScheme="blue" variant="subtle">
                {c}
              </Badge>
            ))}
          </Wrap>
          {listing.description && (
            <Text fontSize="lg" whiteSpace="pre-line">
              {listing.description}
            </Text>
          )}
        </Stack>

        <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={3} mb={6}>
          {listing.phone && (
            <Button
              as="a"
              href={`tel:${listing.phone}`}
              onClick={() => contact("phone")}
              leftIcon={<Icon as={FaPhone} />}
              colorScheme="green"
              size="lg"
            >
              Call {listing.phone}
            </Button>
          )}
          {listing.email && (
            <Button
              as="a"
              href={`mailto:${listing.email}`}
              onClick={() => contact("email")}
              leftIcon={<Icon as={FaEnvelope} />}
              colorScheme="blue"
              size="lg"
            >
              Email
            </Button>
          )}
          {listing.url && (
            <Button
              as="a"
              href={externalUrl(listing.url)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => contact("website")}
              leftIcon={<Icon as={FaGlobe} />}
              variant="outline"
              size="lg"
            >
              Website
            </Button>
          )}
          <Button
            as="a"
            href={directionsUrl(listing)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => contact("directions")}
            leftIcon={<Icon as={FaDirections} />}
            variant="outline"
            size="lg"
          >
            Directions
          </Button>
          <Button
            onClick={handleShare}
            leftIcon={<Icon as={FaShareAlt} />}
            variant="outline"
            size="lg"
          >
            Share
          </Button>
          {listing.lat && listing.lng && (
            <Button
              as={NextLink}
              href={`/map?center=${listing.lat},${listing.lng}`}
              leftIcon={<Icon as={FaMapMarkedAlt} />}
              variant="outline"
              size="lg"
            >
              See on map
            </Button>
          )}
        </SimpleGrid>

        <Stack spacing={4}>
          {listing.address && (
            <Box>
              <Text fontWeight="bold">Address</Text>
              <Text>{listing.address}</Text>
            </Box>
          )}
          {listing.businessHours && (
            <Box>
              <Text fontWeight="bold">Hours</Text>
              <Text whiteSpace="pre-line">{listing.businessHours}</Text>
            </Box>
          )}
          {(social.facebook || social.instagram || social.twitter) && (
            <Wrap spacing={4}>
              {social.facebook && (
                <Link href={externalUrl(social.facebook)} isExternal>
                  <Icon as={FaFacebook} boxSize={6} aria-label="Facebook" />
                </Link>
              )}
              {social.instagram && (
                <Link href={externalUrl(social.instagram)} isExternal>
                  <Icon as={FaInstagram} boxSize={6} aria-label="Instagram" />
                </Link>
              )}
              {social.twitter && (
                <Link href={externalUrl(social.twitter)} isExternal>
                  <Icon as={FaTwitter} boxSize={6} aria-label="X / Twitter" />
                </Link>
              )}
            </Wrap>
          )}
        </Stack>

        {isOwner && (
          <>
            <Button
              mt={8}
              leftIcon={<Icon as={FaEdit} />}
              colorScheme="teal"
              variant="outline"
              onClick={onOpen}
            >
              Edit your listing
            </Button>
            <EditListingModal
              isOpen={isOpen}
              onClose={closeEditor}
              onDeleted={() => router.push("/dashboard")}
              listingId={listing.id!}
            />
          </>
        )}

        <Divider my={8} />
        <Stack
          direction={{ base: "column", sm: "row" }}
          justify="space-between"
          fontSize="sm"
          color="gray.600"
        >
          <Link as={NextLink} href="/list">
            ← Browse all businesses
          </Link>
          {reportHref && !isOwner && (
            <Link href={reportHref}>
              Is this your business, or is something wrong? Let us know
            </Link>
          )}
        </Stack>
      </Container>
    </>
  );
}
