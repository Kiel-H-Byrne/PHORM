"use client";

import { appAuth } from "@/db/firebase";
import { trackEvent } from "@/util/analytics";
import authFetch from "@/util/authFetch";
import { startFirebaseUILogin } from "@/util/firebaseUI";
import { safeReturnUrl, setAuthCookie } from "@/util/authCookies";
import { Box, Heading, Text, useToast } from "@chakra-ui/react";
import { useRouter } from "next/router";
import { useEffect, useRef } from "react";

// Import CSS for FirebaseUI
import "firebaseui/dist/firebaseui.css";

interface FirebaseAuthUIProps {
  title?: string;
  subtitle?: string;
}

const FirebaseAuthUI = ({
  title = "Sign in to PHORM",
  subtitle = "Choose your preferred sign-in method",
}: FirebaseAuthUIProps) => {
  const router = useRouter();
  const toast = useToast();
  const authContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Only initialize FirebaseUI if we're in the browser
    if (typeof window !== "undefined" && authContainerRef.current) {
      try {
        // Start the FirebaseUI Auth flow
        startFirebaseUILogin("firebaseui-auth-container");

        // Add event listener for auth state changes
        const unsubscribe = appAuth?.onAuthStateChanged(async (user) => {
          if (user) {
            try {
              // User is signed in
              setAuthCookie(user);
              // Creates the member record on first sign-in. Best effort:
              // a failure here must not block the redirect.
              await authFetch(`/api/users/${user.uid}`).catch((e) =>
                console.error("Error creating user record:", e)
              );
              trackEvent("login", {
                method: user.providerData[0]?.providerId ?? "unknown",
              });

              toast({
                title: "Sign in successful",
                description: `Welcome ${
                  user.displayName ||
                  user.email ||
                  user.phoneNumber ||
                  "to PHORM"
                }!`,
                status: "success",
                duration: 5000,
                isClosable: true,
              });

              router.replace(safeReturnUrl(router.query));
            } catch (error) {
              console.error("Error completing sign in:", error);
            }
          }
        });

        // Clean up the subscription
        return () => {
          if (unsubscribe) unsubscribe();
        };
      } catch (error) {
        console.error("Error initializing Firebase UI:", error);
        toast({
          title: "Authentication Error",
          description:
            "There was a problem initializing the authentication system. Please try again later.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    }
  }, [router, toast]);

  return (
    <Box textAlign="center" p={5}>
      <Heading as="h1" size="xl" mb={2}>
        {title}
      </Heading>
      <Text mb={6} color="gray.600">
        {subtitle}
      </Text>

      {/* FirebaseUI auth container */}
      <Box
        id="firebaseui-auth-container"
        ref={authContainerRef}
        mx="auto"
        maxW="md"
        borderWidth="1px"
        borderRadius="lg"
        p={4}
      />
    </Box>
  );
};

export default FirebaseAuthUI;
