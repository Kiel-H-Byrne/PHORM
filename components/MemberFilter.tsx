import { MemberQuery } from "@/types";
import {
  Button,
  FormControl,
  Input,
  Select,
  Text,
  VStack,
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
    <VStack>
      <Text as={"h2"}>Search Member Directory</Text>
      <FormControl>
        <Input
          placeholder="Search members"
          value={searchParams.email}
          onChange={(e) => setSearchParams({ email: e.target.value })}
        />
        <Select
          placeholder="Select location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        >
          <option value="DC">Washington, DC</option>
          <option value="MD">Maryland</option>
          <option value="VA">Virginia</option>
        </Select>
        <Button onClick={handleSearch}>Search</Button>
      </FormControl>
    </VStack>
  );
}
