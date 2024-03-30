// 608da9f19a70cb0805c59923

import { findUserById, updateUserById } from "@/db/users";
import { NextApiRequest, NextApiResponse } from "next";
import { getToken } from "next-auth/jwt";

const ALLOWED_METHODS = ["GET", "POST"];

export default async function userHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const token = await getToken({ req });

  const {
    query: { userId },
    method,
  } = req;
  // If the req.method isn't included in the list of allowed methods we return a 405
  if (!ALLOWED_METHODS.includes(method!) || method == "OPTIONS") {
    return res.status(405).send({ message: "Method not allowed." });
  }

  if (token) {
    switch (method) {
      case "GET":
        try {
          if (typeof userId === "string") {
            const user = await findUserById(userId);
            res.status(200).json(user);
          }
        } catch (error: any) {
          res.status(404).send({ error: error.message });
        }
        break;
      case "POST":
        // Update or create data in your database
        try {
          if (typeof userId === "string") {
            const user = await findUserById(userId);
            const newProfile = Object.assign(
              user?.profile,
              JSON.parse(req.body)
            );
            updateUserById(userId, newProfile);
            res.status(200);
          }
        } catch (error: any) {
          res.status(404).send({ error: error.message });
        }
        res.status(200).json({ userId: userId, name: "John Doe" });
        break;
      default:
        res.setHeader("Allow", ["GET", "POST"]);
        res.status(405).end(`Method ${method} Not Allowed`);
    }
  }
}
