import { IUser } from "@/types";
import { AddIcon } from "@chakra-ui/icons";
import { Button, Card, Heading, Icon, Stack, VStack } from "@chakra-ui/react";
import { signIn } from "next-auth/react";
import { BsCollection } from "react-icons/bs";
import MemberCard from "./MemberCard";

export default function MemberList({ members }: { members: IUser[] }) {
  return !members ? (
    <Card align="center" p={3}>
      <Heading pb={3}>No Members Yet...</Heading>
      <Button
        variant={"solid"}
        colorScheme={"mwphgldc.blue"}
        onClick={() => signIn()}
        size={"sm"}
        mr={4}
        leftIcon={<AddIcon />}
      >
        Be The First!
      </Button>
    </Card>
  ) : (
    <VStack spacing={3} marginBlock={3}>
      <Heading fontSize="2xl" mb={4}>
        <Icon as={BsCollection} marginInline={5} />
        Member Directory
      </Heading>
      <Stack spacing={4} direction={{ base: "column", sm: "row" }}>
        {members.map((member) => (
          <MemberCard user={member} key={member.id} />
        ))}
      </Stack>
    </VStack>
  );
}
