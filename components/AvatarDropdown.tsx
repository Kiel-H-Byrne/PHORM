import { Box, Heading, Stack } from "@chakra-ui/react";
import { INAVLINKS } from "./MyNav";
import { NavLinks } from "./NavLinks";

export const AvatarDropdown = ({ isLoggedIn , links}: { isLoggedIn: boolean; links: INAVLINKS }) => (
  <Box pb={4} display={{ md: "none" }}>
    <Stack as={"nav"} spacing={4}>
      <Heading
        color={"royalblue"}
        justifyContent={"center"}
        display={"inline-block"}
      >
        P.H.O.R.M
      </Heading>
      <NavLinks links={links} isLoggedIn={isLoggedIn} />
    </Stack>
  </Box>
);
