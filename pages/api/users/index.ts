import { getUsers, insertUser } from "../../../db/index";
import { connectToDatabase } from "../../../db/mongodb";

const maxAge = 1 * 24 * 60 * 60;

const userHandler = async (req: any, res: any) => {
  const db = await connectToDatabase();

  const {
    //@ts-ignore
    //can send query params to sort & limit results
    query: { id, name, by, limit, from },
    method,
  } = req;
  switch (method) {
    case "GET":
      const orders = await getUsers(
        db,
        // req.query.from ? req.query.from : undefined,
        // req.query.by,
        // req.query.limit ? parseInt(req.query.limit, 10) : 100
      );

      if (req.query.from && orders.length > 0) {
        // This is safe to cache because from defines
        //  a concrete range of orders
        res.setHeader("cache-control", `public, max-age=${maxAge}`);
      }
      res.send({ orders });
      break;
    case "POST":
      // if (!req.user) {
        //   return res.status(401).send('unauthenticated');
        // }

        if (!req.body)
          return res.status(400).send("You must write something");
        
        const order = await insertUser(db, req.body.data);
        return res.json({ order });
      break;
    default:
      res.setHeader("Allow", ["GET", "POST"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
};

// handler.post(async (req: Request | any, res: Response | any) => {
//
// });

export default userHandler;
