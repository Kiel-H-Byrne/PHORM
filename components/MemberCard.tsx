import { IUser } from "@/types";
import { Avatar, Box, Button, Flex, Heading, Text } from "@chakra-ui/react";

function MemberCard({ user }: { user: IUser }) {
  const {
    firstName,
    lastName,
    profilePhoto,
    lodge,
    occupation,
    location,
    bio,
  } = user.profile;

  return (
    <Box borderWidth="1px" p={4} rounded="md">
      <Flex align="center">
        <Avatar src={profilePhoto} />
        <Box ml={3}>
          <Heading size="md">
            {firstName} {lastName}
          </Heading>
          <Text>{lodge}</Text>
        </Box>
      </Flex>

      <Text>{occupation}</Text>
      <Text>{location}</Text>

      <Text>{bio.substring(0, 100)}...</Text>

      <Button mt={3}>View Profile</Button>
    </Box>
  );
}
export default MemberCard;