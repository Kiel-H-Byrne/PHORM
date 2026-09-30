import MemberCard from "@/components/MemberCard";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useFetchUser } from "@/util/userHooks";
import { Center, Spinner } from "@chakra-ui/react";
import { useRouter } from "next/router";

const MemberPage = () => {
  const {
    query: { uid },
  } = useRouter();
  const user = useFetchUser(uid);
  return (
    <ProtectedRoute>
      <Center py={10}>{user ? <MemberCard user={user} /> : <Spinner />}</Center>
    </ProtectedRoute>
  );
};

export default MemberPage;
