import { appFsdb } from '@/db/firebase'
import { getUserFromCookie } from '@/util/authCookies'
import { addDoc, collection, getDocs, limit, orderBy, query, startAfter, where } from 'firebase/firestore'
import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const user = getUserFromCookie()
  if (!user) {
    return res.status(401).json({ error: 'Not authenticated' })
  }

  const listingsRef = collection(appFsdb!, 'listings')

  switch (req.method) {
    case 'GET':
      try {
        const { searchQuery, page = '1', pageSize = '10', category } = req.query

        let q = query(listingsRef, orderBy('createdAt', 'desc'))

        if (category) {
          q = query(q, where('category', '==', category))
        }

        if (searchQuery) {
          q = query(
            q,
            where('title', '>=', searchQuery),
            where('title', '<=', searchQuery + '\uf8ff')
          )
        }

        // Add pagination
        q = query(q, limit(parseInt(pageSize as string)))
        if (parseInt(page as string) > 1) {
          const lastVisible = await getDocs(
            query(q, limit((parseInt(page as string) - 1) * parseInt(pageSize as string)))
          )
          q = query(q, startAfter(lastVisible.docs[lastVisible.docs.length - 1]))
        }

        const querySnapshot = await getDocs(q)
        const listings = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))

        res.status(200).json(listings)
      } catch (error) {
        console.error('List Listings Error:', error)
        res.status(500).json({ error: 'Failed to fetch listings' })
      }
      break

    case 'POST':
      try {
        const listingData = {
          ...req.body,
          userId: user.uid,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }

        const docRef = await addDoc(listingsRef, listingData)
        res.status(201).json({ id: docRef.id, ...listingData })
      } catch (error) {
        console.error('Create Listing Error:', error)
        res.status(500).json({ error: 'Failed to create listing' })
      }
      break

    default:
      res.setHeader('Allow', ['GET', 'POST'])
      res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}
