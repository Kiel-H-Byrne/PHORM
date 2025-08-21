import MemberCard from "@/components/MemberCard";
import { useFetchUser } from "@/util/userHooks";
import { useRouter } from "next/router";

const MemberPage = () => {
  const {
    query: { uid },
  } = useRouter();
  const user = useFetchUser(uid);
  return user ? <MemberCard user={user} /> : <>No UsEr INFo</>;
};

export default MemberPage;
