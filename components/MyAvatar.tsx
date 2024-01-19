import {
  Avatar,
  Button,
  Grid,
  Icon,
  Link,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverHeader,
  PopoverTrigger,
} from "@chakra-ui/react";
import { signOut, useSession } from "next-auth/react";
import { memo } from "react";
import {
  FaFacebookSquare,
  FaLinkedinIn,
  FaTwitterSquare,
} from "react-icons/fa";

const MyAvatar = () => {
  const { data: session, status } = useSession();
  return status === "authenticated" && session.user ? (
    <Popover placement="top-start">
      <PopoverTrigger>
        <Avatar
          loading="lazy"
          src={
            session.user.image ??
            `https://api.dicebear.com/6.x/bottts/svg?seed=${session.user.email}`
          }
        />
      </PopoverTrigger>
      <PopoverContent>
        <PopoverHeader fontWeight="semibold">Log Out/Share</PopoverHeader>
        <PopoverArrow />
        <PopoverCloseButton />
        <PopoverBody>
          <Grid templateColumns="repeat(3, 3fr)" gap={1}>
            <Link href="#">
              <Icon boxSize={30} as={FaFacebookSquare} />
            </Link>
            <Link href="#">
              <Icon boxSize={30} as={FaLinkedinIn} />
            </Link>
            <Link href="#">
              <Icon boxSize={30} as={FaTwitterSquare} />
            </Link>
          </Grid>
          <Button onClick={() => signOut()}>Log Out</Button>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  ) : status === "loading" ? (
    <>Loading...</>
  ) : // <Button leftIcon={<CheckCircleIcon />} onClick={() => signIn()}>
  //   Login
  // </Button>
  null;
};

export default memo(MyAvatar);
