import { ProtectedRoute, UserDashboard } from "@/components";
import { useAuth } from "@/contexts/AuthContext";
import { Container } from "@chakra-ui/react";
import Head from "next/head";

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <ProtectedRoute>
      <Head>
        <title>Dashboard | PHORM</title>
      </Head>

      <Container maxW="container.xl" py={8}>
        <UserDashboard userId={user?.uid} />
      </Container>
    </ProtectedRoute>
  );
};

export default Dashboard;
