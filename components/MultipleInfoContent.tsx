import {
  Box,
  Divider,
  Flex,
  Heading,
  Icon,
  List,
  ListItem,
  Text,
} from "@chakra-ui/react";
import { InfoWindow } from "@react-google-maps/api";
import { memo } from "react";
import { FaMapMarkerAlt } from "react-icons/fa";
import { GLocation, IListing } from "../types";

const MultipleInfoContent = ({
  data,
  options,
}: {
  data: IListing[];
  options: any;
}) => {
  const { position }: { position: GLocation } = options;

  // Validate data
  if (!data || data.length === 0) {
    return null;
  }

  // Limit to maximum 5 listings to prevent overcrowding
  const limitedData = data.slice(0, 5);
  const hasMore = data.length > 5;

  return (
    <InfoWindow position={position} options={options}>
      <Box width="250px" maxWidth="100%" p={1}>
        <Heading as="h6" size="xs" mb={2} textAlign="center">
          {data.length} Businesses in this area
        </Heading>

        <Divider mb={2} />

        <List spacing={1}>
          {limitedData.map((listing, i) => {
            return (
              <ListItem
                key={listing.id || `${listing.name}-${i}`}
                py={1}
                borderBottom={i < limitedData.length - 1 ? "1px solid" : "none"}
                borderColor="gray.100"
              >
                <Flex align="center">
                  <Icon
                    as={FaMapMarkerAlt}
                    color="blue.500"
                    mr={2}
                    boxSize={3}
                  />
                  <Box>
                    <Text fontWeight="semibold" fontSize="xs" noOfLines={1}>
                      {listing.name}
                    </Text>
                    {listing.address && (
                      <Text fontSize="2xs" color="gray.600" noOfLines={1}>
                        {listing.address}
                      </Text>
                    )}
                  </Box>
                </Flex>
              </ListItem>
            );
          })}

          {hasMore && (
            <Text fontSize="2xs" color="gray.500" textAlign="center" mt={1}>
              + {data.length - 5} more businesses
            </Text>
          )}
        </List>
      </Box>
    </InfoWindow>
  );
};
export default memo(MultipleInfoContent);
