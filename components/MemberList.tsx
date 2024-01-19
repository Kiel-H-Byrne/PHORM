import { IUser } from "@/types";
import { Heading, Icon, Stack, VStack } from "@chakra-ui/react";
import { BsCollection } from "react-icons/bs";
import MemberCard from "./MemberCard";

export default function MemberList({
  members,
  isLoading,
}: {
  members: IUser[];
  isLoading: Boolean;
}) {
  console.table(members);
  return !members ? (
    <>No Members</>
  ) : isLoading ? (
    <>Loading...</>
  ) : (
    <VStack spacing={3} marginBlock={3}>
      <Heading fontSize="2xl" mb={4}>
        <Icon as={BsCollection} marginInline={5} />
        Member Directory
      </Heading>

      <Stack spacing={4} direction={"row"}>
        {members.map((member) => (
          <MemberCard user={member} key={member.id} />
        ))}
      </Stack>
    </VStack>
  );
}
