import { useAuth } from "@/contexts/AuthContext";
import { IListing } from "@/types";
import {
  Badge,
  Box,
  Card,
  CardBody,
  Flex,
  HStack,
  IconButton,
  Image,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Text,
  Tooltip,
  chakra,
  useColorModeValue,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { useState } from "react";
import {
  MdBookmark,
  MdBookmarkBorder,
  MdDirections,
  MdEmail,
  MdInfo,
  MdPhone,
  MdShare,
} from "react-icons/md";

const AnimatedCard = chakra(Card, {
  baseStyle: {
    transition: "all 0.2s ease-in-out",
  },
});

export default function ListingCard2({
  listing,
  onFavorite,
}: {
  listing: IListing;
  onFavorite?: (listing: IListing) => void;
}) {
  const { user } = useAuth();
  const [isFavorited, setIsFavorited] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const textColor = useColorModeValue("gray.600", "gray.300");

  const handleFavorite = () => {
    setIsFavorited(!isFavorited);
    onFavorite?.(listing);
    toast({
      title: isFavorited ? "Removed from favorites" : "Added to favorites",
      status: "success",
      duration: 2000,
    });
  };

  const handleContact = async (method: "phone" | "email") => {
    if (method === "phone" && listing.phone) {
      window.location.href = `tel:${listing.phone}`;
    } else if (method === "email" && listing.email) {
      window.location.href = `mailto:${listing.email}`;
    }
  };

  const handleDirections = () => {
    if (listing.lat && listing.lng) {
      window.open(
        `https://www.google.com/maps/dir/?api=1&destination=${listing.lat},${listing.lng}`,
        "_blank"
      );
    } else {
      window.open(
        `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          listing.address
        )}`,
        "_blank"
      );
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: listing.name,
          text: listing.description,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast({
          title: "Link copied to clipboard",
          status: "success",
          duration: 2000,
        });
      }
    } catch (err) {
      console.error("Error sharing:", err);
    }
  };

  return (
    <>
      <AnimatedCard
        bg={cardBg}
        borderWidth="1px"
        borderColor={borderColor}
        borderRadius="lg"
        overflow="hidden"
        _hover={{ transform: "translateY(-4px)", boxShadow: "lg" }}
      >
        <Box position="relative">
          <Image
            src={listing.imageUri || "/placeholder-business.jpg"}
            alt={listing.name}
            height="200px"
            width="100%"
            objectFit="cover"
            fallbackSrc="/placeholder-business.jpg"
          />
          {listing.isPremium && (
            <Badge
              position="absolute"
              top={2}
              right={2}
              colorScheme="yellow"
              variant="solid"
            >
              Premium
            </Badge>
          )}
        </Box>

        <CardBody p={4}>
          <Flex justify="space-between" align="start" mb={2}>
            <Box>
              <Text fontSize="xl" fontWeight="bold" mb={1}>
                {listing.name}
              </Text>
              <Text color={textColor} fontSize="sm" noOfLines={2}>
                {listing.description}
              </Text>
            </Box>
            {user && (
              <IconButton
                aria-label={
                  isFavorited ? "Remove from favorites" : "Add to favorites"
                }
                icon={isFavorited ? <MdBookmark /> : <MdBookmarkBorder />}
                onClick={handleFavorite}
                variant="ghost"
                colorScheme="blue"
              />
            )}
          </Flex>

          <Text fontSize="sm" color={textColor} mb={3}>
            {listing.address}
          </Text>

          <Flex wrap="wrap" gap={2} mb={4}>
            {listing.categories?.map((category) => (
              <Badge key={category} colorScheme="blue" variant="subtle">
                {category}
              </Badge>
            ))}
          </Flex>

          <HStack spacing={2} justify="flex-end">
            {listing.phone && (
              <Tooltip label="Call">
                <IconButton
                  aria-label="Call business"
                  icon={<MdPhone />}
                  onClick={() => handleContact("phone")}
                  colorScheme="green"
                  variant="ghost"
                />
              </Tooltip>
            )}
            {listing.email && (
              <Tooltip label="Email">
                <IconButton
                  aria-label="Email business"
                  icon={<MdEmail />}
                  onClick={() => handleContact("email")}
                  colorScheme="blue"
                  variant="ghost"
                />
              </Tooltip>
            )}
            <Tooltip label="Details">
              <IconButton
                aria-label="View details"
                icon={<MdInfo />}
                onClick={onOpen}
                colorScheme="purple"
                variant="ghost"
              />
            </Tooltip>
            <Tooltip label="Get Directions">
              <IconButton
                aria-label="Get directions"
                icon={<MdDirections />}
                onClick={handleDirections}
                colorScheme="blue"
                variant="ghost"
              />
            </Tooltip>
            <Tooltip label="Share">
              <IconButton
                aria-label="Share listing"
                icon={<MdShare />}
                onClick={handleShare}
                colorScheme="blue"
                variant="ghost"
              />
            </Tooltip>
          </HStack>
        </CardBody>
      </AnimatedCard>

      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{listing.name}</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <Image
              src={listing.imageUri || "/placeholder-business.jpg"}
              alt={listing.name}
              width="100%"
              height="300px"
              objectFit="cover"
              borderRadius="md"
              mb={4}
            />
            <Text mb={4}>{listing.description}</Text>
            <Text fontWeight="bold" mb={2}>
              Contact Information:
            </Text>
            {listing.phone && <Text mb={2}>📞 {listing.phone}</Text>}
            {listing.email && <Text mb={2}>📧 {listing.email}</Text>}
            <Text mb={4}>📍 {listing.address}</Text>
            {listing.businessHours && (
              <>
                <Text fontWeight="bold" mb={2}>
                  Business Hours:
                </Text>
                <Text whiteSpace="pre-line">{listing.businessHours}</Text>
              </>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}
