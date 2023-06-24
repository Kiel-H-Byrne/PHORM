import {
    Box,
    Flex,
    Heading,
    Icon,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalHeader,
    ModalOverlay,
    Stack,
    Text,
    useColorModeValue,
    useDisclosure
} from "@chakra-ui/react";
import { useEffect } from "react";
import { FaDraftingCompass, FaFistRaised, FaGem } from "react-icons/fa";
import { IconType } from "react-icons/lib";
const feats = [
  {
    icon: FaGem,
    heading: "Uncover Hidden Gems",
    body: "Thoughtfully curated selection of businesses owned by Prince Hall Freemasons. Explore businesses that are deeply rooted in our community and embody our shared values.",
  },
  {
    icon: FaDraftingCompass,
    heading: "Verified and Trusted",
    body: "Every business listed in PHORM can be traced back to a named member of the Craft. By engaging with these trusted businesses, you directly contribute to the growth and success of our Prince Hall Masonic community.",
  },
  {
    icon: FaFistRaised,
    heading: "Empowering Our Brotherhood",
    body: "Actively contribute to the economic empowerment of our Prince Hall Freemasonry network. Together, we nurture entrepreneurship, create opportunities, and honor the legacy passed down to us by supporting our brethren's endeavors.",
  },
];
export function AboutModal() {
  const OverlayOne = () => (
    <ModalOverlay
      //   bg='blackAlpha.300'
      backdropFilter="blur(10px) hue-rotate(180deg)"
    />
  );

  const OverlayTwo = () => (
    <ModalOverlay
      bg="none"
      backdropFilter="auto"
      backdropInvert="80%"
      backdropBlur="2px"
    />
  );

  const { isOpen, onOpen, onClose } = useDisclosure();
  useEffect(() => {
    onOpen();
  }, [onOpen]);

  return (
    <Modal
      isCentered
      isOpen={isOpen}
      onClose={onClose}
      size={{ base: "xs", md: "3xl" }}
    >
      <OverlayOne />
      <ModalContent>
        <ModalHeader as={"h1"} fontSize={"xl"}>
          Welcome to the{" "}
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
          <Heading
            as="h2"
            size="xs"
            color="blackAlpha.600"
            fontStyle={"oblique"}
          >
            Connecting Communities, Empowering Entrepreneurs, Strengthening our
            Brotherhood
          </Heading>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Text fontSize="md" mb={7} fontFamily={"body"} px={3}>
            Welcome to{" "}
            <Text as="span" fontWeight="bold" color="blue.600">
              The PHORM
            </Text>
            , the premier online directory dedicated to promoting and supporting
            businesses owned by individuals affiliated with Prince Hall
            Freemasonry. Immerse yourself in a platform that celebrates our
            shared bond while showcasing the talents and offerings of our
            esteemed Brethren and Sistren.
          </Text>
          <Stack
            direction={{ base: "column", md: "row" }}
            spacing={4}
            align={"center"}
          >
            {feats.map((feature, i) => {
              return <FeatureCard key={i} feature={feature} />;
            })}
          </Stack>
        </ModalBody>
        {/* <ModalFooter>
          <Button onClick={onClose}>Close</Button>
        </ModalFooter> */}
      </ModalContent>
    </Modal>
  );

  function FeatureCard({
    feature,
  }: {
    feature: { icon: IconType; heading: string; body: string };
  }) {
    return (
      <Box
        marginBlock={2}
        // height="300"
        // w={{ base: "xxs", md: "sm" }}
        boxShadow={"md"}
        p={4}
        borderRadius={3}
        bg={"blackAlpha.100"}
      >
        <Flex justifyContent={"center"} mb={3}>
          <Flex
            w={12}
            h={12}
            align={"center"}
            justify={"center"}
            rounded={"full"}
            bg={useColorModeValue("blue.600", "gray.700")}
          >
            <Icon as={feature.icon} boxSize={7} color="gold" />
          </Flex>
        </Flex>
        <Heading as="h2" size="sm" mb={2} textAlign={"center"}>
          {feature.heading}
        </Heading>
        <Text fontSize="xs">{feature.body}</Text>
      </Box>
    );
  }
}
