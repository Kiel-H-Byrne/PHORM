"use client";

import { useAuth } from "@/contexts/AuthContext";
import {
  Heading,
  Image,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalOverlay,
  Stack,
  Text,
  VStack,
  useDisclosure,
} from "@chakra-ui/react";
import { usePathname } from "next/navigation";
import { memo, useEffect } from "react";

function AboutModal() {
  const OverlayOne = () => (
    <ModalOverlay
      //   bg='blackAlpha.300'
      backdropFilter="blur(10px) hue-rotate(180deg)"
    />
  );

  const { isOpen, onOpen, onClose } = useDisclosure();
  const { user } = useAuth();
  const isLoggedIn = !!user;
  const currentPath = usePathname();
  const isMainPage = currentPath === "/";
  useEffect(() => {
    //open only if page is index
    isMainPage && onOpen();
  }, [onOpen, isMainPage]);

  return (
    <Modal
      isCentered
      isOpen={isOpen}
      onClose={onClose}
      size={{ base: "xs", md: "3xl" }}
    >
      <OverlayOne />
      <ModalContent>
        <ModalCloseButton right={1} />
        <ModalBody>
          <VStack spacing={3} p={{ base: 0, small: 5 }}>
            <Heading
              textAlign="center"
              as={"h1"}
              fontSize={{ base: "xl", md: "2xl" }}
              width="full"
            >
              Welcome to The{" "}
              <Text as="span" color="royalblue">
                P
              </Text>
              rince{" "}
              <Text as="span" color="royalblue">
                H
              </Text>
              all{" "}
              <Text as="span" color="royalblue">
                O
              </Text>
              nline{" "}
              <Text as="span" color="royalblue">
                R
              </Text>
              egistry of{" "}
              <Text as="span" color="royalblue">
                M
              </Text>
              erchants
            </Heading>
            <Heading
              size="sm"
              color="gray.500"
              fontStyle={"oblique"}
              mb={2}
              textAlign={"center"}
            >
              Connecting Communities, Empowering Entrepreneurs, Strengthening
              our Brotherhood
            </Heading>
            <Stack
              direction={{ base: "column", md: "row" }}
              px={{ base: 3, sm: 10 }}
              spacing={10}
              alignItems={"center"}
            >
              <Image
                src={"/img/Logo1.png"}
                aspectRatio={0.787}
                height={{ base: 24, md: 172 }}
                alt="logo"
              />
              <Text fontSize="lg" fontFamily={"body"}>
                Welcome to{" "}
                <Text as="span" fontWeight="bold" color="blue.600">
                  The PHORM
                </Text>
                , the premier online directory dedicated to promoting and
                supporting businesses owned by individuals affiliated with
                Prince Hall Freemasonry. Immerse yourself in <i>the</i> platform
                that celebrates our shared bond while showcasing the talents and
                offerings of our esteemed PHAmily.
              </Text>
            </Stack>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
export default memo(AboutModal);
