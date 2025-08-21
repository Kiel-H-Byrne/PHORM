import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Heading,
  Text,
  VStack,
} from "@chakra-ui/react";

// Your page component
const PrivacyAndTermsPage = () => {
  // Sample data for businesses
  const privacy_policy = [
    {
      heading: "Overview",
      body: "Welcome to The PHORM, designed and operated by TenK Solutions, LLC. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website.",
    },
    {
      heading: "Information We Collect",
      body: `Personal Information: When you use LinkedIn or Google OpenAuth for login, we collect basic profile information. We do not store sensitive information such as passwords.

Usage Information: We may collect information about your interactions with our platform, including the pages you view and businesses you engage with.`,
    },
    {
      heading: "How We Use Your Information",
      body: "We use the collected information to provide and improve our services, personalize your experience, and contribute to the economic empowerment of Prince Hall Freemasonry.",
    },
    {
      heading: "Data Sharing and Security",
      body: "Your information is shared only with businesses affiliated with Prince Hall Freemasonry. We employ industry-standard security measures to protect your data.",
    },
    {
      heading: "Your Choices",
      body: "You can control the information you provide and manage your preferences through your account settings.",
    },
    {
      heading: "Contact Us",
      body: "If you have questions about this Privacy Policy, contact us at info@tenksolutions.com.",
    },
  ];
  const terms = [
    {
      heading: "Acceptance of Terms",
      body: "By using The PHORM, you agree to these Terms of Use. If you do not agree, please refrain from using our platform.",
    },
    {
      heading: "User Conduct",
      body: "You are responsible for your interactions on The PHORM. Respect the privacy and rights of others. Do not engage in any activity that may harm the platform or its users.",
    },
    {
      heading: "Third-Party Authentication",
      body: "When using LinkedIn or Google OpenAuth for login, you agree to comply with their terms of service.",
    },
    {
      heading: "Intellectual Property",
      body: "All content on The PHORM, including the logo and site design, is the property of TenK Solutions, LLC. Do not use, reproduce, or distribute without permission.",
    },
    {
      heading: "Limitation of Liability",
      body: "We are not liable for any direct, indirect, or consequential damages arising from the use of The PHORM.",
    },
    {
      heading: "Modifications",
      body: "We reserve the right to modify these terms at any time. Check the 'Last Updated' date for the latest version.",
    },
    {
      heading: "Governing Law",
      body: "These terms are governed by the laws of the District of Columbia. Any disputes shall be resolved in the courts of the District of Columbia.",
    },
  ];
  const Updated_Date = new Date("1/21/2024");
  return (
    <VStack p={6} spacing={6}>
      <AccordionListSection
        items={privacy_policy}
        title={"Privacy Policy"}
        updated={Updated_Date}
      />
      <AccordionListSection
        items={terms}
        title={"Terms & Conditions"}
        updated={Updated_Date}
      />
      <Text as={"i"} fontSize={"sm"}>
        By using The PHORM site and/or application, you acknowledge and agree to
        these terms.
      </Text>
    </VStack>
  );
};

export default PrivacyAndTermsPage;
const AccordionListSection = ({
  items,
  title,
  updated,
}: {
  items: { heading: string; body: string }[];
  title: string;
  updated: Date;
}) => {
  return (
    <>
      <Box textAlign="center">
        <Heading>{title}</Heading>
        <Heading as={"i"} fontWeight={"600"} color="gray" size="xs">
          Last Updated: {updated.toDateString()}
        </Heading>
      </Box>
      <Accordion defaultIndex={[0]} width={"full"}>
        {items.map((policy, index) => (
          <AccordionItem key={index}>
            <AccordionButton>
              <Heading size={"md"} flex="1" textAlign={"left"}>
                {policy.heading}
              </Heading>
              <AccordionIcon />
            </AccordionButton>
            <AccordionPanel pb={4}>
              <Text>{policy.body}</Text>
            </AccordionPanel>
          </AccordionItem>
        ))}
      </Accordion>
    </>
  );
};
