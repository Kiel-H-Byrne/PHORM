import { Db, ObjectId } from "mongodb";
import { nanoid } from "nanoid";

export async function findUsersBy(db: Db, criteria: string, value: object) {
  return db
    .collection("users")
    .findOne({
      [criteria]: value,
    })
    .then((user) => user || null);
}
export async function findUserById(db: Db, userId: string) {
  const _id = new ObjectId(userId);
  return db
    .collection("users")
    .findOne({
      _id,
    })
    .then((user) => user || "No User Found for id: " + userId);
}

export async function findUserByEmail(db: Db, email: string) {
  return db
    .collection("users")
    .findOne({
      email,
    })
    .then((user) => user || null);
}

export async function updateUserById(db: Db, id: string, update: object) {
  return db
    .collection("users")
    .findOneAndUpdate({ _id: id }, { $set: update }, { returnOriginal: false })
    .then(({ value }) => value);
}

export async function insertUser(
  db: Db,
  { email, password, bio = "", name, profilePicture }: any
) {
  return db
    .collection("users")
    .insertOne({
      _id: nanoid(12),
      emailVerified: false,
      profilePicture,
      email,
      password,
      name,
      bio,
    })
    .then(({ ops }) => ops[0]);
}

export async function getUsers(db: Db) {
  const users = db
    .collection("orders")
    .find({
      // Pagination: Fetch orders from before the input date or fetch from newest
      // ...(from && {
      //   submitDate: {
      //     $lt: new Date(), //less than today
      //     $gte: new Date(from), //greater than or equal to three weeks ago
      //   },
      // }),
      // ...(by && { creatorId: by }),
    })
    .sort({ submitDate: -1 })
    // .limit(limit)
    .toArray();
  return users;
}
