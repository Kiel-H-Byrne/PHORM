import { AuthProvider } from "@/contexts/AuthContext";
import { Container } from "@chakra-ui/react";
import { ReactNode, memo } from "react";
import { CustomHead, MyFooter, MyNav } from "./";

type Props = {
  children?: ReactNode;
  title?: string;
};

const Layout = ({ children, title }: Props) => {
  return (
    <AuthProvider>
      <CustomHead title={title || "The P.H.O.R.M"} />
      <MyNav />
      <Container maxW="container.lg" minHeight={"calc(100% - 106px)"}>
        {children}
      </Container>
      <MyFooter />
    </AuthProvider>
  );
};

export default memo(Layout);
