import { SessionProvider } from "next-auth/react";
import { ReactNode, memo } from "react";
import { CustomHead, MyFooter, MyNav } from "./";

type Props = {
  children?: ReactNode;
  title?: string;
};


const Layout = ({ children, title }: Props) => {
  // const [show, setShow] = useState(true);

  return (
    <SessionProvider>
      <CustomHead title={title || "The P.H.O.R.M"} />
      <MyNav />
      {children}
      <MyFooter />
    </SessionProvider>
  );
};

export default memo(Layout)