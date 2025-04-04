"use client";

import { appAuth } from "@/db/firebase";
import { startFirebaseUILogin } from "@/pages/api/auth/fbAuth";
import { setAuthCookie } from "@/util/authCookies";
import { Box, Heading, Text, useToast } from "@chakra-ui/react";
import { useRouter } from "next/router";
import { useEffect, useRef } from "react";

// Import CSS for FirebaseUI - only in browser
if (typeof window !== "undefined") {
  try {
    require("firebaseui/dist/firebaseui.css");
  } catch (error) {
    console.error('Error loading FirebaseUI CSS:', error);
  }
}

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
    if (typeof window !== "undefined") {
      // Delay initialization to ensure DOM is fully rendered and Firebase is loaded
      const initTimer = setTimeout(() => {
        try {
          // Check if Firebase Auth is initialized
          if (!appAuth) {
            throw new Error(
              "Firebase Auth is not initialized. Check your Firebase configuration."
            );
          }

          // console.log("Firebase Auth initialized:", appAuth);
          // console.log("Auth container ref:", authContainerRef.current);
          // console.log("DOM element by ID:", document.getElementById("firebaseui-auth-container"));

          // Start the FirebaseUI Auth flow
          startFirebaseUILogin("firebaseui-auth-container");

          // Add event listener for auth state changes
          const unsubscribe = appAuth.onAuthStateChanged((user) => {
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

          // Return cleanup function
          return () => {
            if (unsubscribe) unsubscribe();
          };
        } catch (error) {
          console.error("Error initializing Firebase UI:", error);
          // Log more details about the error
          if (error instanceof Error) {
            console.error("Error message:", error.message);
            console.error("Error stack:", error.stack);
          }

          // Log Firebase configuration status
          console.log(
            "Firebase Auth status:",
            appAuth ? "Initialized" : "Not initialized"
          );

          toast({
            title: "Authentication Error",
            description:
              "There was a problem initializing the authentication system. Please try again later.",
            status: "error",
            duration: 5000,
            isClosable: true,
          });
        }
      }, 1000); // Increased delay to 1000ms to ensure DOM is fully rendered

      // Return cleanup function for the timer
      return () => {
        clearTimeout(initTimer);
      };
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
        minHeight="200px"
        display="block"
      />
    </Box>
  );
};

export default FirebaseAuthUI;
