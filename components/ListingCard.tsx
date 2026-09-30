import { useAuth } from "@/contexts/AuthContext";
import { IListing } from "@/types";
import { trackEvent } from "@/util/analytics";
import { directionsUrl, listingPath, shareListing } from "@/util/share";
import {
  Badge,
  Box,
  Button,
  Divider,
  Flex,
  HStack,
  Heading,
  Icon,
  Text,
  VStack,
  Wrap,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import NextLink from "next/link";
import {
  FaDirections,
  FaEdit,
  FaInfoCircle,
  FaMapMarkerAlt,
  FaPhone,
  FaShare,
} from "react-icons/fa";
import { EditListingModal } from "./forms";

interface ListingCardProps {
  activeListing: IListing;
  showActions?: boolean;
}

const ListingCard = ({
  activeListing,
  showActions = true,
}: ListingCardProps) => {
  const { user } = useAuth();
  const toast = useToast();
  const {
    isOpen: isEditModalOpen,
    onOpen: onOpenEditModal,
    onClose: onCloseEditModal,
  } = useDisclosure();

  const ownerId =
    typeof activeListing.creator === "object"
      ? activeListing.creator?.id
      : activeListing.creator;
  const isCreator = !!user && ownerId === user.uid;
  const { name, address, description, imageUri, categories, phone } =
    activeListing;

  const handleShare = async () => {
    if ((await shareListing(activeListing)) === "copied") {
      toast({ title: "Link copied", status: "success", duration: 2000 });
    }
  };

  return (
    <Box
      bg="white"
      borderWidth="1px"
      borderRadius="lg"
      boxShadow="md"
      overflow="hidden"
      maxW="400px"
      width="100%"
    >
      {imageUri && (
        <Box
          h="140px"
          bgImage={`url(${imageUri})`}
          backgroundSize="cover"
          backgroundPosition="center"
        />
      )}

      <VStack align="stretch" p={4} spacing={3}>
        <Box>
          <Heading
            as={NextLink}
            href={listingPath(activeListing)}
            fontSize="xl"
            fontWeight="bold"
            noOfLines={2}
          >
            {name}
          </Heading>
          {address && (
            <Flex align="center" mt={1}>
              <Icon as={FaMapMarkerAlt} color="gray.500" mr={1} />
              <Text fontSize="sm" color="gray.500" noOfLines={1}>
                {address}
              </Text>
            </Flex>
          )}
          {categories && categories.length > 0 && (
            <Wrap mt={2}>
              {categories.map((c) => (
                <Badge key={c} colorScheme="blue" variant="subtle">
                  {c}
                </Badge>
              ))}
            </Wrap>
          )}
        </Box>

        {description && (
          <>
            <Divider />
            <Text fontSize="sm" noOfLines={3} color="gray.700">
              {description}
            </Text>
          </>
        )}

        {showActions && (
          <HStack spacing={2} mt={2} flexWrap="wrap">
            {phone && (
              <Button
                as="a"
                href={`tel:${phone}`}
                onClick={() =>
                  trackEvent("contact_click", {
                    method: "phone",
                    listingId: activeListing.id,
                  })
                }
                leftIcon={<Icon as={FaPhone} />}
                colorScheme="green"
                size="sm"
                flex={1}
              >
                Call
              </Button>
            )}
            <Button
              as="a"
              href={directionsUrl(activeListing)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() =>
                trackEvent("contact_click", {
                  method: "directions",
                  listingId: activeListing.id,
                })
              }
              leftIcon={<Icon as={FaDirections} />}
              colorScheme="blue"
              size="sm"
              flex={1}
            >
              Directions
            </Button>
            <Button
              leftIcon={<Icon as={FaShare} />}
              size="sm"
              flex={1}
              onClick={handleShare}
            >
              Share
            </Button>
          </HStack>
        )}

        <Button
          as={NextLink}
          href={listingPath(activeListing)}
          leftIcon={<Icon as={FaInfoCircle} />}
          size="sm"
          variant="outline"
        >
          View details
        </Button>

        {isCreator && activeListing.id && (
          <>
            <Button
              leftIcon={<Icon as={FaEdit} />}
              colorScheme="teal"
              size="sm"
              variant="outline"
              onClick={onOpenEditModal}
            >
              Edit listing
            </Button>
            <EditListingModal
              isOpen={isEditModalOpen}
              onClose={onCloseEditModal}
              listingId={activeListing.id}
            />
          </>
        )}
      </VStack>
    </Box>
  );
};

export default ListingCard;
