"use client";

import { appAuth } from "@/db/firebase";
import { findOrCreateUser } from "@/db/users";
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
        const unsubscribe = appAuth?.onAuthStateChanged(async (user) => {
          if (user) {
            try {
              // User is signed in
              // Set auth cookie
              setAuthCookie(user);
              console.log(user);
              // Create or find user in the users collection
              // This ensures phone auth users have a record in the users table
              const userData = {
                id: user.uid,
                name: user.displayName || user.phoneNumber || "New Member",
                email: user.email || "",
                image: user.photoURL || "",
                emailVerified: user.emailVerified || false,
                profile: {
                  firstName: user.displayName?.split(" ")[0] || "",
                  lastName:
                    user.displayName?.split(" ").slice(1).join(" ") || "",
                  contact: {
                    email: user.email || "",
                    phone: user.phoneNumber || "",
                  },
                  orgs: [],
                },
              };

              // Find or create the user
              await findOrCreateUser(user.uid, userData);

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

              // Redirect to dashboard or home page
              router.push("/dashboard");
            } catch (error) {
              console.error("Error creating user record:", error);
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
