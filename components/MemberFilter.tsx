import { MemberQuery } from "@/types";
import {
  Button,
  FormControl,
  Input,
  Text,
  VStack
} from "@chakra-ui/react";
import { useState } from "react";
export default function MemberFilter({
  searchParams,
  setSearchParams,
  handleSearch,
}: {
  searchParams: MemberQuery;
  setSearchParams: (searchParams: MemberQuery) => void;
  handleSearch: () => void;
}) {
  const [location, setLocation] = useState("");

  return (
    <VStack spacing={2}>
      <Text as={"h2"} fontWeight={600} fontSize={'md'}>Search Member Directory</Text>
      <FormControl>
        <Input
          placeholder="Search members"
          value={searchParams.email}
          onChange={(e) => setSearchParams({ email: e.target.value })}
        />
        {/* <Select
          placeholder="Select location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        >
          <option value="DC">Washington, DC</option>
          <option value="MD">Maryland</option>
          <option value="VA">Virginia</option>
        </Select> */}
      </FormControl>
        <Button onClick={handleSearch} w="full">Search</Button>
    </VStack>
  );
}
