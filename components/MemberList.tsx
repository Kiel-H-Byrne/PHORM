import { IUser } from "@/types";
import { Button, Card, Heading, SimpleGrid, Text } from "@chakra-ui/react";
import NextLink from "next/link";
import MemberCard from "./MemberCard";

export default function MemberList({ members }: { members: IUser[] }) {
  return !members || members.length === 0 ? (
    <Card align="center" p={6} textAlign="center">
      <Heading size="md" pb={2}>
        No members found
      </Heading>
      <Text color="gray.600" pb={4}>
        Only members who choose to be listed appear here.
      </Text>
      <Button
        as={NextLink}
        href="/dashboard?editProfile=1"
        colorScheme="blue"
        size="sm"
      >
        Add yourself to the directory
      </Button>
    </Card>
  ) : (
    <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} spacing={4} w="100%">
      {members.map((member) => (
        <MemberCard user={member} key={member.id} />
      ))}
    </SimpleGrid>
  );
}
