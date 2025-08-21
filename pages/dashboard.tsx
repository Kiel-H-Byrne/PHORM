import { ProtectedRoute, UserDashboard } from "@/components";
import { Container } from "@chakra-ui/react";
import Head from "next/head";

const Dashboard = () => {
  return (
    <ProtectedRoute>
      <Head>
        <title>Dashboard | PHORM</title>
      </Head>

      <Container maxW="container.xl" py={8}>
        <UserDashboard />
      </Container>
    </ProtectedRoute>
  );
};

export default Dashboard;
