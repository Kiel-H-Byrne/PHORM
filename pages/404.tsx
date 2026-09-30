import { Button, Container, Heading, Stack, Text } from "@chakra-ui/react";
import Head from "next/head";
import NextLink from "next/link";

export default function NotFound() {
  return (
    <Container maxW="lg" py={20} textAlign="center">
      <Head>
        <title key="title">Page not found | PHORM</title>
      </Head>
      <Heading mb={4}>We couldn&apos;t find that page</Heading>
      <Text color="gray.600" mb={8}>
        The business may have been removed, or the link may be incorrect.
      </Text>
      <Stack direction={{ base: "column", sm: "row" }} justify="center">
        <Button as={NextLink} href="/list" colorScheme="blue">
          Browse businesses
        </Button>
        <Button as={NextLink} href="/" variant="outline">
          Go home
        </Button>
      </Stack>
    </Container>
  );
}
