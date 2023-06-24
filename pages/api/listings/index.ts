// import { getPullUps, getPullupsNearBy, insertPullUp } from "../../../db/index";
// import { connectToDatabase } from "../../../db/mongodb";

import { getListingsWithinRadius, listingCreate, listingsFetch } from "@/db/fsdb";
import { IListing } from "../../../types";

const maxAge = 1 * 24 * 60 * 60;

const handler = async (req: any, res: any) => {
  
  const {
    query: { by, limit, lat, lng },
    method,
  } = req;
  switch (method) {
    case "GET":
      const listings =
        lat && lng
          ? await getListingsWithinRadius(
            15, [Number(lat),Number(lng)] ,
          ) : await listingsFetch("xWhZXPJoQxo1zvoQxFvJ");
            if (listings.length == 0) {
              console.log("NO LISTINGS")
            }
      res.send(listings);
      break;
    case "POST":
      // if (!req.user) {
      //   return res.status(401).send('unauthenticated');
      // }
      console.log("received POST" )
      if (!req.body)
      return res.status(400).send("You must write something");
      const listing = await listingCreate( JSON.parse(req.body) as IListing);
      console.log(listing)
      return res.json({ listing : req.body});
      break;
    default:
      res.setHeader("Allow", ["GET", "POST"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
};

// handler.post(async (req: Request | any, res: Response | any) => {
//
// });
export default handler