import { appFsdb } from "@/db/firebase";
import { IUser } from "@/types";
import {
  CollectionReference,
  QueryConstraint,
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { NextApiRequest, NextApiResponse } from "next";

const maxAge = 1 * 24 * 60 * 60;

const userHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  const {
    //@ts-ignore
    //can send query params to sort & limit results
    query: { id, name, by, limit, from, occupation, location },
    method,
  } = req;
  switch (method) {
    case "GET":
      if (appFsdb) {
        let membersRef = collection(appFsdb, "users");
        const queries: QueryConstraint[] = [];

        if (id) {
          queries.push(where("id", "==", id));
        }

        if (name) {
          queries.push(
            where("firstName", ">=", name),
            where("firstName", "<=", name + "~")
          );
        }

        if (location) {
          queries.push(where("location", "==", location));
        }

        if (occupation) {
          queries.push(where("occupation", "==", occupation));
        }

        if (queries.length > 0) {
          const q = query(membersRef, ...queries) as CollectionReference<IUser>;
          membersRef = q;
        }

        const membersSnapshot = await getDocs(membersRef);
        const members: IUser[] = [];

        membersSnapshot.forEach((doc) => {
          members.push({id: doc.id, ...doc.data()} as IUser);
        });
        // console.log(res);
        if (from && members.length > 0) {
          // This is safe to cache because from defines
          //  a concrete range of orders
          res.setHeader("cache-control", `public, max-age=${maxAge}`);
        }
        res.status(200).json(members);
      } else {
        res.status(200).json("NO DB LOADED");
      }
      break;
    case "POST":
      // if (!req.user) {
      //   return res.status(401).send('unauthenticated');
      // }

      if (!req.body) return res.status(400).send("You must write something");

      // const order = await insertUser(db, req.body.data);
      // return res.json({ order });
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
