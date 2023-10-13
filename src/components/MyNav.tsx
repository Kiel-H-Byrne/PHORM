import { AddIcon, CloseIcon, HamburgerIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  Flex,
  HStack,
  Heading,
  IconButton,
  Link,
  Menu,
  Stack,
  useColorModeValue,
  useDisclosure,
} from "@chakra-ui/react";
import { signIn, useSession } from "next-auth/react";
import { memo, useRef } from "react";
import { AboutModal, AddListingDrawer, MyAvatar } from "./";

const NAV_LINKS = [
  { path: "/", label: "Home" },
  { path: "/about", label: "About" },
  { path: "/owners", label: "Owners" },
  { path: "/list", label: "List View" },
];
const NavLink = ({ path, label }: { path: string; label: string }) => (
  <Link
    px={2}
    py={1}
    rounded={"md"}
    _hover={{
      textDecoration: "none",
      bg: useColorModeValue("gray.200", "gray.700"),
    }}
    href={path}
  >
    {label}
  </Link>
);

const AvatarDropdown = () => (
  <Box pb={4} display={{ md: "none" }}>
    <Stack as={"nav"} spacing={4}>
      <Heading color={"royalblue"}>P.H.O.R.M</Heading>
      {NAV_LINKS.map(({ path, label }) => (
        <NavLink key={label} path={path} label={label} />
      ))}
    </Stack>
  </Box>
);
const MyNav = () => {
  const {
    isOpen: dropdownIsOpen,
    onOpen: onDropdownOpen,
    onClose: onDropdownClose,
  } = useDisclosure();
  const {
    isOpen: drawerIsOpen,
    onOpen: onDrawerOpen,
    onClose: onDrawerClose,
  } = useDisclosure();
  const firstField = useRef().current;

  const {status} = useSession();
  return (
    <>
      <Box
        bg={useColorModeValue("gray.100", "gray.900")}
        px={4}
        position={"relative"}
        zIndex={1}
      >
        <Flex h={16} alignItems={"center"} justifyContent={"space-between"}>
          <IconButton
            size={"md"}
            icon={dropdownIsOpen ? <CloseIcon /> : <HamburgerIcon />}
            aria-label={"Open Menu"}
            display={{ md: "none" }}
            onClick={dropdownIsOpen ? onDropdownClose : onDropdownOpen}
          />
          <HStack spacing={8} alignItems={"center"}>
            <HStack
              as={"nav"}
              spacing={4}
              display={{ base: "none", md: "flex" }}
            >
              <Heading color={"royalblue"}>P.H.O.R.M</Heading>
              {NAV_LINKS.map(({ path, label }) => (
                <NavLink key={label} path={path} label={label} />
              ))}
            </HStack>
          </HStack>
          <Flex alignItems={"center"}>
            <Button
              variant={"solid"}
              colorScheme={"teal"}
              onClick={
                () =>
                  //logged in? add form else signIn
                  status === "authenticated" ?
                  onDrawerOpen()
                : signIn()
              }
              size={"sm"}
              mr={4}
              leftIcon={<AddIcon />}
            >
              Register Business {/** Get Listed */}
            </Button>
            <Menu>
              <MyAvatar />
            </Menu>
          </Flex>
        </Flex>
        {dropdownIsOpen ? <AvatarDropdown /> : null}
      </Box>
      <AddListingDrawer
        drawerIsOpen={drawerIsOpen}
        firstField={firstField}
        onDrawerClose={onDrawerClose}
      />
      <AboutModal />
    </>
  );
}

export default memo(MyNav)