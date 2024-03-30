import { listingCreate, listingsFetchAll, listingsFetchAnonymous } from "@/db/listings";
import { MAX_AGE } from "@/util/constants";
import console from "console";
import { NextApiRequest, NextApiResponse } from "next";
import { getToken } from "next-auth/jwt";
import { IListing } from "../../../types";

const ALLOWED_METHODS = ['GET', 'POST'];

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const token = await getToken({ req })

  const {
    query: { by, limit, lat, lng },
    method,
  } = req;
  // If the req.method isn't included in the list of allowed methods we return a 405
  if (!ALLOWED_METHODS.includes(method!) || method == 'OPTIONS') {
    return res.status(405).send({ message: 'Method not allowed.' });
  }
  console.log("token", token);
  switch (method) {
    case "GET":
      const listings =
        // lat && lng
        //   ? await getListingsWithinRadius(
        //     15, [Number(lat),Number(lng)] ,
        //   ) :
        //if not logged in, get randomized data
        token ? await listingsFetchAll() : await listingsFetchAnonymous();
      if (listings?.length == 0) {

        console.log("NO LISTINGS");
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
      res.setHeader("Allow", ALLOWED_METHODS);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
};

export default handler;
