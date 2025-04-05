import { useAuth } from "@/contexts/AuthContext";
import { Center, Spinner, useToast } from "@chakra-ui/react";
import { useRouter } from "next/router";
import { useEffect } from "react";

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const toast = useToast();

  useEffect(() => {
    if (!loading && !user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to access this page",
        status: "warning",
        duration: 5000,
        isClosable: true,
      });
      router.push({
        pathname: "/login",
        query: { returnUrl: router.asPath },
      });
    }
  }, [user, loading, router, toast]);

  if (loading) {
    return (
      <Center h="100vh">
        <Spinner size="xl" color="blue.500" thickness="4px" />
      </Center>
    );
  }

  return user ? <>{children}</> : null;
}
