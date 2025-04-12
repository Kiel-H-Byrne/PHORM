import { useAuth } from "@/contexts/AuthContext";
import { findUserById } from "@/db/users";
import { IListing, IUser } from "@/types";
import {
  Avatar,
  Badge,
  Box,
  Button,
  Divider,
  Flex,
  Grid,
  Heading,
  Icon,
  Link,
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
  Tag,
  TagLabel,
  Text,
  VStack,
  useColorModeValue,
  useDisclosure,
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import {
  FaBriefcase,
  FaBuilding,
  FaCalendarAlt,
  FaEnvelope,
  FaGraduationCap,
  FaHeart,
  FaInfoCircle,
  FaLink,
  FaMapMarkerAlt as FaLocation,
  FaMapMarkerAlt,
  FaPhone,
  FaPlus,
  FaTools,
  FaUser,
  FaUserTie,
} from "react-icons/fa";
import ListingCard from "./ListingCard";
import { ClassYearMembers, EditProfileModal } from "./profile";

interface UserDashboardProps {
  userId?: string;
}

const UserDashboard = ({ userId }: UserDashboardProps) => {
  const { user } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [userListings, setUserListings] = useState<IListing[]>([]);
  const [favoriteListings, setFavoriteListings] = useState<IListing[]>([]);
  const [userData, setUserData] = useState<IUser | null>(null);
  const [classYear, setClassYear] = useState<number | null>(null);

  const { isOpen, onToggle, onClose } = useDisclosure();

  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  // Fetch user's data, listings and favorites
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user?.uid) return;

      try {
        setIsLoading(true);

        // Fetch user profile data
        const userData = await findUserById(user.uid);
        setUserData(userData as IUser);

        if (userData?.profile?.classYear) {
          setClassYear(userData.profile.classYear);
        }

        // Fetch user's listings
        const listingsResponse = await fetch(
          `/api/listings?creator=${user.uid}`
        );
        if (listingsResponse.ok) {
          const listingsData = await listingsResponse.json();
          setUserListings(listingsData.listings || []);
        }

        // Fetch user's favorites
        // In a real app, you would fetch this from your API
        // For now, we'll use an empty array
        setFavoriteListings([]);

        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching user data:", error);
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [userId, user]);

  const handleAddListing = () => {
    // Open the add listing drawer or navigate to add listing page
    router.push("/?addListing=true");
  };

  const handleEditProfile = () => {
    // Navigate to profile edit page or open modal
    onToggle();
  };

  return (
    <Box p={4} maxW="1200px" mx="auto">
      {/* User Profile Section */}
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
              src={
                userData?.profile?.profilePhoto || user?.photoURL || undefined
              }
              name={
                userData?.profile?.firstName && userData?.profile?.lastName
                  ? `${userData.profile.firstName} ${userData.profile.lastName}`
                  : user?.displayName ||
                    user?.email ||
                    user?.phoneNumber ||
                    undefined
              }
              mr={6}
            />
            <VStack align="flex-start" spacing={1}>
              <Heading size="lg">
                {userData?.profile?.firstName && userData?.profile?.lastName
                  ? `${userData.profile.firstName} ${userData.profile.lastName}`
                  : user?.displayName || "Welcome"}
                {userData?.profile?.nickName && (
                  <Text
                    as="span"
                    fontSize="md"
                    fontWeight="normal"
                    ml={2}
                    color="gray.500"
                  >
                    ({userData.profile.nickName})
                  </Text>
                )}
              </Heading>
              <Text color="gray.600">
                {user?.email || user?.phoneNumber || "User"}
              </Text>
              <Button
                leftIcon={<Icon as={FaUser} />}
                size="sm"
                variant="outline"
                mt={2}
                onClick={handleEditProfile}
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

        {/* Extended Profile Information */}
        {userData?.profile && (
          <Box mt={6} pt={6} borderTopWidth="1px" borderColor={borderColor}>
            <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={6}>
              {/* Left Column */}
              <Box>
                {/* Bio */}
                {userData.profile.bio && (
                  <Box mb={4}>
                    <Flex align="center" mb={2}>
                      <Icon as={FaInfoCircle} color="blue.500" mr={2} />
                      <Heading size="sm">About</Heading>
                    </Flex>
                    <Text fontSize="sm" color="gray.600">
                      {userData.profile.bio}
                    </Text>
                  </Box>
                )}

                {/* Contact Information */}
                <Box mb={4}>
                  <Flex align="center" mb={2}>
                    <Icon as={FaUser} color="blue.500" mr={2} />
                    <Heading size="sm">Contact Information</Heading>
                  </Flex>
                  <VStack align="start" spacing={2}>
                    {userData.profile.contact?.email && (
                      <Flex align="center">
                        <Icon
                          as={FaEnvelope}
                          color="gray.500"
                          mr={2}
                          boxSize={3}
                        />
                        <Link
                          href={`mailto:${userData.profile.contact.email}`}
                          fontSize="sm"
                          color="blue.500"
                        >
                          {userData.profile.contact.email}
                        </Link>
                      </Flex>
                    )}
                    {userData.profile.contact?.phone && (
                      <Flex align="center">
                        <Icon
                          as={FaPhone}
                          color="gray.500"
                          mr={2}
                          boxSize={3}
                        />
                        <Link
                          href={`tel:${userData.profile.contact.phone}`}
                          fontSize="sm"
                          color="blue.500"
                        >
                          {userData.profile.contact.phone}
                        </Link>
                      </Flex>
                    )}
                    {userData.profile.location && (
                      <Flex align="center">
                        <Icon
                          as={FaLocation}
                          color="gray.500"
                          mr={2}
                          boxSize={3}
                        />
                        <Text fontSize="sm">{userData.profile.location}</Text>
                      </Flex>
                    )}
                  </VStack>
                </Box>

                {/* Organizations */}
                {userData.profile.orgs && userData.profile.orgs.length > 0 && (
                  <Box mb={4}>
                    <Flex align="center" mb={2}>
                      <Icon as={FaBuilding} color="blue.500" mr={2} />
                      <Heading size="sm">Organizations</Heading>
                    </Flex>
                    <VStack align="start" spacing={2}>
                      {userData.profile.orgs.map((org, index) => (
                        <Box
                          key={index}
                          p={2}
                          bg="gray.50"
                          borderRadius="md"
                          width="100%"
                        >
                          <Text fontWeight="bold" fontSize="sm">
                            {org.name}
                          </Text>
                          <Flex fontSize="xs" color="gray.600">
                            <Text mr={2}>#{org.number}</Text>
                            <Text mr={2}>•</Text>
                            <Text>{org.state}</Text>
                            <Text ml={2}>•</Text>
                            <Text ml={2} textTransform="capitalize">
                              {org.type}
                            </Text>
                          </Flex>
                        </Box>
                      ))}
                    </VStack>
                  </Box>
                )}
              </Box>

              {/* Right Column */}
              <Box>
                {/* Professional Information */}
                <Box mb={4}>
                  {userData.profile.occupation && (
                    <Flex align="center" mb={3}>
                      <Icon
                        as={FaBriefcase}
                        color="gray.500"
                        mr={2}
                        boxSize={4}
                      />
                      <Text fontSize="sm">
                        <Text as="span" fontWeight="bold" mr={1}>
                          Occupation:
                        </Text>
                        {userData.profile.occupation}
                      </Text>
                    </Flex>
                  )}

                  {userData.profile.experienceLevel && (
                    <Flex align="center" mb={3}>
                      <Icon
                        as={FaUserTie}
                        color="gray.500"
                        mr={2}
                        boxSize={4}
                      />
                      <Text fontSize="sm">
                        <Text as="span" fontWeight="bold" mr={1}>
                          Experience:
                        </Text>
                        <Badge
                          colorScheme={
                            userData.profile.experienceLevel === "master"
                              ? "green"
                              : userData.profile.experienceLevel ===
                                "intermediate"
                              ? "blue"
                              : "purple"
                          }
                        >
                          {userData.profile.experienceLevel}
                        </Badge>
                      </Text>
                    </Flex>
                  )}

                  {userData.profile.availability && (
                    <Flex align="center" mb={3}>
                      <Icon
                        as={FaCalendarAlt}
                        color="gray.500"
                        mr={2}
                        boxSize={4}
                      />
                      <Text fontSize="sm">
                        <Text as="span" fontWeight="bold" mr={1}>
                          Availability:
                        </Text>
                        {userData.profile.availability}
                      </Text>
                    </Flex>
                  )}
                </Box>

                {/* Specialties */}
                {userData.profile.specialties &&
                  userData.profile.specialties.length > 0 && (
                    <Box mb={4}>
                      <Flex align="center" mb={2}>
                        <Icon as={FaTools} color="blue.500" mr={2} />
                        <Heading size="sm">Specialties</Heading>
                      </Flex>
                      <Flex wrap="wrap" gap={2}>
                        {userData.profile.specialties.map(
                          (specialty, index) => (
                            <Tag
                              key={index}
                              size="md"
                              colorScheme="blue"
                              borderRadius="full"
                            >
                              <TagLabel>{specialty}</TagLabel>
                            </Tag>
                          )
                        )}
                      </Flex>
                    </Box>
                  )}

                {/* Social Links */}
                {userData.profile.socialLinks &&
                  userData.profile.socialLinks.length > 0 && (
                    <Box mb={4}>
                      <Flex align="center" mb={2}>
                        <Icon as={FaLink} color="blue.500" mr={2} />
                        <Heading size="sm">Social Links</Heading>
                      </Flex>
                      <VStack align="start" spacing={2}>
                        {userData.profile.socialLinks.map((link, index) => (
                          <Link
                            key={index}
                            href={link}
                            isExternal
                            color="blue.500"
                            fontSize="sm"
                          >
                            {link.replace(/^https?:\/\//, "").split("/")[0]}
                          </Link>
                        ))}
                      </VStack>
                    </Box>
                  )}

                {/* Class Year */}
                {userData.profile.classYear && (
                  <Flex align="center" mb={3}>
                    <Icon
                      as={FaGraduationCap}
                      color="gray.500"
                      mr={2}
                      boxSize={4}
                    />
                    <Text fontSize="sm">
                      <Text as="span" fontWeight="bold" mr={1}>
                        Class Year:
                      </Text>
                      {userData.profile.classYear}
                    </Text>
                  </Flex>
                )}
              </Box>
            </Grid>
          </Box>
        )}
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
                    You haven't added any business listings yet.
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

      {/* Class Year Members Section */}
      {classYear && (
        <Box
          bg={bgColor}
          p={6}
          borderRadius="lg"
          boxShadow="md"
          borderWidth="1px"
          borderColor={borderColor}
          mt={8}
        >
          <Flex align="center" mb={4}>
            <Icon as={FaGraduationCap} mr={2} color="blue.500" boxSize={5} />
            <Heading size="md">Your Class</Heading>
          </Flex>
          <Divider mb={4} />

          <ClassYearMembers classYear={classYear} currentUserId={user?.uid} />
        </Box>
      )}
    </Box>
  );
};

export default UserDashboard;
