import { IUser } from "@/types";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  HStack,
  Heading,
  Link,
  Text,
} from "@chakra-ui/react";

function MemberCard({ user }: { user: IUser }) {
  const { firstName, lastName, profilePhoto, orgs, occupation, location, bio } =
    user.profile;

  return (
    // <VStack borderWidth="1px" p={4} rounded="md" spacing={3}>
    <Card borderWidth="1px" p={4} rounded="md" maxW={"sm"}>
      <CardHeader>Member Profile</CardHeader>
      <CardBody>
        <HStack align="center">
          <Avatar src={profilePhoto} />
          <Box ml={3}>
            <Heading size="md">
              {firstName || "Jimothy"} {lastName || "LaCraQuis"}
            </Heading>
            {/* {lodgeOrChapterNumber && (
              <Text>
                {PHA_LODGES["DC"][orgs]} Lodge #
                {`${lodgeOrChapterNumber}`}
              </Text>
            )} */}
          </Box>
        </HStack>
        <Text fontSize={12} color="royalblue">
          {occupation || "Random Occupation"}
        </Text>
        <Text fontSize={12} color="grey">
          {location || "Washington, DC"}
        </Text>

        {bio && <Text>{bio.substring(0, 100)}...</Text>}
        <Text paddingBlock={3} fontFamily={"monospace"} fontSize={"small"}>
          {"sample bio for the beginning which could seem long in order to get cropped by the substring, then we can really see the potential of the function and the memberCard".substring(
            0,
            100
          )}
          ...
        </Text>
      </CardBody>

      <CardFooter>
        <Link href={`/member/${user.id}`}>
          <Button size={"sm"}>View Profile</Button>
        </Link>
      </CardFooter>
      {/* </VStack> */}
    </Card>
  );
}
export default MemberCard;
