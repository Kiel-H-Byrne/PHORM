import { CheckCircleIcon } from "@chakra-ui/icons";
import {
  Avatar,
  Button,
  Grid,
  Image,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverHeader,
  PopoverTrigger,
} from "@chakra-ui/react";
import { signIn, signOut, useSession } from "next-auth/react";

export const MyAvatar = () => {
  const { data: session, status } = useSession()
  return status === "authenticated" && session.user ? (
    <Popover placement="top-start">
      <PopoverTrigger>
        <Avatar
          src={
            session.user.image
              ? session.user.image
              : `https://avatars.dicebear.com/api/bottts/${session.user.email}.svg`
          }
        />
      </PopoverTrigger>
      <PopoverContent>
        <PopoverHeader fontWeight="semibold">Log Out/Share</PopoverHeader>
        <PopoverArrow />
        <PopoverCloseButton />
        <PopoverBody>
          <Grid templateColumns="repeat(3, 3fr)" gap={1}>
            <Image boxSize="30px" src="img/fbook-share.png" alt="Facebook Share" />
            <Image boxSize="30px" src="img/linkedin-share.png" alt="LinkedIn Share" />
            <Image boxSize="30px" src="img/twitter-share.png" alt="Twitter Share" />
          </Grid>
          <Button onClick={() => signOut()}>Log Out</Button>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  ) : status === "loading" ? <>Loading...</>
  :(
    <Button leftIcon={<CheckCircleIcon />} onClick={() => signIn()}>
      Login
    </Button>
  );
};