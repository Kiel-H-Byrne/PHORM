import {
  Box,
  Flex,
  Heading,
  Icon,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import { memo } from "react";
import { IconType } from "react-icons/lib";

function FeatureCard({
  feature,
}: {
  feature: { icon: IconType; heading: string; body: string };
}) {
  return (
    <Box
      marginBlock={2}
      // height="300"
      // w={{ base: "xxs", md: "sm" }}
      boxShadow={"md"}
      p={4}
      borderRadius={3}
      bg={"blackAlpha.100"}
    >
      <Flex justifyContent={"center"} mb={3}>
        <Flex
          w={12}
          h={12}
          align={"center"}
          justify={"center"}
          rounded={"full"}
          bg={useColorModeValue("blue.600", "gray.700")}
        >
          <Icon as={feature.icon} boxSize={7} color="gold" />
        </Flex>
      </Flex>
      <Heading as="h2" size="sm" mb={2} textAlign={"center"}>
        {feature.heading}
      </Heading>
      <Text fontSize="xs">{feature.body}</Text>
    </Box>
  );
}
export default memo(FeatureCard);
