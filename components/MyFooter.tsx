import { Flex, Link, Text } from "@chakra-ui/react";
import { memo } from "react";

interface Props {}

const MyFooter = (props: Props) => {
  return (
    <Flex
      as="footer"
      // position="relative"
      // marginTop="64px"
      p={{ base: 1, sm: 3 }}
      backgroundColor={"mwphgldc.blue.50"}
      maxW={"3xl"}
      fontSize={{ base: "2xs", sm: "xs" }}
      // {...props}
      maxHeight="42px"
    >
      <Text as="span">
        © Copyright{" "}
        <Link isExternal href="https://tenksolutions.com">
          TenK Solutions, LLC.{" "}
        </Link>
        All Rights Reserved
      </Text>
      <Text as={"span"} fontSize="inherit" p={1}>
        |
      </Text>
      <Text as="span">
        <Link href="/privacy-and-terms/" fontSize="inherit">
          Privacy Policy & Terms
        </Link>
      </Text>
      <Text as={"span"} fontSize="xs" p={1}>
        |
      </Text>
      <Text as="span">
        <Link href="/tech-stack/" fontSize="inherit">
          How We Built This Site
        </Link>
      </Text>
    </Flex>
  );
};
export default memo(MyFooter);
