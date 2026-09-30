import { IListing } from "@/types";
import { trackEvent } from "@/util/analytics";
import { directionsUrl, listingPath, shareListing } from "@/util/share";
import {
  Badge,
  Card,
  CardBody,
  Flex,
  HStack,
  IconButton,
  Image,
  LinkBox,
  LinkOverlay,
  Text,
  Tooltip,
  useColorModeValue,
  useToast,
} from "@chakra-ui/react";
import NextLink from "next/link";
import { MdDirections, MdEmail, MdPhone, MdShare } from "react-icons/md";

const KM_PER_MILE = 1.609344;

export default function ListingCard2({
  activeListing,
}: {
  activeListing: IListing;
}) {
  const toast = useToast();
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const textColor = useColorModeValue("gray.600", "gray.300");

  const location =
    [activeListing.city, activeListing.state].filter(Boolean).join(", ") ||
    activeListing.address;
  const miles =
    typeof activeListing.distanceKm === "number"
      ? activeListing.distanceKm / KM_PER_MILE
      : undefined;

  const contact = (method: string) =>
    trackEvent("contact_click", { method, listingId: activeListing.id });

  const handleShare = async () => {
    if ((await shareListing(activeListing)) === "copied") {
      toast({ title: "Link copied", status: "success", duration: 2000 });
    }
  };

  return (
    <LinkBox
      as={Card}
      bg={cardBg}
      borderWidth="1px"
      borderColor={borderColor}
      borderRadius="lg"
      overflow="hidden"
      w="100%"
      h="100%"
      transition="all 0.2s ease-in-out"
      _hover={{ transform: "translateY(-2px)", boxShadow: "lg" }}
    >
      <Image
        src={activeListing.imageUri || "/img/placeholder-business.png"}
        alt=""
        height="120px"
        width="100%"
        objectFit="cover"
        fallbackSrc="/img/placeholder-business.png"
      />

      <CardBody p={4} display="flex" flexDirection="column" gap={2}>
        <LinkOverlay as={NextLink} href={listingPath(activeListing)}>
          <Text fontSize="lg" fontWeight="bold" noOfLines={2}>
            {activeListing.name}
          </Text>
        </LinkOverlay>
        <Text fontSize="sm" color={textColor}>
          {location}
          {miles !== undefined && ` · ${miles.toFixed(miles < 10 ? 1 : 0)} mi`}
        </Text>
        {activeListing.description && (
          <Text color={textColor} fontSize="sm" noOfLines={2}>
            {activeListing.description}
          </Text>
        )}
        <Flex wrap="wrap" gap={2}>
          {activeListing.categories?.slice(0, 3).map((category) => (
            <Badge key={category} colorScheme="blue" variant="subtle">
              {category}
            </Badge>
          ))}
        </Flex>

        {/* position/zIndex keep these clickable above the LinkOverlay */}
        <HStack spacing={1} mt="auto" pt={2} position="relative" zIndex={1}>
          {activeListing.phone && (
            <Tooltip label="Call">
              <IconButton
                as="a"
                href={`tel:${activeListing.phone}`}
                onClick={() => contact("phone")}
                aria-label={`Call ${activeListing.name}`}
                icon={<MdPhone />}
                colorScheme="green"
                variant="ghost"
              />
            </Tooltip>
          )}
          {activeListing.email && (
            <Tooltip label="Email">
              <IconButton
                as="a"
                href={`mailto:${activeListing.email}`}
                onClick={() => contact("email")}
                aria-label={`Email ${activeListing.name}`}
                icon={<MdEmail />}
                colorScheme="blue"
                variant="ghost"
              />
            </Tooltip>
          )}
          <Tooltip label="Directions">
            <IconButton
              as="a"
              href={directionsUrl(activeListing)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => contact("directions")}
              aria-label="Get directions"
              icon={<MdDirections />}
              colorScheme="blue"
              variant="ghost"
            />
          </Tooltip>
          <Tooltip label="Share">
            <IconButton
              aria-label="Share listing"
              icon={<MdShare />}
              onClick={handleShare}
              variant="ghost"
            />
          </Tooltip>
        </HStack>
      </CardBody>
    </LinkBox>
  );
}
