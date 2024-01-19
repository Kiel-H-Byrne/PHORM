// 608da9f19a70cb0805c59923

import { findUserById } from "@/db/users";
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
        if (typeof userId === "string") {
          const user = await findUserById(userId);
          res.status(200).json(user);
        }
      } catch (error: any) {
        res.status(404).send({ error: error.message });
      }
      break;
    default:
      res.setHeader("Allow", ["GET"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
