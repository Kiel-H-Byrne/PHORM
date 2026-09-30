import {
  isListedInDirectory,
  toPublicMember,
  usersCollection,
} from "@/db/usersAdmin";
import { requireUser } from "@/util/apiAuth";
import { NextApiRequest, NextApiResponse } from "next";

const userHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
  const authUser = await requireUser(req, res);
  if (!authUser) return;

  try {
    const { name, occupation, location } = req.query as Record<
      string,
      string | undefined
    >;
    const snap = await usersCollection().limit(1000).get();
    const contains = (value: unknown, term?: string) =>
      !term ||
      String(value ?? "")
        .toLowerCase()
        .includes(term.toLowerCase());

    const members = snap.docs
      .filter((d) => isListedInDirectory(d.data()))
      .map((d) => toPublicMember(d.id, d.data()))
      .filter(
        (m) =>
          contains(
            `${m.profile.firstName ?? ""} ${m.profile.lastName ?? ""} ${
              m.name
            }`,
            name
          ) &&
          contains(m.profile.occupation, occupation) &&
          contains(m.profile.location, location)
      );
    return res.status(200).json(members);
  } catch (error) {
    console.error("/api/users error:", error);
    return res.status(500).json({ error: "Failed to fetch members" });
  }
};

export default userHandler;
