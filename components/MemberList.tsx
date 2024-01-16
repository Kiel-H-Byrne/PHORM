import { IUser } from "@/types";
import { Box, Grid, Text } from "@chakra-ui/react";
import { BsCollection } from "react-icons/bs";
import MemberCard from "./MemberCard";

export default function MemberList() {
  const members: IUser[] = [];
  return (
    <Box>
      <Text fontSize="2xl" mb={4}>
        <BsCollection /> Member Directory
      </Text>

      <Grid templateColumns="repeat(3, 1fr)" gap={4}>
        {members.map((member) => (
          <MemberCard user={member} key={member.profile.id} />
        ))}
      </Grid>
    </Box>
  );
}
