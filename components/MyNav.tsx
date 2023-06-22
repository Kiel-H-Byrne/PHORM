import { AddIcon, CloseIcon, HamburgerIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  HStack,
  Heading,
  IconButton,
  Link,
  Menu,
  MenuButton,
  Stack,
  useColorModeValue,
  useDisclosure
} from "@chakra-ui/react";
import { signIn, useSession } from "next-auth/react";
import React from "react";
import AddListingForm from "./AddListingForm";
import { MyAvatar } from "./MyAvatar";

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

const AvatarDropdown = () => <Box pb={4} display={{ md: "none" }}>
  <Stack as={"nav"} spacing={4}>
    {NAV_LINKS.map(({ path, label }) => (
      <NavLink key={label} path={path} label={label} />
    ))}
  </Stack>
</Box>;
export function MyNav() {
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
  const firstField = React.useRef().current;

  const { data: session, status } = useSession();
  return (
    <>
      <Box bg={useColorModeValue("gray.100", "gray.900")} px={4}>
        <Flex h={16} alignItems={"center"} justifyContent={"space-between"}>
          <IconButton
            size={"md"}
            icon={dropdownIsOpen ? <CloseIcon /> : <HamburgerIcon />}
            aria-label={"Open Menu"}
            display={{ md: "none" }}
            onClick={dropdownIsOpen ? onDropdownClose : onDropdownOpen}
          />
          <HStack spacing={8} alignItems={"center"}>
            <Heading color={"royalblue"} >P.H.O.R.M</Heading>
            <HStack
              as={"nav"}
              spacing={4}
              display={{ base: "none", md: "flex" }}
            >
              {NAV_LINKS.map(({ path, label }) => (
                <NavLink key={label} path={path} label={label} />
              ))}
            </HStack>
          </HStack>
          <Flex alignItems={"center"}>
            <Button
              variant={"solid"}
              colorScheme={"teal"}
              onClick={() => signIn()}
              size={"sm"}
              mr={4}
              leftIcon={<AddIcon />}
            >
              Add Business
            </Button>
            <Menu>
              <MenuButton
                as={Button}
                rounded={"full"}
                variant={"link"}
                cursor={"pointer"}
                minW={0}
              >
                <MyAvatar />
              </MenuButton>
            </Menu>
          </Flex>
        </Flex>

        {dropdownIsOpen ? (
          <AvatarDropdown />
        ) : null}
      </Box>
      <Drawer
        isOpen={drawerIsOpen}
        placement={"left"}
        initialFocusRef={firstField}
        onClose={onDrawerClose}
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth="1px" m={"auto"}>
Add Your Business          </DrawerHeader>

          <DrawerBody>
            <AddListingForm />
          </DrawerBody>

          <DrawerFooter borderTopWidth="1px">
            <Button variant="outline" mr={3} onClick={onDrawerClose}>
              Cancel
            </Button>
            <Button colorScheme="blue">Submit</Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
}
