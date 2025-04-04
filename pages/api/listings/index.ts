import { listingCreate, listingsFetchAll } from "@/db/listings";
import { MAX_AGE } from "@/util/constants";
import { IListing } from "../../../types";
import { mockListings } from "../mock-data";

const handler = async (req: any, res: any) => {
  const {
    query: { by, limit, lat, lng },
    method,
  } = req;
  switch (method) {
    case "GET":
      let listings =
        // lat && lng
        //   ? await getListingsWithinRadius(
        //     15, [Number(lat),Number(lng)] ,
        //   ) :
        await listingsFetchAll();
      if (!listings || listings.length === 0) {
        console.log("NO LISTINGS, USING MOCK DATA");
        listings = mockListings;
      }
      res.setHeader(
        "Cache-Control",
        `public, max-age=${MAX_AGE}, s-maxage=${2 * MAX_AGE}`
      );
      res.send(listings);
      break;
    case "POST":
      // if (!req.user) {
      //   return res.status(401).send('unauthenticated');
      // }
      console.log("received POST");
      if (!req.body) return res.status(400).send("You must write something");
      const listing = await listingCreate(JSON.parse(req.body) as IListing);
      console.log("listing", listing);
      return res.json({ listing: req.body });
      break;
    default:
      res.setHeader("Allow", ["GET", "POST"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
};

export default handler;
