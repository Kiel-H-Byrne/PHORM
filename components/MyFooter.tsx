import { Flex, HStack, Link, Text } from "@chakra-ui/react";
import { memo } from "react";

interface Props {}

const MyFooter = (props: Props) => {
  return (
    <Flex
      as="footer"
      bottom={0}
      left={0}
      zIndex={1}
      p={3}
      backgroundColor={"gray.200"}
      w="full"
    >
      <HStack spacing={8} fontSize={"xs"} {...props}>
        <Text as="span">
          © Copyright{" "}
          <Link isExternal href="https://tenksolutions.com">
            TenK Solutions, LLC.{" "}
          </Link>
          All Rights Reserved
        </Text>
        <Text as={"span"} fontSize="xs">
          |
        </Text>
        <Text as="span">
          <Link href="/tech-stack/" fontSize="xs">
            How We Built This Site
          </Link>
        </Text>
      </HStack>
    </Flex>
  );
};
export default memo(MyFooter);
