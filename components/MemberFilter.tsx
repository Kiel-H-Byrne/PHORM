import { MemberQuery } from "@/types";
import { debounce } from "@/utils/helpers";
import {
  Button,
  FormControl,
  FormLabel,
  Grid,
  Input,
  Select,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";

export default function MemberFilter({
  searchParams,
  setSearchParams,
  handleSearch,
}: {
  searchParams: MemberQuery;
  setSearchParams: (searchParams: MemberQuery) => void;
  handleSearch: () => void;
}) {
  const [filters, setFilters] = useState({
    name: searchParams.name || "",
    location: searchParams.location || "",
    specialty: searchParams.specialty || "",
    experience: searchParams.experience || "",
    availability: searchParams.availability || "",
  });

  useEffect(() => {
    setSearchParams(filters);
    handleSearch();
  }, [filters, setSearchParams, handleSearch]);

  return (
    <VStack spacing={4} w="full" aria-label="Member search filters">
      <Text fontSize="xl" fontWeight="bold">
        Search Member Directory
      </Text>
      <Grid
        templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }}
        gap={4}
        w="full"
      >
        <FormControl>
          <FormLabel>Name</FormLabel>
          <Input
            placeholder="Search by name"
            value={filters.name}
            onChange={(e) => setFilters({ ...filters, name: e.target.value })}
            aria-label="Search by name"
          />
        </FormControl>

        <FormControl>
          <FormLabel>Location</FormLabel>
          <Select
            value={filters.location}
            onChange={(e) =>
              setFilters({ ...filters, location: e.target.value })
            }
            aria-label="Filter by location"
          >
            <option value="">All Locations</option>
            <option value="DC">Washington, DC</option>
            <option value="MD">Maryland</option>
            <option value="VA">Virginia</option>
            <option value="OTHER">Other</option>
          </Select>
        </FormControl>

        <FormControl>
          <FormLabel>Specialty</FormLabel>
          <Select
            value={filters.specialty}
            onChange={(e) =>
              setFilters({ ...filters, specialty: e.target.value })
            }
            aria-label="Filter by specialty"
          >
            <option value="">All Specialties</option>
            <option value="business">Business</option>
            <option value="technology">Technology</option>
            <option value="health">Health</option>
            <option value="education">Education</option>
            <option value="finance">Finance</option>
            <option value="arts">Arts & Culture</option>
          </Select>
        </FormControl>

        <FormControl>
          <FormLabel>Experience Level</FormLabel>
          <Select
            value={filters.experience}
            onChange={(e) =>
              setFilters({ ...filters, experience: e.target.value })
            }
            aria-label="Filter by experience"
          >
            <option value="">Any Experience</option>
            <option value="entry">Entry Level</option>
            <option value="intermediate">Intermediate</option>
            <option value="expert">Expert</option>
          </Select>
        </FormControl>

        <FormControl>
          <FormLabel>Availability</FormLabel>
          <Select
            value={filters.availability}
            onChange={(e) =>
              setFilters({ ...filters, availability: e.target.value })
            }
            aria-label="Filter by availability"
          >
            <option value="">Any Availability</option>
            <option value="fulltime">Full Time</option>
            <option value="parttime">Part Time</option>
            <option value="contract">Contract</option>
          </Select>
        </FormControl>
      </Grid>

      <Button
        colorScheme="blue"
        onClick={handleSearch}
        w={{ base: "full", md: "auto" }}
        aria-label="Apply filters"
      >
        Search
      </Button>
    </VStack>
  );
}
