import {
  isListedInDirectory,
  toPublicMember,
  usersCollection,
} from "@/db/usersAdmin";
import { requireUser } from "@/util/apiAuth";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const {
    query: { classYear },
    method,
  } = req;

  if (method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).end(`Method ${method} Not Allowed`);
  }
  const authUser = await requireUser(req, res);
  if (!authUser) return;

  const classYearNumber = parseInt(String(classYear), 10);
  if (isNaN(classYearNumber)) {
    return res.status(400).json({ error: "Invalid class year" });
  }

  try {
    const snap = await usersCollection()
      .where("profile.classYear", "==", classYearNumber)
      .get();
    const users = snap.docs
      .filter((d) => isListedInDirectory(d.data()))
      .map((d) => toPublicMember(d.id, d.data()));
    res.setHeader("Cache-Control", "private, max-age=300");
    return res.status(200).json({ users });
  } catch (error) {
    console.error(`Error fetching users for class year ${classYear}:`, error);
    return res.status(500).json({ error: "Failed to fetch users" });
  }
}
