import { appFsdb } from "@/db/firebase";
import { IListing } from "@/types";
import {
  addDoc,
  collection,
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
        } = req.query as {
          searchQuery?: string;
          page?: string;
          pageSize?: string;
          category?: string;
        };

        let q = query(listingsRef, orderBy("createdAt", "desc"));

        if (category) {
          // categories is an array field
          q = query(q, where("categories", "array-contains", category));
        }

        // Basic pagination
        q = query(q, limit(parseInt(pageSize || "10", 10)));
        if (parseInt(page || "1", 10) > 1) {
          const backfill = await getDocs(
            query(
              q,
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
