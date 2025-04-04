import { useAuth } from '@/contexts/AuthContext';
import { Box, Center, Spinner, Text } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { ReactNode, useEffect } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      // Redirect to login page if not authenticated
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <Center h="100vh">
        <Box textAlign="center">
          <Spinner size="xl" color="blue.500" mb={4} />
          <Text>Loading...</Text>
        </Box>
      </Center>
    );
  }

  // If not loading and user exists, render children
  return user ? <>{children}</> : null;
};

export default ProtectedRoute;
