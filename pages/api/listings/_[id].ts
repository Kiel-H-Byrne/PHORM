import { appFsdb } from '@/db/firebase'
import { getUserFromCookie } from '@/util/authCookies'
import { collection, deleteDoc, doc, getDoc, updateDoc } from 'firebase/firestore'
import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const user = getUserFromCookie()
    if (!user) {
        return res.status(401).json({ error: 'Not authenticated' })
    }

    const { id } = req.query
    const listingsRef = collection(appFsdb!, 'listings')
    const listingRef = doc(listingsRef, id as string)

    switch (req.method) {
        case 'GET':
            try {
                const listingDoc = await getDoc(listingRef)
                if (!listingDoc.exists()) {
                    return res.status(404).json({ error: 'Listing not found' })
                }
                res.status(200).json({ ...listingDoc.data(), id: listingDoc.id })
            } catch (error) {
                console.error('Get Listing Error:', error)
                res.status(500).json({ error: 'Failed to fetch listing' })
            }
            break

        case 'PUT':
            try {
                const updates = req.body
                await updateDoc(listingRef, {
                    ...updates,
                    updatedAt: new Date().toISOString()
                })
                const updated = await getDoc(listingRef)
                res.status(200).json({ ...updated.data(), id: updated.id })
            } catch (error) {
                console.error('Update Listing Error:', error)
                res.status(500).json({ error: 'Failed to update listing' })
            }
            break

        case 'DELETE':
            try {
                await deleteDoc(listingRef)
                res.status(200).json({ message: 'Listing deleted successfully' })
            } catch (error) {
                console.error('Delete Listing Error:', error)
                res.status(500).json({ error: 'Failed to delete listing' })
            }
            break

        default:
            res.setHeader('Allow', ['GET', 'PUT', 'DELETE'])
            res.status(405).end(`Method ${req.method} Not Allowed`)
    }
}