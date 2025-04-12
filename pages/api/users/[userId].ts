// 608da9f19a70cb0805c59923

import { findOrCreateUser, findUserById, updateUserById } from "@/db/users";
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
          // Try to find the user
          let user = await findUserById(userId);

          // If user doesn't exist, create a basic user record
          if (!user) {
            console.log("User not found, creating basic user record");
            user = await findOrCreateUser(userId, {
              id: userId,
              name: "",
              email: "",
              image: "",
              profile: {
                orgs: [],
                lastName: "",
              },
            });
          }

          res.status(200).json(user);
        }
      } catch (error: any) {
        console.error("Error in GET /api/users/[userId]:", error);
        res.status(404).json({ error: error.message });
      }
      break;
    case "POST":
      // Update or create data in your database
      try {
        if (typeof userId === "string") {
          // Try to find the user
          let user = await findUserById(userId);

          // If user doesn't exist, create a basic user record
          if (!user) {
            console.log(
              "User not found, creating basic user record before update"
            );
            user = await findOrCreateUser(userId, {
              id: userId,
              name: "",
              email: "",
              image: "",
              profile: {
                orgs: [],
                lastName: "",
              },
            });
          }

          // Parse the request body
          const updateData = JSON.parse(req.body);
          console.log("Updating user profile:", updateData);

          // Update the user profile
          const newProfile = Object.assign(user?.profile || {}, updateData);
          await updateUserById(userId, newProfile);

          // Return success response
          return res
            .status(200)
            .json({ success: true, userId, profile: newProfile });
        }
      } catch (error: any) {
        console.error("Error in POST /api/users/[userId]:", error);
        return res.status(404).json({ error: error.message });
      }
      break;
    case "PUT":
      try {
        if (typeof userId === "string") {
          let user = await findUserById(userId);
          const updateData = req.body;
          console.log("Updating user profile:", updateData);
          // Update the user profile
          const newProfile = Object.assign(user?.profile || {}, updateData);
          await updateUserById(userId, newProfile);
          res.status(200).json(user);
        }
      } catch (error: any) {
        // console.error("Error updating [userId]:", error);
        res.status(404).json({ error: error.message });
      }
      break;
    default:
      res.setHeader("Allow", ["GET", "POST", "PUT"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
