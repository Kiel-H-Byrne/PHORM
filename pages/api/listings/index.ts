import { appFsdb } from "@/db/firebase";
import { IListing } from "@/types";
import {
  addDoc,
  collection,
  getCountFromServer,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
  where,
} from "firebase/firestore";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (!appFsdb) {
    return res.status(500).json({ error: "Firestore is not configured" });
  }

  const listingsRef = collection(appFsdb, "listings");

  switch (req.method) {
    case "GET":
      try {
        const {
          searchQuery,
          page = "1",
          pageSize = "10",
          category,
          includeCount,
          all,
        } = req.query as {
          searchQuery?: string;
          page?: string;
          pageSize?: string;
          category?: string;
          includeCount?: string;
          all?: string;
        };

        // Base query (with optional category filter)
        let base = query(listingsRef, orderBy("createdAt", "desc"));
        if (category) {
          base = query(base, where("categories", "array-contains", category));
        }

        // If requesting all, stream through pages server-side (safe for dev datasets)
        if (all === "true") {
          const items: IListing[] = [];
          let last: any = undefined;
          const size = parseInt(pageSize || "50", 10);
          const MAX = 1000; // safety cap
          while (items.length < MAX) {
            let pageQ = query(base, limit(size));
            if (last) pageQ = query(pageQ, startAfter(last));
            const snap = await getDocs(pageQ);
            if (snap.empty) break;
            snap.docs.forEach((d) =>
              items.push({ id: d.id, ...(d.data() as any) } as IListing)
            );
            last = snap.docs[snap.docs.length - 1];
            if (snap.size < size) break;
          }
          return res.status(200).json(items);
        }

        // Paged request
        let q = query(base, limit(parseInt(pageSize || "10", 10)));
        if (parseInt(page || "1", 10) > 1) {
          const backfill = await getDocs(
            query(
              base,
              limit(
                (parseInt(page || "1", 10) - 1) * parseInt(pageSize || "10", 10)
              )
            )
          );
          if (!backfill.empty) {
            q = query(q, startAfter(backfill.docs[backfill.docs.length - 1]));
          }
        }

        const snapshot = await getDocs(q);
        let listings = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as any),
        })) as IListing[];

        // In-memory fuzzy search by name/address if searchQuery present
        if (searchQuery) {
          const term = searchQuery.toString().toLowerCase();
          listings = listings.filter(
            (l) =>
              (l.name || "").toLowerCase().includes(term) ||
              (l.address || "").toLowerCase().includes(term) ||
              (Array.isArray(l.categories) &&
                l.categories.join(" ").toLowerCase().includes(term))
          );
        }

        if (includeCount === "true") {
          const countSnap = await getCountFromServer(base);
          const total = countSnap.data().count || 0;
          const size = parseInt(pageSize || "10", 10);
          const pg = parseInt(page || "1", 10);
          const totalPages = Math.max(1, Math.ceil(total / size));
          return res
            .status(200)
            .json({
              data: listings,
              page: pg,
              pageSize: size,
              total,
              totalPages,
            });
        }

        return res.status(200).json(listings);
      } catch (error) {
        console.error("List Listings Error:", error);
        return res.status(500).json({ error: "Failed to fetch listings" });
      }

    case "POST":
      try {
        const listingData = {
          ...req.body,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        const docRef = await addDoc(listingsRef, listingData);
        return res.status(201).json({ id: docRef.id, ...listingData });
      } catch (error) {
        console.error("Create Listing Error:", error);
        return res.status(500).json({ error: "Failed to create listing" });
      }

    default:
      res.setHeader("Allow", ["GET", "POST"]);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
