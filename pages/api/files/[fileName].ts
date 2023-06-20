import { GridFSBucket, ObjectId } from "mongodb";
import { cachedBucket, connectToDatabase } from "../../../db";
import { uploadFile } from "../../../db/files";
import fs from 'fs';
import { NextApiRequest, NextApiResponse } from 'next';
import { rejects } from 'node:assert';

export default async function fileHandler(req: NextApiRequest, res: NextApiResponse) {
  const db = await connectToDatabase();
  const bucket = cachedBucket || new GridFSBucket(db);
  const {
    query: { fileName },
    method,
  } = req;
  switch (method) {
    case "GET":
      try {

        const file = await db.collection("uploads.files").findOne({ filename: fileName })
        if (!file || file.length === 0) {
          return res.status(404).json({ err: "Could not find file" });
        } else {
          console.log("1 API ", file) // gets printed out
          const readstream = fs.createReadStream(file.filename);
          readstream.pipe(res);
        }
      }
      catch (error) {
        res.status(400).json({ itemnotfound: "No image found" })
      }
      break
    case "POST":
      const blob = req.body as Blob
      try {
        if (!blob) throw Error('no object')
        bucket.openUploadStream(fileName as string, {
          chunkSizeBytes: blob.size,
          metadata: { type: blob.type }
        }).
          on('error', function (error) {
            res.send(error);
          }).
          on('finish', function () {
            console.log('done!');
          }).write(blob);
      } catch (error) {
        console.warn(error)
        res.send(error)
      }
      break
    default:
      res.setHeader("Allow", ["GET", "POST", "PUT"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }

}