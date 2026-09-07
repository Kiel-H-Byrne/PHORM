import {
  Box,
  Container,
  Flex,
  HStack,
  Icon,
  Link,
  Text,
} from "@chakra-ui/react";
import NextLink from "next/link";
import { memo, useEffect, useState } from "react";
import {
  FaFacebookSquare,
  FaLinkedinIn,
  FaTwitterSquare,
} from "react-icons/fa";

interface Props {}

const SHARE_TEXT =
  "Check out PHORM — Prince Hall Online Registry of Merchants";

const MyFooter = (props: Props) => {
  const [homeUrl, setHomeUrl] = useState("https://phorm.app");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setHomeUrl(window.location.origin);
    }
  }, []);

  const encodedUrl = encodeURIComponent(homeUrl);
  const encodedText = encodeURIComponent(SHARE_TEXT);

  const sharePlatforms = [
    {
      name: "Facebook",
      icon: FaFacebookSquare,
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      ariaLabel: "Share PHORM on Facebook",
      hoverColor: "#1877F2",
    },
    {
      name: "LinkedIn",
      icon: FaLinkedinIn,
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      ariaLabel: "Share PHORM on LinkedIn",
      hoverColor: "#0A66C2",
    },
    {
      name: "Twitter / X",
      icon: FaTwitterSquare,
      url: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`,
      ariaLabel: "Share PHORM on Twitter / X",
      hoverColor: "#1DA1F2",
    },
  ];

  const handleShareClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    url: string
  ) => {
    e.preventDefault();
    if (typeof window !== "undefined") {
      window.open(
        url,
        "_blank",
        "noopener,noreferrer,width=600,height=500"
      );
    }
  };

  return (
    <Flex
      as="footer"
      py={{ base: 1, sm: 1.5 }}
      px={{ base: 3, sm: 6 }}
      backgroundColor={"mwphgldc.blue.50"}
      borderTop="1px"
      borderColor="gray.100"
      alignItems="center"
    >
      <Container
        maxW={"6xl"}
        fontSize={{ base: "2xs", sm: "xs" }}
        display="flex"
        flexDirection={{ base: "column", sm: "row" }}
        alignItems="center"
        justifyContent="space-between"
        gap={2}
        px={0}
        {...props}
      >
        <Box textAlign={{ base: "center", sm: "left" }} color="gray.600" lineHeight="normal">
          <Text as="span">
            © Copyright{" "}
            <Link isExternal href="https://tenksolutions.com">
              TenK Solutions, LLC.{" "}
            </Link>
            All Rights Reserved
          </Text>
          <Text as={"span"} fontSize="inherit" p={1}>
            |
          </Text>
          <Text as="span">
            <Link as={NextLink} href="/privacy-and-terms" fontSize="inherit">
              Privacy Policy & Terms
            </Link>
          </Text>
          <Text as={"span"} fontSize="inherit" p={1}>
            |
          </Text>
          <Text as="span">
            <Link as={NextLink} href="/tech-stack" fontSize="inherit">
              How We Built This Site
            </Link>
          </Text>
        </Box>

        <HStack spacing={2} justify="center" flexShrink={0}>
          {sharePlatforms.map(({ name, icon, url, ariaLabel, hoverColor }) => (
            <Link
              key={name}
              isExternal
              href={url}
              aria-label={ariaLabel}
              onClick={(e) => handleShareClick(e, url)}
              color="gray.600"
              _hover={{ color: hoverColor }}
              display="inline-flex"
              alignItems="center"
              justifyContent="center"
              p={0.5}
            >
              <Icon as={icon} boxSize={4} />
            </Link>
          ))}
        </HStack>
      </Container>
    </Flex>
  );
};

export default memo(MyFooter);
