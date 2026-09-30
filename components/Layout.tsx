import { Box, Container, Flex } from "@chakra-ui/react";
import { useRouter } from "next/router";
import { ReactNode, memo } from "react";
import CustomHead from "./CustomHead";
import MyFooter from "./MyFooter";
import MyNav from "./MyNav";

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
      // dvh tracks the visible viewport on mobile (excludes browser chrome)
      h={isMapPage ? "100dvh" : undefined}
      minH="100dvh"
      maxH={isMapPage ? "100dvh" : undefined}
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
      {!isMapPage && (
        <Box flexShrink={0} zIndex={1}>
          <MyFooter />
        </Box>
      )}
    </Flex>
  );
};

export default memo(Layout);
