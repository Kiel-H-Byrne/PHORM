import { adminDb } from "@/db/admin";
import { getListing, listingOwnerId } from "@/db/listingsAdmin";
import { CouponSchema } from "@/db/schemas";
import { ICoupon } from "@/types";
import { requireUser } from "@/util/apiAuth";
import { NextApiRequest, NextApiResponse } from "next";

const CouponInputSchema = CouponSchema.omit({
  id: true,
  createdBy: true,
  createdAt: true,
  updatedAt: true,
  validFrom: true,
  validUntil: true,
}).extend({
  validFrom: CouponSchema.shape.createdAt,
  validUntil: CouponSchema.shape.createdAt,
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const couponsRef = adminDb().collection("coupons");

  switch (req.method) {
    case "GET":
      try {
        const {
          searchQuery,
          page = "1",
          pageSize = "12",
          includeCount,
          all,
          listingId,
          createdBy,
          creator,
          activeOnly = "true",
        } = req.query as Record<string, string | undefined>;

        const snap = await couponsRef.limit(2000).get();
        let coupons = snap.docs.map(
          (d) => ({ ...(d.data() as ICoupon), id: d.id } as ICoupon)
        );
        const creatorId = createdBy || creator;
        if (creatorId)
          coupons = coupons.filter((c) => c.createdBy === creatorId);
        if (activeOnly === "true") coupons = coupons.filter((c) => c.active);
        if (listingId)
          coupons = coupons.filter((c) => c.listingId === listingId);
        if (searchQuery) {
          const term = searchQuery.toLowerCase();
          coupons = coupons.filter(
            (c) =>
              (c.title || "").toLowerCase().includes(term) ||
              (c.description || "").toLowerCase().includes(term) ||
              (c.tags || []).join(" ").toLowerCase().includes(term)
          );
        }
        coupons.sort((a, b) =>
          (b.createdAt || "").localeCompare(a.createdAt || "")
        );

        if (all === "true") return res.status(200).json(coupons);

        const size = Math.min(Math.max(parseInt(pageSize, 10) || 12, 1), 100);
        const total = coupons.length;
        const totalPages = Math.max(1, Math.ceil(total / size));
        const pg = Math.min(Math.max(parseInt(page, 10) || 1, 1), totalPages);
        const data = coupons.slice((pg - 1) * size, pg * size);
        if (includeCount === "true") {
          return res
            .status(200)
            .json({ data, page: pg, pageSize: size, total, totalPages });
        }
        return res.status(200).json(data);
      } catch (e) {
        console.error("Coupons GET error", e);
        return res.status(500).json({ error: "Failed to fetch coupons" });
      }

    case "POST": {
      const user = await requireUser(req, res);
      if (!user) return;
      try {
        const body =
          typeof req.body === "string" ? JSON.parse(req.body) : req.body;
        const parsed = CouponInputSchema.safeParse(body);
        if (!parsed.success || !parsed.data.title) {
          return res.status(400).json({
            error: parsed.success
              ? "Title is required"
              : parsed.error.issues[0]?.message,
          });
        }
        const input = parsed.data;
        if (input.listingId) {
          const listing = await getListing(input.listingId);
          if (!listing || listingOwnerId(listing.data) !== user.uid) {
            return res.status(403).json({
              error: "You can only add deals to your own listings",
            });
          }
        }
        const now = new Date().toISOString();
        const coupon = {
          title: input.title,
          description: input.description || "",
          discountType: input.discountType || "percent",
          value: input.value ?? null,
          code: input.code || "",
          memberOnly: input.memberOnly !== false,
          terms: input.terms || "",
          validFrom: input.validFrom || null,
          validUntil: input.validUntil || null,
          tags: input.tags || [],
          listingId: input.listingId || null,
          createdBy: user.uid,
          active: input.active !== false,
          createdAt: now,
          updatedAt: now,
        };
        const docRef = await couponsRef.add(coupon);
        return res.status(201).json({ id: docRef.id, ...coupon });
      } catch (e) {
        console.error("Coupons POST error", e);
        return res.status(500).json({ error: "Failed to create coupon" });
      }
    }

    default:
      res.setHeader("Allow", ["GET", "POST"]);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
