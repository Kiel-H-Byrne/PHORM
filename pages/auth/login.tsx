import FirebaseAuthUI from '@/components/FirebaseAuthUI';
import { Box, Container } from '@chakra-ui/react';
import Head from 'next/head';

const LoginPage = () => {
  return (
    <>
      <Head>
        <title>Sign In | PHORM</title>
        <meta name="description" content="Sign in to PHORM - Prince Hall Online Registry of Merchants" />
      </Head>
      
      <Container maxW="container.md" py={10}>
        <Box 
          p={8} 
          borderWidth="1px" 
          borderRadius="lg" 
          boxShadow="lg"
          bg="white"
        >
          <FirebaseAuthUI />
        </Box>
      </Container>
    </>
  );
};

export default LoginPage;
