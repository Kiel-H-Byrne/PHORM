import { appFsdb } from "@/db/firebase";
import { ICoupon } from "@/types";
import {
  addDoc,
  collection,
  getDocs,
  getCountFromServer,
  limit,
  orderBy,
  query,
  startAfter,
  where,
} from "firebase/firestore";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!appFsdb) return res.status(500).json({ error: "Firestore is not configured" });

  const couponsRef = collection(appFsdb, "coupons");

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
          activeOnly = "true",
        } = req.query as Record<string, string | undefined>;

        let base = query(couponsRef, orderBy("createdAt", "desc"));
        if (activeOnly === "true") base = query(base, where("active", "==", true));
        if (listingId) base = query(base, where("listingId", "==", listingId));

        // Fetch all items (safe for dev-scale datasets)
        if (all === "true") {
          const items: ICoupon[] = [];
          let last: any = undefined;
          const size = parseInt(pageSize || "50", 10);
          const MAX = 1000;
          while (items.length < MAX) {
            let pageQ = query(base, limit(size));
            if (last) pageQ = query(pageQ, startAfter(last));
            const snap = await getDocs(pageQ);
            if (snap.empty) break;
            snap.docs.forEach((d) => items.push({ id: d.id, ...(d.data() as any) } as ICoupon));
            last = snap.docs[snap.docs.length - 1];
            if (snap.size < size) break;
          }

          // In-memory search
          if (searchQuery) {
            const term = searchQuery.toLowerCase();
            return res.status(200).json(
              items.filter(
                (c) =>
                  (c.title || "").toLowerCase().includes(term) ||
                  (c.description || "").toLowerCase().includes(term) ||
                  (Array.isArray(c.tags) && c.tags.join(" ").toLowerCase().includes(term))
              )
            );
          }
          return res.status(200).json(items);
        }

        // Paged request
        let q = query(base, limit(parseInt(pageSize || "12", 10)));
        if (parseInt(page || "1", 10) > 1) {
          const backfill = await getDocs(
            query(base, limit((parseInt(page || "1", 10) - 1) * parseInt(pageSize || "12", 10)))
          );
          if (!backfill.empty) q = query(q, startAfter(backfill.docs[backfill.docs.length - 1]));
        }

        const snapshot = await getDocs(q);
        let coupons = snapshot.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as ICoupon[];

        if (searchQuery) {
          const term = searchQuery.toLowerCase();
          coupons = coupons.filter(
            (c) =>
              (c.title || "").toLowerCase().includes(term) ||
              (c.description || "").toLowerCase().includes(term) ||
              (Array.isArray(c.tags) && c.tags.join(" ").toLowerCase().includes(term))
          );
        }

        if (includeCount === "true") {
          const countSnap = await getCountFromServer(base);
          const total = countSnap.data().count || 0;
          const size = parseInt(pageSize || "12", 10);
          const pg = parseInt(page || "1", 10);
          const totalPages = Math.max(1, Math.ceil(total / size));
          return res.status(200).json({ data: coupons, page: pg, pageSize: size, total, totalPages });
        }

        return res.status(200).json(coupons);
      } catch (e) {
        console.error("Coupons GET error", e);
        return res.status(500).json({ error: "Failed to fetch coupons" });
      }

    case "POST":
      try {
        const body = req.body as Partial<ICoupon>;
        const now = new Date().toISOString();
        const coupon: any = {
          title: body.title || "",
          description: body.description || "",
          discountType: body.discountType || "percent",
          value: body.value ?? null,
          code: body.code || "",
          memberOnly: body.memberOnly !== false,
          terms: body.terms || "",
          validFrom: body.validFrom || null,
          validUntil: body.validUntil || null,
          tags: Array.isArray(body.tags) ? body.tags : [],
          listingId: body.listingId || null,
          createdBy: body.createdBy || "anonymous",
          active: body.active !== false,
          createdAt: now,
          updatedAt: now,
        };
        const docRef = await addDoc(couponsRef, coupon);
        return res.status(201).json({ id: docRef.id, ...coupon });
      } catch (e) {
        console.error("Coupons POST error", e);
        return res.status(500).json({ error: "Failed to create coupon" });
      }

    default:
      res.setHeader("Allow", ["GET", "POST"]);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

