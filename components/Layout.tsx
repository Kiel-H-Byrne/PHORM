import React, { ReactNode } from "react";
import { CustomHead, MyFooter} from "./";
import { MyNav } from "./MyNav";

type Props = {
  children?: ReactNode;
  title?: string;
};


export const Layout = ({ children, title }: Props) => {
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