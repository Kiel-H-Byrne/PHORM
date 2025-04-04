import { ProtectedRoute } from '@/components';
import { useAuth } from '@/contexts/AuthContext';
import {
  Avatar,
  Box,
  Button,
  Container,
  Divider,
  Flex,
  Heading,
  SimpleGrid,
  Stat,
  StatGroup,
  StatLabel,
  StatNumber,
  Text,
  VStack,
} from '@chakra-ui/react';
import Head from 'next/head';
import { useRouter } from 'next/router';

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  return (
    <ProtectedRoute>
      <Head>
        <title>Dashboard | PHORM</title>
      </Head>
      
      <Container maxW="container.xl" py={8}>
        <VStack spacing={8} align="stretch">
          <Flex 
            justify="space-between" 
            align="center" 
            bg="blue.50" 
            p={5} 
            borderRadius="lg"
            boxShadow="md"
          >
            <Flex align="center">
              <Avatar 
                size="xl" 
                src={user?.photoURL || undefined} 
                name={user?.displayName || user?.email || user?.phoneNumber || undefined} 
                mr={4}
              />
              <Box>
                <Heading size="lg">
                  {user?.displayName || 'Welcome'}
                </Heading>
                <Text color="gray.600">
                  {user?.email || user?.phoneNumber || 'User'}
                </Text>
              </Box>
            </Flex>
            <Button colorScheme="red" onClick={handleSignOut}>
              Sign Out
            </Button>
          </Flex>

          <Divider />

          <Box>
            <Heading size="md" mb={4}>Account Overview</Heading>
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
              <StatGroup 
                bg="white" 
                p={5} 
                borderRadius="lg" 
                boxShadow="md"
              >
                <Stat>
                  <StatLabel>Listings</StatLabel>
                  <StatNumber>0</StatNumber>
                </Stat>
              </StatGroup>
              
              <StatGroup 
                bg="white" 
                p={5} 
                borderRadius="lg" 
                boxShadow="md"
              >
                <Stat>
                  <StatLabel>Verified</StatLabel>
                  <StatNumber>0</StatNumber>
                </Stat>
              </StatGroup>
              
              <StatGroup 
                bg="white" 
                p={5} 
                borderRadius="lg" 
                boxShadow="md"
              >
                <Stat>
                  <StatLabel>Favorites</StatLabel>
                  <StatNumber>0</StatNumber>
                </Stat>
              </StatGroup>
            </SimpleGrid>
          </Box>

          <Box>
            <Heading size="md" mb={4}>Actions</Heading>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
              <Button 
                size="lg" 
                colorScheme="blue" 
                height="100px"
                onClick={() => router.push('/')}
              >
                Add New Business
              </Button>
              
              <Button 
                size="lg" 
                colorScheme="green" 
                height="100px"
                onClick={() => router.push('/member-directory')}
              >
                View Member Directory
              </Button>
            </SimpleGrid>
          </Box>
        </VStack>
      </Container>
    </ProtectedRoute>
  );
};

export default Dashboard;
