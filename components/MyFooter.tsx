import { Container, Flex, Link, Text } from "@chakra-ui/react";
import { memo } from "react";

interface Props {}

const MyFooter = (props: Props) => {
  return (
    <Flex
      as="footer"
      // position="relative"
      // marginTop="64px"
      p={3}
      backgroundColor={"gray.200"}
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
          <Link href="/privacy-and-terms/" fontSize="xs">
            Privacy Policy & Terms
          </Link>
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
