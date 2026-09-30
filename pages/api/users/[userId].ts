import {
  ProfileUpdateSchema,
  isListedInDirectory,
  toPublicMember,
  usersCollection,
} from "@/db/usersAdmin";
import { isAdmin, requireUser } from "@/util/apiAuth";
import { NextApiRequest, NextApiResponse } from "next";

export default async function userHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const {
    query: { userId },
    method,
  } = req;
  if (typeof userId !== "string") {
    return res.status(400).json({ error: "Invalid user ID" });
  }

  const authUser = await requireUser(req, res);
  if (!authUser) return;
  const isSelf = authUser.uid === userId;
  const ref = usersCollection().doc(userId);

  try {
    switch (method) {
      case "GET": {
        const snap = await ref.get();
        if (!snap.exists) {
          if (!isSelf) return res.status(404).json({ error: "Not found" });
          const [firstName = "", ...rest] = (authUser.name || "").split(" ");
          const created = {
            id: userId,
            name: authUser.name || authUser.phone_number || "New Member",
            email: authUser.email || "",
            image: authUser.picture || "",
            emailVerified: authUser.email_verified ?? false,
            createdAt: new Date().toISOString(),
            profile: {
              firstName,
              lastName: rest.join(" "),
              contact: {
                email: authUser.email || "",
                phone: authUser.phone_number || "",
              },
              orgs: [],
            },
          };
          await ref.set(created);
          return res.status(200).json(created);
        }
        const data = snap.data()!;
        if (!isSelf && !isAdmin(authUser) && !isListedInDirectory(data)) {
          return res.status(404).json({ error: "Not found" });
        }
        return res
          .status(200)
          .json(
            isSelf || isAdmin(authUser)
              ? { ...data, id: snap.id }
              : toPublicMember(snap.id, data)
          );
      }

      case "POST":
      case "PUT": {
        if (!isSelf) {
          return res
            .status(403)
            .json({ error: "You can only edit your own profile" });
        }
        const body =
          typeof req.body === "string" ? JSON.parse(req.body) : req.body;
        const parsed = ProfileUpdateSchema.safeParse(body);
        if (!parsed.success) {
          return res.status(400).json({
            error: parsed.error.issues[0]?.message || "Invalid profile",
          });
        }
        const snap = await ref.get();
        const current = snap.data() || { id: userId, profile: {} };
        const profile = { ...(current.profile || {}), ...parsed.data };
        await ref.set({ ...current, id: userId, profile }, { merge: true });
        return res.status(200).json({ success: true, userId, profile });
      }

      default:
        res.setHeader("Allow", ["GET", "POST", "PUT"]);
        return res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (error) {
    console.error(`/api/users/${userId} ${method} error:`, error);
    return res.status(500).json({ error: "Something went wrong" });
  }
}
