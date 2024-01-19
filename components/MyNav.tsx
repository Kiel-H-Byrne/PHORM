import { AddIcon, CloseIcon, HamburgerIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  Flex,
  HStack,
  IconButton,
  Image,
  Link,
  Menu,
  useColorModeValue,
  useDisclosure,
} from "@chakra-ui/react";
import { signIn, useSession } from "next-auth/react";
import { memo, useRef } from "react";
import { AboutModal, AddListingDrawer, MyAvatar } from "./";
import { AvatarDropdown } from "./AvatarDropdown";
import { NavLinks } from "./NavLinks";

const NAV_LINKS = [
  { path: "/", label: "Home", isPrivate: false },
  { path: "/about", label: "About", isPrivate: false },
  // { path: "/owners", label: "Owners" },
  { path: "/?viewType=list", label: "List View", isPrivate: false },
  { path: "/member-directory", label: "Member Directory", isPrivate: true },
];
export type INAVLINKS = typeof NAV_LINKS;

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

  const { status } = useSession();
  const isPrivateLink = (link: { isPrivate: boolean }) => link.isPrivate;
  const isLoggedIn = status === "authenticated";
  const isLoading = status === "loading";
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
            size={"lg"}
            icon={dropdownIsOpen ? <CloseIcon /> : <HamburgerIcon />}
            aria-label={"Open Menu"}
            display={{ md: "none" }}
            onClick={dropdownIsOpen ? onDropdownClose : onDropdownOpen}
          />
          <HStack spacing={8} alignItems={"center"}>
            <Link href="/">
              <Image
                height={14}
                aspectRatio={0.787}
                src="/img/Logo1.png"
                alt="logo"
              />
            </Link>
            <HStack
              as={"nav"}
              spacing={4}
              display={{ base: "none", md: "flex" }}
            >
              {/* <Heading color={"royalblue"}>P.H.O.R.M</Heading> */}
              <NavLinks links={NAV_LINKS} isLoggedIn={isLoggedIn} />
            </HStack>
          </HStack>
          <Flex alignItems={"center"}>
            <Button
              variant={"solid"}
              colorScheme={"teal"}
              onClick={() =>
                //logged in? add form else signIn
                isLoggedIn ? onDrawerOpen() : signIn()
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
        {dropdownIsOpen ? (
          <AvatarDropdown isLoggedIn={isLoggedIn} links={NAV_LINKS} />
        ) : null}
      </Box>
      <AddListingDrawer
        drawerIsOpen={drawerIsOpen}
        firstField={firstField}
        onDrawerClose={onDrawerClose}
      />
      {!isLoggedIn && !isLoading && <AboutModal />}
    </>
  );
};

export default memo(MyNav);
