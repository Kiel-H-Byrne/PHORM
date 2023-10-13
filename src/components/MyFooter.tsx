import { Center, Flex } from "@chakra-ui/react";
import { memo } from "react";

interface Props {}

 const MyFooter = (props: Props) => {
  return (
    <Flex as="footer" position="absolute" bottom={0} left={0} zIndex={1}>
      <Center fontSize={"xs"} {...props}>
        © Copyright TenK Solutions, LLC. All Rights Reserved
      </Center>
    </Flex>
  );
};
export default memo(MyFooter)