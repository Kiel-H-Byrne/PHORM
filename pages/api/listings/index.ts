import { adminDb } from "@/db/admin";
import {
  ListingCreateSchema,
  buildAddress,
  geoFields,
  getVisibleListings,
  listingOwnerId,
  matchesSearch,
  toPublicListing,
  withDistance,
} from "@/db/listingsAdmin";
import { IListing } from "@/types";
import { requireUser } from "@/util/apiAuth";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  switch (req.method) {
    case "GET":
      try {
        const {
          searchQuery,
          page = "1",
          pageSize = "12",
          category,
          creator,
          includeCount,
          all,
          near,
        } = req.query as Record<string, string | undefined>;

        let listings: IListing[] = await getVisibleListings();

        if (creator) {
          listings = listings.filter((l) => listingOwnerId(l) === creator);
        }
        if (category) {
          const c = category.toLowerCase();
          listings = listings.filter((l) =>
            (l.categories || []).some((x) => x.toLowerCase() === c)
          );
        }
        if (searchQuery?.trim()) {
          listings = listings.filter((l) => matchesSearch(l, searchQuery));
        }

        const [lat, lng] = (near || "").split(",").map(Number);
        if (near && Number.isFinite(lat) && Number.isFinite(lng)) {
          listings = withDistance(listings, [lat, lng]);
        } else {
          listings.sort((a: any, b: any) =>
            (b.createdAt || "").localeCompare(a.createdAt || "")
          );
        }

        if (all === "true") return res.status(200).json(listings);

        const size = Math.min(Math.max(parseInt(pageSize, 10) || 12, 1), 100);
        const total = listings.length;
        const totalPages = Math.max(1, Math.ceil(total / size));
        const pg = Math.min(Math.max(parseInt(page, 10) || 1, 1), totalPages);
        const data = listings.slice((pg - 1) * size, pg * size);

        if (includeCount === "true") {
          return res
            .status(200)
            .json({ data, page: pg, pageSize: size, total, totalPages });
        }
        return res.status(200).json(data);
      } catch (error) {
        console.error("List Listings Error:", error);
        return res.status(500).json({ error: "Failed to fetch listings" });
      }

    case "POST": {
      const user = await requireUser(req, res);
      if (!user) return;
      try {
        const body =
          typeof req.body === "string" ? JSON.parse(req.body) : req.body;
        const parsed = ListingCreateSchema.safeParse(body);
        if (!parsed.success) {
          return res.status(400).json({
            error: parsed.error.issues[0]?.message || "Invalid listing",
            issues: parsed.error.issues,
          });
        }
        const input = parsed.data;
        const now = new Date().toISOString();
        const docRef = adminDb().collection("listings").doc();
        const listing = {
          ...input,
          ...geoFields(input.lat, input.lng),
          address: buildAddress(input),
          id: docRef.id,
          creator: {
            id: user.uid,
            name: user.name || null,
            email: user.email || null,
          },
          status: "active",
          isPremium: false,
          claimsCount: 0,
          createdAt: now,
          updatedAt: now,
        };
        await docRef.set(listing);
        return res.status(201).json(toPublicListing(docRef.id, listing));
      } catch (error) {
        console.error("Create Listing Error:", error);
        return res.status(500).json({ error: "Failed to create listing" });
      }
    }

    default:
      res.setHeader("Allow", ["GET", "POST"]);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
