import { FeatureCard } from "@/components";
import { Box, Button, Heading, Stack, Text, VStack } from "@chakra-ui/react";
import Head from "next/head";
import { FaDraftingCompass, FaFistRaised, FaGem } from "react-icons/fa";

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

const AboutPage = () => {
  return (
    <Box>
      <Head>
        <title>About The PHORM</title>
      </Head>
      <VStack maxW={"3xl"} mx={"auto"} my={4}>
        <Heading as={"h2"}>About The PHORM:</Heading>
        <Text fontSize="lg" fontFamily={"body"}>
          The premier online directory dedicated to promoting and supporting
          businesses owned by individuals affiliated with Prince Hall
          Freemasonry. Immerse yourself in <i>the</i> platform that celebrates
          our shared bond while showcasing the talents and offerings of our
          esteemed PHAmily.
        </Text>

        <Stack direction={{ base: "column", md: "row" }} spacing={4}>
          {feats.map((feature, i) => {
            return <FeatureCard key={i} feature={feature} />;
          })}
        </Stack>
      </VStack>
      <VStack maxW={"3xl"} mx={"auto"} my={4}>
        <Heading as={"h2"}> Join the PHORM:</Heading>
        <Text as="p">
          Are you a business owner affiliated with Prince Hall Freemasonry? Join
          The PHORM to showcase your business, connect with our community, and
          expand your reach.
        </Text>
        <Button>Get Listed</Button>
      </VStack>
    </Box>
  );
};

export default AboutPage;
