import { CloseIcon, HamburgerIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  Grid,
  useDisclosure,
} from "@chakra-ui/react";
import Link from "next/link";
import React from "react";
import { MyAvatar } from "./MyAvatar";

interface Props {}

const NAV_LINKS = [
  { path: "/", label: "Home" },
  { path: "/about", label: "About" },
  { path: "/users", label: "Users" },
  { path: "/api/orders", label: "Orders" },
];

export const MyNav = (props: Props) => {
  const { isOpen, onToggle, onClose } = useDisclosure();

  return (
    <Flex as="header" position="absolute" top={0} left={0} zIndex={1} width="100%" p={1}>
      <Box display={{ base: "block", md: "none" }} onClick={onToggle}>
        <Button>{isOpen ? <CloseIcon /> : <HamburgerIcon />}</Button>
      </Box>

      <Drawer placement={"left"} onClose={onClose} isOpen={isOpen}>
        <DrawerOverlay>
          <DrawerContent>
            <DrawerHeader borderBottomWidth="1px">Basic Drawer</DrawerHeader>
            <DrawerBody>
              {NAV_LINKS.map(({ label, path }) => (
                <Link key={label} href={path}>
                  <a>
                    <Box bg="blue.500">{label}</Box>
                  </a>
                </Link>
              ))}
            </DrawerBody>
          </DrawerContent>
        </DrawerOverlay>
      </Drawer>
      <Grid
        width="100%"
        templateColumns="repeat(4, 1fr)"
        gap={6}
        display={["none", "flex"]}
      >
        {NAV_LINKS.map(({ label, path }) => (
          <Link key={label} href={path}>
            <a>
              <Box bg="blue.500" padding="3" borderRadius="sm">
                {label}
              </Box>
            </a>
          </Link>
        ))}
        <Box position="absolute" right="0" paddingInline="3">
          <MyAvatar />
        </Box>
      </Grid>
    </Flex>
  );
};
