import { ReactNode, memo } from "react";
import { CustomHead, MyFooter, MyNav } from "./";

type Props = {
  children?: ReactNode;
  title?: string;
};


const Layout = ({ children, title }: Props) => {
  // const [show, setShow] = useState(true);

  return (
    <>
      <CustomHead title={title || "Pull Up App"} />
      <MyNav />
      {children}
      <MyFooter />
    </>
  );
};

export default memo(Layout)