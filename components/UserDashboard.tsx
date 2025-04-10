import { useAuth } from "@/contexts/AuthContext";
import { IListing } from "@/types";
import {
  Avatar,
  Box,
  Button,
  Flex,
  Grid,
  Heading,
  Icon,
  SimpleGrid,
  Skeleton,
  Stat,
  StatGroup,
  StatLabel,
  StatNumber,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  VStack,
  useColorModeValue,
  useDisclosure,
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import { useState } from "react";
import {
  FaBuilding,
  FaHeart,
  FaMapMarkerAlt,
  FaPlus,
  FaUser,
} from "react-icons/fa";
import { EditProfileModal } from "./EditProfileModal";
import ListingCard from "./ListingCard";

interface UserDashboardProps {
  userId?: string;
}

const UserDashboard = ({ userId }: UserDashboardProps) => {
  const { user } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [userListings, setUserListings] = useState<IListing[]>([]);
  const [favoriteListings, setFavoriteListings] = useState<IListing[]>([]);

  const { isOpen, onToggle, onClose } = useDisclosure();

  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  const handleAddListing = () => {
    // Open the add listing drawer or navigate to add listing page
    // router.push("/?addListing=true");
  };

  return (
    <Box p={4} maxW="1200px" mx="auto">
      <Box
        bg={bgColor}
        p={6}
        borderRadius="lg"
        boxShadow="md"
        borderWidth="1px"
        borderColor={borderColor}
        mb={6}
      >
        <Flex
          direction={{ base: "column", md: "row" }}
          align={{ base: "center", md: "flex-start" }}
          justify="space-between"
        >
          <Flex align="center" mb={{ base: 4, md: 0 }}>
            <Avatar
              size="xl"
              src={user?.photoURL || undefined}
              name={
                user?.displayName ||
                user?.email ||
                user?.phoneNumber ||
                undefined
              }
              mr={6}
            />
            <VStack align="flex-start" spacing={1}>
              <Heading size="lg">{user?.displayName || "Welcome"}</Heading>
              <Text color="gray.600">
                {user?.email || user?.phoneNumber || "User"}
              </Text>
              <Button
                leftIcon={<Icon as={FaUser} />}
                size="sm"
                variant="outline"
                mt={2}
                onClick={onToggle}
              >
                Edit Profile
              </Button>
              <EditProfileModal
                isOpen={isOpen}
                onClose={onClose}
                onToggle={onToggle}
              />
            </VStack>
          </Flex>

          <StatGroup
            bg={useColorModeValue("blue.50", "blue.900")}
            p={4}
            borderRadius="md"
            minW={{ md: "300px" }}
            textAlign="center"
          >
            <Stat px={2}>
              <StatLabel>Listings</StatLabel>
              <StatNumber>
                {isLoading ? (
                  <Skeleton height="1.5rem" width="3rem" mx="auto" />
                ) : (
                  userListings.length
                )}
              </StatNumber>
            </Stat>
            <Stat px={2}>
              <StatLabel>Favorites</StatLabel>
              <StatNumber>
                {isLoading ? (
                  <Skeleton height="1.5rem" width="3rem" mx="auto" />
                ) : (
                  favoriteListings.length
                )}
              </StatNumber>
            </Stat>
          </StatGroup>
        </Flex>
      </Box>

      {/* Quick Actions */}
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mb={8}>
        <Button
          leftIcon={<Icon as={FaPlus} />}
          colorScheme="blue"
          size="lg"
          height="100px"
          onClick={handleAddListing}
        >
          Add New Business
        </Button>

        <Button
          leftIcon={<Icon as={FaMapMarkerAlt} />}
          colorScheme="teal"
          size="lg"
          height="100px"
          onClick={() => router.push("/")}
        >
          Explore Map
        </Button>

        <Button
          leftIcon={<Icon as={FaBuilding} />}
          colorScheme="purple"
          size="lg"
          height="100px"
          onClick={() => router.push("/member-directory")}
        >
          Member Directory
        </Button>
      </SimpleGrid>

      {/* Listings Tabs */}
      <Box
        bg={bgColor}
        p={6}
        borderRadius="lg"
        boxShadow="md"
        borderWidth="1px"
        borderColor={borderColor}
      >
        <Tabs colorScheme="blue" isLazy>
          <TabList>
            <Tab fontWeight="semibold">My Listings</Tab>
            <Tab fontWeight="semibold">Favorites</Tab>
          </TabList>

          <TabPanels>
            {/* My Listings Tab */}
            <TabPanel>
              {isLoading ? (
                <Grid
                  templateColumns={{
                    base: "1fr",
                    md: "repeat(2, 1fr)",
                    lg: "repeat(3, 1fr)",
                  }}
                  gap={6}
                >
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} height="300px" borderRadius="lg" />
                  ))}
                </Grid>
              ) : userListings.length > 0 ? (
                <Grid
                  templateColumns={{
                    base: "1fr",
                    md: "repeat(2, 1fr)",
                    lg: "repeat(3, 1fr)",
                  }}
                  gap={6}
                >
                  {userListings.map((listing) => (
                    <ListingCard key={listing.id} activeListing={listing} />
                  ))}
                </Grid>
              ) : (
                <Box textAlign="center" py={10}>
                  <Icon as={FaBuilding} boxSize={12} color="gray.300" mb={4} />
                  <Heading size="md" mb={2}>
                    No Listings Yet
                  </Heading>
                  <Text color="gray.500" mb={6}>
                    You haven&apos;t added any business listings yet.
                  </Text>
                  <Button
                    colorScheme="blue"
                    leftIcon={<Icon as={FaPlus} />}
                    onClick={handleAddListing}
                  >
                    Add Your First Listing
                  </Button>
                </Box>
              )}
            </TabPanel>

            {/* Favorites Tab */}
            <TabPanel>
              {isLoading ? (
                <Grid
                  templateColumns={{
                    base: "1fr",
                    md: "repeat(2, 1fr)",
                    lg: "repeat(3, 1fr)",
                  }}
                  gap={6}
                >
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} height="300px" borderRadius="lg" />
                  ))}
                </Grid>
              ) : favoriteListings.length > 0 ? (
                <Grid
                  templateColumns={{
                    base: "1fr",
                    md: "repeat(2, 1fr)",
                    lg: "repeat(3, 1fr)",
                  }}
                  gap={6}
                >
                  {favoriteListings.map((listing) => (
                    <ListingCard key={listing.id} activeListing={listing} />
                  ))}
                </Grid>
              ) : (
                <Box textAlign="center" py={10}>
                  <Icon as={FaHeart} boxSize={12} color="gray.300" mb={4} />
                  <Heading size="md" mb={2}>
                    No Favorites Yet
                  </Heading>
                  <Text color="gray.500" mb={6}>
                    You haven't saved any favorite businesses yet.
                  </Text>
                  <Button colorScheme="blue" onClick={() => router.push("/")}>
                    Explore Businesses
                  </Button>
                </Box>
              )}
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
    </Box>
  );
};

export default UserDashboard;
