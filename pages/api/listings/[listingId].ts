import { adminDb } from "@/db/admin";
import {
  ListingUpdateSchema,
  buildAddress,
  geoFields,
  getListing,
  isVisible,
  listingOwnerId,
  toPublicListing,
} from "@/db/listingsAdmin";
import { isAdmin, requireUser } from "@/util/apiAuth";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const {
    query: { listingId },
    method,
  } = req;

  if (!listingId || typeof listingId !== "string") {
    return res.status(400).json({ error: "Invalid listing ID" });
  }

  try {
    const existing = await getListing(listingId);

    if (method === "GET") {
      if (!existing || !isVisible(existing.data)) {
        return res.status(404).json({ error: "Listing not found" });
      }
      return res.status(200).json(toPublicListing(existing.id, existing.data));
    }

    if (method !== "PUT" && method !== "DELETE") {
      res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
      return res.status(405).end(`Method ${method} Not Allowed`);
    }

    const user = await requireUser(req, res);
    if (!user) return;

    if (!existing || existing.data.deleted === true) {
      return res.status(404).json({ error: "Listing not found" });
    }
    if (listingOwnerId(existing.data) !== user.uid && !isAdmin(user)) {
      return res
        .status(403)
        .json({ error: "Only the listing owner can change this listing" });
    }

    const ref = adminDb().collection("listings").doc(listingId);
    const now = new Date().toISOString();

    if (method === "DELETE") {
      await ref.update({ deleted: true, deletedAt: now, updatedAt: now });
      return res.status(200).json({ success: true, listingId });
    }

    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const parsed = ListingUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return res.status(400).json({
        error: parsed.error.issues[0]?.message || "Invalid listing",
        issues: parsed.error.issues,
      });
    }
    const merged = { ...existing.data, ...parsed.data };
    if (!merged.phone && !merged.email && !merged.url) {
      return res
        .status(400)
        .json({ error: "Add at least one way to contact the business" });
    }
    const update: Record<string, any> = {
      ...parsed.data,
      address: buildAddress(merged),
      updatedAt: now,
    };
    if (typeof merged.lat === "number" && typeof merged.lng === "number") {
      Object.assign(update, geoFields(merged.lat, merged.lng));
    }
    await ref.update(update);
    return res
      .status(200)
      .json(toPublicListing(listingId, { ...existing.data, ...update }));
  } catch (error) {
    console.error(`Listing ${method} ${listingId} error:`, error);
    return res.status(500).json({ error: "Something went wrong" });
  }
}
