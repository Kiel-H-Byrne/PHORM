import { listingsFetchById } from "@/db/listings";
import { MAX_AGE } from "../../../util/constants";

const handler = async (req: any, res: any) => {
  const {
    //can send query params to sort & limit results
    query: { listingId, name, oid, limit, from },
    method,
  } = req;
  console.log("query...");
  console.log(req.query);
  switch (method) {
    case "GET":
      const listings = await listingsFetchById("0");
      console.log("await fetching...");
      console.log(listings);
      if (req.query.from && listings?.length > 0) {
        // This is safe to cache because from defines
        //  a finite range of listings
        res.setHeader("cache-control", `public, max-age=${MAX_AGE}`);
      }

      res.send({ listings });
      break;
    case "POST":
      // if (!req.user) {
      //   return res.status(401).send('unauthenticated');
      // }
      // console.log(req.body.data)
      if (!req.body) return res.status(400).send("You must write something");
      // const listing = await insertListing(db, req.body.data);
      // return res.json({ listing });
      return res.json({});
      break;
    default:
      res.setHeader("Allow", ["GET", "POST"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
};

export default handler;
