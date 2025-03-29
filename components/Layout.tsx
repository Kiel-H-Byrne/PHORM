import { Container, Flex, Stack } from "@chakra-ui/react";
import { SessionProvider } from "next-auth/react";
import { ReactNode, memo } from "react";
import { MyFooter, MyNav } from "./";

type Props = {
  children?: ReactNode;
  title?: string;
};

const Layout = ({ children, title }: Props) => {
  return (
    <SessionProvider>
      <Stack minHeight={'100vh'}>
        <MyNav />
        <Container maxW="container.lg" minHeight={"calc(100% - 106px)"}>
          {children}
        </Container>
        <MyFooter />
      </Stack>
    </SessionProvider>
  );
};

export default memo(Layout);
