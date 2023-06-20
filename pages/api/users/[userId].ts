// 608da9f19a70cb0805c59923

import { NextApiRequest, NextApiResponse } from 'next';
import { findUserById } from '../../../db/index';
import { connectToDatabase } from '../../../db/mongodb'

export default async function userHandler(req: NextApiRequest, res: NextApiResponse) {
  const db = await connectToDatabase();
  const {
    query: { userId },
    method,
  } = req
  switch (method) {
    case 'GET':
      // Get data from your database
      try {
        const user = await findUserById(db, userId as string);
        res.status(200).json(user)
      } catch (error) {
        res.status(404).send({"error": error.message})
      }
      break
    // case 'PUT':
    //   // Update or create data in your database
    //   res.status(200).json({ userId, name: name || `User ${userId}` })
    //   break
    default:
      res.setHeader('Allow', ['GET', 'PUT'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}