import {
  Heading,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Stack,
  Text,
  useDisclosure
} from "@chakra-ui/react";
import { useSession } from "next-auth/react";
import { memo, useEffect } from "react";
import { FaDraftingCompass, FaFistRaised, FaGem } from "react-icons/fa";
import { FeatureCard } from "./";
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

function AboutModal() {
  const OverlayOne = () => (
    <ModalOverlay
      //   bg='blackAlpha.300'
      backdropFilter="blur(10px) hue-rotate(180deg)"
    />
  );

  const { isOpen, onOpen, onClose } = useDisclosure();
  const {status} = useSession()
  useEffect(() => {
    onOpen();
  }, [onOpen]);

  return (
    <Modal
      isCentered
      isOpen={isOpen && status === "unauthenticated"}
      onClose={onClose}
      size={{ base: "xs", md: "3xl" }}
    >
      <OverlayOne />
      <ModalContent>
        <ModalHeader fontSize={"xl"}>
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
          <Heading
            size="sm"
            color="gray.500"
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

}
export default memo(AboutModal)