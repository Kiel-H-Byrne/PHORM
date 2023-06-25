import { Flex, Text } from "@chakra-ui/react";
import { InfoWindow } from "@react-google-maps/api";
import { memo } from "react";
import { IListing } from "../types";

 const SingleInfoContent = ({
  data, options,
}: {
  data: IListing[];
  options: any;
}) => {
  const { lat, lng, name } = data[0];
  if (lat && lng) {
    return (
      <InfoWindow position={{ lat, lng }} options={options}>
        <Flex width="xs" direction="column">
          <Text as="h2">{name}</Text>
          <Text fontWeight="light" fontSize=".7rem" color="gray.300">
            ---Description---{" "}
          </Text>
        </Flex>
      </InfoWindow>
    );
  }
};
export default memo(SingleInfoContent)