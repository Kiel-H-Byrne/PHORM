import { Box, Container, Flex } from "@chakra-ui/react";
import { useRouter } from "next/router";
import { ReactNode, memo } from "react";
import { CustomHead, MyFooter, MyNav } from "./";

type Props = {
  children?: ReactNode;
  title?: string;
};

const Layout = ({ children, title }: Props) => {
  let isMapPage = false;
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const router = useRouter();
    isMapPage = router?.pathname === "/map";
  } catch {
    isMapPage = false;
  }

  return (
    <Flex
      direction="column"
      h={isMapPage ? "100vh" : undefined}
      minH="100vh"
      maxH={isMapPage ? "100vh" : undefined}
      overflow={isMapPage ? "hidden" : undefined}
    >
      <CustomHead title={title || "The P.H.O.R.M"} />
      <Box as="header" flexShrink={0} zIndex={2}>
        <MyNav />
      </Box>
      <Box
        as="main"
        flex="1"
        position="relative"
        width="100%"
        display="flex"
        flexDirection="column"
        overflow={isMapPage ? "hidden" : undefined}
      >
        {isMapPage ? (
          children
        ) : (
          <Container maxW="container.lg" flex="1">
            {children}
          </Container>
        )}
      </Box>
      <Box as="footer" flexShrink={0} zIndex={1}>
        <MyFooter />
      </Box>
    </Flex>
  );
};

export default memo(Layout);
