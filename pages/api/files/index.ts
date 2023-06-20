
import { GridFSBucket } from "mongodb";
import { cachedBucket, connectToDatabase } from "../../../db";

export default async function uploadHandler(req: any, res: any) {
  const { method } = req
  const db = await connectToDatabase()
  const bucket = cachedBucket || new GridFSBucket(db);

  switch (method) {
    case 'GET':
      try {
        const files = await db.collection("uploads.files").find().toArray()
        if (!files || files.length === 0) {
          return res.status(404).json({ err: 'No file exist' });
        } else {
          files.map((file: any) => {
            if (
              file.contentType === 'image/jpeg' ||
              file.contentType === 'image/jpg' ||
              file.contentType === 'image/png'
            ) {
              file.isImage = true;
            } else {
              file.isImage = false;
            }
          });
          return res.send(files);
        }
      } catch (error) {
        res.status(400).json({ itemnotfound: "No file found" })
      }
      break

    case "PUT":
      console.log(req.body)
      const blob = req.body.blob as Blob
      try {
        if (!blob) throw Error('no object')
        bucket.openUploadStream(req.body.fileName, {
          chunkSizeBytes: blob.size,
          metadata: { type: blob.type }
        }).
          on('error', function (error) {
            res.send(error);
          }).
          on('finish', function () {
            console.log('done!');
          }).write(await blob.arrayBuffer());
      } catch (error) {
        console.warn('danger will robinson')
        res.send(error)
      }
      break
    
    default:
      res.status(400).json({ itemnotfound: "No file" })
      break
  }
}


