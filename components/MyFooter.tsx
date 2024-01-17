import { Container, Flex, Link, Text } from "@chakra-ui/react";
import { memo } from "react";

interface Props {}

const MyFooter = (props: Props) => {
  return (
    <Flex
      as="footer"
      marginTop="calc(100vh - 64px - 42px)"
      p={3}
      backgroundColor={"gray.200"}
      w="full"
    >
      <Container maxW={"3xl"} fontSize={"xs"} {...props}>
        <Text as="span">
          © Copyright{" "}
          <Link isExternal href="https://tenksolutions.com">
            TenK Solutions, LLC.{" "}
          </Link>
          All Rights Reserved
        </Text>
        <Text as={"span"} fontSize="xs" p={1}>
          |
        </Text>
        <Text as="span">
          <Link href="/tech-stack/" fontSize="xs">
            How We Built This Site
          </Link>
        </Text>
      </Container>
    </Flex>
  );
};
export default memo(MyFooter);
