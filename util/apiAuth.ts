// Server-only helpers for authenticating API requests with Firebase ID tokens.
import { adminAuth } from "@/db/admin";
import type { DecodedIdToken } from "firebase-admin/auth";
import type { NextApiRequest, NextApiResponse } from "next";

export async function getRequestUser(
  req: NextApiRequest
): Promise<DecodedIdToken | null> {
  const header = req.headers.authorization || "";
  const match = header.match(/^Bearer (.+)$/);
  if (!match) return null;
  try {
    return await adminAuth().verifyIdToken(match[1]);
  } catch {
    return null;
  }
}

/** Returns the verified user, or sends a 401 and returns null. */
export async function requireUser(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<DecodedIdToken | null> {
  const user = await getRequestUser(req);
  if (!user) {
    res.status(401).json({ error: "Authentication required" });
    return null;
  }
  return user;
}

/** Admins are granted via a custom claim: setCustomUserClaims(uid, { admin: true }). */
export const isAdmin = (user: DecodedIdToken | null) => user?.admin === true;
