import { appFsdb } from '@/db/firebase'
import { getUserFromCookie } from '@/util/authCookies'
import { collection, getDocs, limit, orderBy, query, startAfter, where } from 'firebase/firestore'
import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const user = getUserFromCookie()
    if (!user) {
        return res.status(401).json({ error: 'Not authenticated' })
    }

    if (req.method !== 'GET') {
        res.setHeader('Allow', ['GET'])
        return res.status(405).end(`Method ${req.method} Not Allowed`)
    }

    try {
        const membersRef = collection(appFsdb!, 'users')
        const { searchQuery, page = '1', pageSize = '10' } = req.query

        let q = query(membersRef, orderBy('firstName'))

        if (searchQuery) {
            q = query(
                membersRef,
                where('firstName', '>=', searchQuery),
                where('firstName', '<=', searchQuery + '\uf8ff')
            )
        }

        // Add pagination
        q = query(q, limit(parseInt(pageSize as string)))
        if (parseInt(page as string) > 1) {
            // Get the last visible document from the previous page
            const lastVisible = await getDocs(
                query(q, limit((parseInt(page as string) - 1) * parseInt(pageSize as string)))
            )
            q = query(q, startAfter(lastVisible.docs[lastVisible.docs.length - 1]))
        }

        const querySnapshot = await getDocs(q)
        const members = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }))

        res.status(200).json(members)
    } catch (error) {
        console.error('List Members Error:', error)
        res.status(500).json({ error: 'Failed to fetch members' })
    }
}