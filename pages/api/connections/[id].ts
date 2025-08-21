import { appFsdb } from '@/db/firebase'
import { getUserFromCookie } from '@/util/authCookies'
import { collection, deleteDoc, doc, getDoc } from 'firebase/firestore'
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

    const connectionsRef = collection(appFsdb!, 'connections')
    const connectionRef = doc(connectionsRef, id as string)

    switch (req.method) {
        case 'GET':
            try {
                const connectionDoc = await getDoc(connectionRef)
                if (!connectionDoc.exists()) {
                    return res.status(404).json({ error: 'Connection not found' })
                }
                res.status(200).json({ ...connectionDoc.data(), id: connectionDoc.id })
            } catch (error) {
                console.error('Get Connection Error:', error)
                res.status(500).json({ error: 'Failed to fetch connection' })
            }
            break

        case 'DELETE':
            try {
                await deleteDoc(connectionRef)
                res.status(200).json({ message: 'Connection deleted successfully' })
            } catch (error) {
                console.error('Delete Connection Error:', error)
                res.status(500).json({ error: 'Failed to delete connection' })
            }
            break

        default:
            res.setHeader('Allow', ['GET', 'DELETE'])
            res.status(405).end(`Method ${req.method} Not Allowed`)
    }
}