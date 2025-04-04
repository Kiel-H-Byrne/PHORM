// 608da9f19a70cb0805c59923

import { findUserById, updateUserById } from "@/db/users";
import console from "console";
import { NextApiRequest, NextApiResponse } from "next";

export default async function userHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const {
    query: { userId },
    method,
  } = req;
  switch (method) {
    case "GET":
      try {
        console.log("userId", userId);
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
          const newProfile = Object.assign(user?.profile, JSON.parse(req.body));
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
