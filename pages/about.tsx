import { FeatureCard } from "@/components";
import { Heading, Stack, Text } from "@chakra-ui/react";
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
    <>
      <Heading>About The PHORM:</Heading>
      <Text as="p">
        Discover more about our mission, commitment, and the unique advantages
        of being part of our online registry.
      </Text>
      <Text as="p">
        Get Listed: Are you a business owner affiliated with Prince Hall
        Freemasonry? Join The PHORM to showcase your enterprise, connect with
        our community, and expand your reach.
      </Text>
      <Stack direction={{ base: "column", md: "row" }} spacing={4}>
            {feats.map((feature, i) => {
              return <FeatureCard key={i} feature={feature} />;
            })}
          </Stack>
    </>
  );
};

export default AboutPage;
