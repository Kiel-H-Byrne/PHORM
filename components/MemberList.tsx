import { IUser } from "@/types";
import { Grid, Icon, Text, VStack } from "@chakra-ui/react";
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
      <Text fontSize="2xl" mb={4} as={"h2"}>
        <Icon as={BsCollection} /> Member Directory
      </Text>

      <Grid templateColumns="repeat(3, 1fr)" gap={4}>
        {members.map((member) => (
          <MemberCard user={member} key={member.id} />
        ))}
      </Grid>
    </VStack>
  );
}
