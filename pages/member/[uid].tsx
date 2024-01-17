import { useRouter } from 'next/router';

const MemberPage = () => {
    const router = useRouter()
const uid = router.query.uid;
  return (
    <div>User ID: {uid}</div>
  )
}

export default MemberPage