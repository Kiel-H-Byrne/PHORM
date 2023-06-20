import * as React from "react";
import { useSession, signIn, signOut } from "next-auth/client";
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
import { CheckCircleIcon } from "@chakra-ui/icons";

export const MyAvatar = () => {
  const [session, loading] = useSession();
  return session?.user && !loading ? (
    <Popover placement="top-start">
      <PopoverTrigger>
        <Avatar
          src={
            session.user.image
              ? session.user.image
              : `https://avatars.dicebear.com/api/bottts/${session.user.email}.svg`
          }
          alt={session.user.name}
        />
      </PopoverTrigger>
      <PopoverContent>
        <PopoverHeader fontWeight="semibold">Log Out/Share</PopoverHeader>
        <PopoverArrow />
        <PopoverCloseButton />
        <PopoverBody>
          <Grid templateColumns="repeat(3, 3fr)" gap={1}>
            <Image boxSize="30px" src="img/fbook-share.png" />
            <Image boxSize="30px" src="img/linkedin-share.png" />
            <Image boxSize="30px" src="img/twitter-share.png" />
          </Grid>
          <Button onClick={() => signOut()}>Log Out</Button>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  ) : (
    <Button leftIcon={<CheckCircleIcon />} onClick={() => signIn()}>
      Login
    </Button>
  );
};