import MemberCard from "@/components/MemberCard";
import fetcher from "@/util/fetch";
import { useRouter } from "next/router";
import useSWR from "swr";

const MemberPage = () => {
  const {query: {uid}} = useRouter();
  const { data } = useSWR(`/api/users/${uid}`, fetcher);
  return data && <MemberCard user={data} />;
};

export default MemberPage;
