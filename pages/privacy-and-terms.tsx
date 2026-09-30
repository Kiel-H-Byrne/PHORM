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
      body: `Account Information: When you sign in with your phone number or email, we store your name, email address and/or phone number, and any profile details you choose to add. Passwords are handled by Google Firebase Authentication and are never stored by us.

Business Listings: Information you add to a business listing (name, address, phone, email, website, hours, description) is public and can be seen by anyone who visits PHORM.

Usage Information: We use analytics (Vercel Analytics and Google Analytics for Firebase) to understand how the site is used — for example, which pages are viewed, what people search for, and when a contact button is tapped. This helps us improve PHORM and recruit businesses in categories members are looking for.`,
    },
    {
      heading: "How We Use Your Information",
      body: "We use the collected information to provide and improve our services, personalize your experience, and contribute to the economic empowerment of Prince Hall Freemasonry.",
    },
    {
      heading: "Data Sharing and Security",
      body: 'We do not sell your personal information. Your contact details are never shown publicly. The Member Directory is opt-in: only if you choose "Show me in the Member Directory" in your profile can other signed-in members see basic details such as your name, lodge and occupation. Data is stored with Google Firebase and protected with industry-standard security measures.',
    },
    {
      heading: "Your Choices",
      body: "You can edit or remove your business listings and profile details from your dashboard at any time. To delete your account, contact us at the address below.",
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
      heading: "Business Listings",
      body: "Only list businesses you own or are authorized to represent, and keep the information accurate. We may edit or remove listings that are inaccurate, misleading, or not affiliated with the Prince Hall family.",
    },
    {
      heading: "User Conduct",
      body: "You are responsible for your interactions on The PHORM. Respect the privacy and rights of others. Do not engage in any activity that may harm the platform or its users.",
    },
    {
      heading: "Third-Party Authentication",
      body: "Sign-in is provided by Google Firebase Authentication. By signing in you also agree to Google's terms of service.",
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
  const Updated_Date = new Date("2026-09-30");
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
