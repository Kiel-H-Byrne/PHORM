import { appFsdb } from "@/db/firebase";
import { getUserFromCookie } from "@/util/authCookies";
import { collection, doc, getDoc } from "firebase/firestore";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const user = getUserFromCookie();
  console.log(user);
  if (!user) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  const { id } = req.query;
  const membersRef = collection(appFsdb!, "users");
  const memberRef = doc(membersRef, id as string);

  switch (req.method) {
    case "GET":
      try {
        const memberDoc = await getDoc(memberRef);
        if (!memberDoc.exists()) {
          return res.status(404).json({ error: "Member not found" });
        }
        res.status(200).json({ ...memberDoc.data(), id: memberDoc.id });
      } catch (error) {
        console.error("Get Member Error:", error);
        res.status(500).json({ error: "Failed to fetch member" });
      }
      break;

    default:
      res.setHeader("Allow", ["GET"]);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
