"use client";

import { appAuth } from "@/db/firebase";
import { startFirebaseUILogin } from "@/pages/api/auth/fbAuth";
import { setAuthCookie } from "@/util/authCookies";
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
        const unsubscribe = appAuth?.onAuthStateChanged((user) => {
          if (user) {
            // User is signed in
            // Set auth cookie
            setAuthCookie(user);

            toast({
              title: "Sign in successful",
              description: `Welcome ${
                user.displayName || user.email || user.phoneNumber || "to PHORM"
              }!`,
              status: "success",
              duration: 5000,
              isClosable: true,
            });

            // Redirect to dashboard or home page
            router.push("/dashboard");
          }
        });

        // Clean up the subscription
        return () => {
          if (unsubscribe) unsubscribe();
        };
      } catch (error) {
        console.error("Error initializing Firebase UI:", error);

        // Determine if this is an API restriction error
        let errorMessage =
          "There was a problem initializing the authentication system. Please try again later.";

        if (error instanceof Error) {
          const errorCode = (error as any).code;
          console.error("Error code:", errorCode);
          console.error("Error message:", error.message);

          if (
            errorCode === "auth/internal-error" ||
            error.message.includes("identitytoolkit") ||
            error.message.includes("blocked")
          ) {
            errorMessage =
              "Authentication API access is restricted. Please check your Firebase project settings in the Google Cloud Console.";
          }
        }

        toast({
          title: "Authentication Error",
          description: errorMessage,
          status: "error",
          duration: 7000,
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
