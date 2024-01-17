import { IUser, PHA_LODGES } from "@/types";
import {
  Avatar,
  Box,
  Button,
  HStack,
  Heading,
  Link,
  Text,
  VStack,
} from "@chakra-ui/react";

function MemberCard({ user }: { user: IUser }) {
  const {
    firstName,
    lastName,
    profilePhoto,
    lodgeNumber = 10,
    occupation,
    location,
    bio,
  } = user.profile;

  return (
    <VStack borderWidth="1px" p={4} rounded="md" spacing={3}>
      <HStack align="center">
        <Avatar src={profilePhoto} />
        <Box ml={3}>
          <Heading size="md">
            {firstName || "Jimothy"} {lastName || "LaCraQuis"}
          </Heading>
          {lodgeNumber && (
            <Text>
              {PHA_LODGES["DC"][lodgeNumber]}{" "}
              Lodge #{`${lodgeNumber}`}
            </Text>
          )}
        </Box>
      </HStack>
      <Text fontSize={12} color="royalblue">
        {occupation || "Random Occupation"}
      </Text>
      <Text fontSize={12} color="grey">
        {location || "Washington, DC"}
      </Text>

      {bio && <Text>{bio.substring(0, 100)}...</Text>}
      <Text>
        {"sample bio for the beginning which could seem long in order to get cropped by the substring, then we can really see the potential of the function and the memberCard".substring(
          0,
          100
        )}
        ...
      </Text>
      <Link href={`/member/${user.id}`}>
        <Button size={"sm"}>View Profile</Button>
      </Link>
    </VStack>
  );
}
export default MemberCard;
