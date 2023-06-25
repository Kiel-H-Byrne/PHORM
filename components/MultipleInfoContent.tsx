import { Box, Flex, Text } from "@chakra-ui/react";
import { InfoWindow } from "@react-google-maps/api";
import { memo } from "react";
import { GLocation, IListing } from "../types";

const MultipleInfoContent = ({
  data, options,
}: {
  data: IListing[];
  options: any;
}) => {
  const { position }: { position: GLocation; } = options;
  return (
    <InfoWindow position={position} options={options}>
      <Box>
        {data.map(({ name }) => {
          return (
            <Flex key={name} width="xs" direction="column">
              <Flex
                maxHeight="100px"
                direction="row"
                marginBlock={1}
                border="1px solid red"
                borderRadius={7}
              >
                <Box p={2}>
                  <Text fontWeight="semibold" fontSize={13}>
                    {name}
                  </Text>
                  <Text fontWeight="light" fontSize=".7rem" color="gray.300">
                    ==Description==
                  </Text>
                </Box>
              </Flex>
            </Flex>
          );
        })}
      </Box>
    </InfoWindow>
  );
};
export default memo(MultipleInfoContent);