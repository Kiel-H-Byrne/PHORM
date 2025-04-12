import { useAuth } from "@/contexts/AuthContext";
import { IClaims, IListing } from "@/types";
import {
  Badge,
  Box,
  Button,
  Collapse,
  Divider,
  Flex,
  HStack,
  Heading,
  Icon,
  Link,
  Text,
  Tooltip,
  VStack,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { useState } from "react";
import {
  FaDirections,
  FaEdit,
  FaHeart,
  FaMapMarkerAlt,
  FaPhone,
  FaShare,
  FaStar,
  FaUser,
} from "react-icons/fa";
import { EditListingModal } from "./forms";

interface ListingCardProps {
  activeListing: IListing;
  onVerify?: (listing: IListing) => void;
  showActions?: boolean;
  onEdit?: () => void;
}

const ListingCard = ({
  activeListing,
  onVerify,
  showActions = true,
}: ListingCardProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const { user } = useAuth();
  const toast = useToast();
  const {
    isOpen: isEditModalOpen,
    onOpen: onOpenEditModal,
    onClose: onCloseEditModal,
  } = useDisclosure();

  // Check if the current user is the creator of this listing
  const isCreator = user && activeListing.creator?.id === user.uid;

  const toggleCollapse = () => {
    setIsOpen(!isOpen);
  };

  const handleFavorite = () => {
    setIsFavorite(!isFavorite);

    toast({
      title: isFavorite ? "Removed from favorites" : "Added to favorites",
      status: "success",
      duration: 2000,
      isClosable: true,
    });
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: activeListing.name,
          text: `Check out ${activeListing.name} on PHORM!`,
          url: `${window.location.origin}/listing/${activeListing.place_id}`,
        })
        .catch(console.error);
    } else {
      // Fallback for browsers that don't support navigator.share
      navigator.clipboard.writeText(
        `${window.location.origin}/listing/${activeListing.place_id}`
      );
      toast({
        title: "Link copied to clipboard",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
    }
  };

  const handleGetDirections = () => {
    if (activeListing.lat && activeListing.lng) {
      window.open(
        `https://www.google.com/maps/dir/?api=1&destination=${activeListing.lat},${activeListing.lng}`,
        "_blank"
      );
    } else if (activeListing.address) {
      window.open(
        `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          activeListing.address
        )}`,
        "_blank"
      );
    }
  };

  const {
    name,
    address,
    description,
    claims,
    imageUri = "https://picsum.photos/640/360",
  } = activeListing;

  const getLikelyOwnerInfo = (claims: IClaims) =>
    claims && claims.length > 0 ? claims[0] : null;
  const ownerInfo = claims && getLikelyOwnerInfo(claims);
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
      {/* Image Header */}
      <Box
        h="160px"
        bg="rgba(0, 0, 0, 0.6)"
        bgImage={`url(${imageUri})`}
        backgroundSize="cover"
        backgroundPosition="center"
        backgroundBlendMode="multiply"
        position="relative"
      >
        {/* Verification Badge */}
        {claims && claims.length > 0 && (
          <Badge
            position="absolute"
            top="10px"
            right="10px"
            colorScheme="green"
            fontSize="0.8em"
            borderRadius="full"
            px={2}
            display="flex"
            alignItems="center"
          >
            <Icon as={FaStar} mr={1} /> Verified
          </Badge>
        )}
      </Box>

      {/* Content */}
      <VStack align="stretch" p={4} spacing={3}>
        <Box>
          <Heading fontSize="xl" fontWeight="bold" noOfLines={1}>
            {name}
          </Heading>
          <Flex align="center" mt={1}>
            <Icon as={FaMapMarkerAlt} color="gray.500" mr={1} />
            <Text fontSize="sm" color="gray.500" noOfLines={1}>
              {address}
            </Text>
          </Flex>
        </Box>

        <Divider />

        <Text fontSize="sm" noOfLines={3} color="gray.700">
          {description || "No description available."}
        </Text>

        {/* Owner Information */}
        {ownerInfo && (
          <Box>
            <Button
              size="sm"
              variant="ghost"
              onClick={toggleCollapse}
              width="100%"
              justifyContent="flex-start"
              leftIcon={<Icon as={FaUser} />}
              colorScheme="blue"
            >
              Owned by {ownerInfo?.member?.name || "Business Owner"}
            </Button>
            <Collapse in={isOpen} animateOpacity>
              <Box mt={2} p={3} bg="gray.50" borderRadius="md">
                <Text fontSize="sm">Verified business owner</Text>
                {ownerInfo?.member?.profile?.contact?.phone && (
                  <Flex align="center" mt={1}>
                    <Icon as={FaPhone} color="gray.500" mr={2} />
                    <Link
                      href={`tel:${ownerInfo.member.profile.contact.phone}`}
                      fontSize="sm"
                    >
                      {ownerInfo.member.profile.contact.phone}
                    </Link>
                  </Flex>
                )}
              </Box>
            </Collapse>
          </Box>
        )}

        {/* Action Buttons */}
        {showActions && (
          <>
            <HStack spacing={2} mt={2} justify="space-between">
              <Tooltip label="Get Directions">
                <Button
                  leftIcon={<Icon as={FaDirections} />}
                  colorScheme="blue"
                  size="sm"
                  flex={1}
                  onClick={handleGetDirections}
                >
                  Directions
                </Button>
              </Tooltip>

              <Tooltip
                label={
                  isFavorite ? "Remove from Favorites" : "Add to Favorites"
                }
              >
                <Button
                  leftIcon={<Icon as={FaHeart} />}
                  colorScheme={isFavorite ? "red" : "gray"}
                  variant={isFavorite ? "solid" : "outline"}
                  size="sm"
                  onClick={handleFavorite}
                >
                  {isFavorite ? "Saved" : "Save"}
                </Button>
              </Tooltip>

              <Tooltip label="Share">
                <Button
                  leftIcon={<Icon as={FaShare} />}
                  colorScheme="gray"
                  size="sm"
                  onClick={handleShare}
                >
                  Share
                </Button>
              </Tooltip>
            </HStack>

            {/* Edit button for listing creator */}
            {isCreator && (
              <Button
                leftIcon={<Icon as={FaEdit} />}
                colorScheme="teal"
                size="sm"
                variant="outline"
                width="100%"
                mt={2}
                onClick={onOpenEditModal}
              >
                Edit Listing
              </Button>
            )}

            {/* Edit Listing Modal */}
            {isCreator && activeListing.id && (
              <EditListingModal
                isOpen={isEditModalOpen}
                onClose={onCloseEditModal}
                listingId={activeListing.id}
              />
            )}
          </>
        )}
      </VStack>
    </Box>
  );
};

export default ListingCard;
