import { appFsdb } from "@/db/firebase";
import { IListing } from "@/types";
import { getUserFromCookie } from "@/util/authCookies";
import { STATE_ABBREVIATIONS } from "@/util/constants";
import { faker } from "@faker-js/faker";
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

const categories = [
  "Restaurant",
  "Retail",
  "Professional Services",
  "Healthcare",
  "Automotive",
  "Beauty & Wellness",
  "Education",
  "Real Estate",
  "Construction",
  "Technology",
  "Entertainment",
  "Finance",
];

const generateMockListings = (count: number = 100) => {
  const listings: IListing[] = [];

  const businessCategories = [
    "Restaurant",
    "Retail",
    "Professional Services",
    "Healthcare",
    "Automotive",
    "Beauty & Wellness",
    "Education",
    "Real Estate",
    "Construction",
    "Technology",
    "Entertainment",
    "Finance",
  ];

  for (let i = 0; i < count; i++) {
    const state = faker.helpers.arrayElement(STATE_ABBREVIATIONS);
    const street = `${faker.location.buildingNumber()} ${faker.location.street()}`;
    const city = faker.location.city();
    const zip = faker.location.zipCode("#####");
    const address = `${street} ${city} ${state} ${zip}`;
    const listing: IListing = {
      name: faker.company.name(),
      description: faker.company.buzzPhrase(),
      street,
      city,
      state,
      zip: parseInt(zip),
      address,
      lat: faker.location.latitude({ min: 37.75, max: 39.5 }),
      lng: faker.location.longitude({ min: -79.6, max: -74.0 }),
      imageUri: `https://picsum.photos/picsum/300/100`,
      submitted: faker.date.past(),
      creator: faker.string.ulid(),
      phone: faker.phone.number("###-###-####"),
      email: faker.internet.email(),
      url: faker.internet.url(),
      place_id: `place_${faker.string.alphanumeric(27)}`,
      isPremium: faker.datatype.boolean({ probability: 0.2 }),
      categories: faker.helpers.arrayElements(businessCategories, {
        min: 1,
        max: 3,
      }),
      businessHours: `Mon-Fri: ${faker.helpers.arrayElement([
        "9:00 AM - 5:00 PM",
        "8:00 AM - 6:00 PM",
        "10:00 AM - 8:00 PM",
      ])}`,
      social: {
        facebook: faker.datatype.boolean({ probability: 0.6 })
          ? faker.internet.url()
          : "",
        instagram: faker.datatype.boolean({ probability: 0.7 })
          ? faker.internet.url()
          : "",
        twitter: faker.datatype.boolean({ probability: 0.4 })
          ? faker.internet.url()
          : "",
      },
      claims: [],
      claimsCount: 0,
    };
    listings.push(listing);
  }

  return listings;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const user = getUserFromCookie();

  const listingsRef = collection(appFsdb!, "listings");

  switch (req.method) {
    case "GET":
      if (!user) {
        console.log("API demo mode, must log in for actual data.");
        return res.status(200).json(generateMockListings(50));
      }

      try {
        const {
          searchQuery,
          page = "1",
          pageSize = "10",
          category,
        } = req.query;

        let q = query(listingsRef, orderBy("createdAt", "desc"));

        if (category) {
          q = query(q, where("category", "==", category));
        }

        if (searchQuery) {
          q = query(
            q,
            where("title", ">=", searchQuery),
            where("title", "<=", searchQuery + "\uf8ff")
          );
        }

        // Add pagination
        q = query(q, limit(parseInt(pageSize as string)));
        if (parseInt(page as string) > 1) {
          const lastVisible = await getDocs(
            query(
              q,
              limit(
                (parseInt(page as string) - 1) * parseInt(pageSize as string)
              )
            )
          );
          q = query(
            q,
            startAfter(lastVisible.docs[lastVisible.docs.length - 1])
          );
        }

        const querySnapshot = await getDocs(q);
        const listings = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        res.status(200).json(listings);
      } catch (error) {
        console.error("List Listings Error:", error);
        res.status(500).json({ error: "Failed to fetch listings" });
      }
      break;

    case "POST":
      try {
        const listingData = {
          ...req.body,
          userId: user.uid,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        const docRef = await addDoc(listingsRef, listingData);
        res.status(201).json({ id: docRef.id, ...listingData });
      } catch (error) {
        console.error("Create Listing Error:", error);
        res.status(500).json({ error: "Failed to create listing" });
      }
      break;

    default:
      res.setHeader("Allow", ["GET", "POST"]);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
