import MemberFilter from "@/components/MemberFilter";
import MemberList from "@/components/MemberList";
import { Grid, Text } from "@chakra-ui/react";

export default function MemberDirectory() {
  return (
    <Grid templateColumns="repeat(3, 1fr)" gap={4}>
      <MemberFilter />
      <MemberList />
      <Text>Sidebar for ads or other info</Text>
    </Grid>
  );
}
