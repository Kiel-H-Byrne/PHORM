import { IUser } from "@/types";
import {
  Avatar,
  Box,
  Button,
  Flex,
  Heading,
  Link,
  SimpleGrid,
  Skeleton,
  Text,
  VStack,
  useColorModeValue,
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

interface ClassYearMembersProps {
  classYear: number;
  currentUserId?: string;
}

export const ClassYearMembers = ({
  classYear,
  currentUserId,
}: ClassYearMembersProps) => {
  const [members, setMembers] = useState<IUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  
  useEffect(() => {
    const fetchClassMembers = async () => {
      if (!classYear) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch(`/api/users/class/${classYear}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch class members: ${response.statusText}`);
        }
        
        const data = await response.json();
        setMembers(data.users || []);
      } catch (err) {
        console.error("Error fetching class members:", err);
        setError(err instanceof Error ? err.message : "Failed to load class members");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchClassMembers();
  }, [classYear]);
  
  const handleViewProfile = (userId: string) => {
    router.push(`/profile/${userId}`);
  };
  
  if (isLoading) {
    return (
      <Box mt={6}>
        <Heading as="h3" size="md" mb={4}>
          Class of {classYear}
        </Heading>
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} height="100px" borderRadius="md" />
          ))}
        </SimpleGrid>
      </Box>
    );
  }
  
  if (error) {
    return (
      <Box mt={6}>
        <Heading as="h3" size="md" mb={4}>
          Class of {classYear}
        </Heading>
        <Text color="red.500">{error}</Text>
      </Box>
    );
  }
  
  if (members.length === 0) {
    return (
      <Box mt={6}>
        <Heading as="h3" size="md" mb={4}>
          Class of {classYear}
        </Heading>
        <Text>No members found for this class year.</Text>
      </Box>
    );
  }
  
  return (
    <Box mt={6}>
      <Heading as="h3" size="md" mb={4}>
        Class of {classYear}
      </Heading>
      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
        {members.map((member) => (
          <Box
            key={member.id}
            p={4}
            borderWidth="1px"
            borderRadius="md"
            borderColor={borderColor}
            bg={bgColor}
            boxShadow="sm"
          >
            <Flex align="center">
              <Avatar
                size="md"
                name={`${member.profile?.firstName} ${member.profile?.lastName}`}
                src={member.image || undefined}
                mr={3}
              />
              <VStack align="start" spacing={0}>
                <Text fontWeight="bold">
                  {member.profile?.firstName} {member.profile?.lastName}
                </Text>
                <Text fontSize="sm" color="gray.500">
                  {member.profile?.location || "Location not specified"}
                </Text>
              </VStack>
            </Flex>
            
            {member.profile?.specialties && member.profile.specialties.length > 0 && (
              <Text fontSize="sm" mt={2} noOfLines={1}>
                <Text as="span" fontWeight="semibold">
                  Specialties:
                </Text>{" "}
                {member.profile.specialties.join(", ")}
              </Text>
            )}
            
            <Button
              size="sm"
              colorScheme="blue"
              variant="outline"
              mt={3}
              width="full"
              onClick={() => handleViewProfile(member.id)}
              isDisabled={member.id === currentUserId}
            >
              {member.id === currentUserId ? "Your Profile" : "View Profile"}
            </Button>
          </Box>
        ))}
      </SimpleGrid>
    </Box>
  );
};
