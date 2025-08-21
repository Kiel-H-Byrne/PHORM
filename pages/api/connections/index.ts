import { appFsdb } from '@/db/firebase'
import { getUserFromCookie } from '@/util/authCookies'
import { addDoc, collection, getDocs, query, where } from 'firebase/firestore'
import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const user = getUserFromCookie()
    if (!user) {
        return res.status(401).json({ error: 'Not authenticated' })
    }

    const connectionsRef = collection(appFsdb!, 'connections')

    switch (req.method) {
        case 'GET':
            try {
                const q = query(
                    connectionsRef,
                    where('senderId', '==', user.uid)
                )
                const querySnapshot = await getDocs(q)
                const connections = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }))
                res.status(200).json(connections)
            } catch (error) {
                console.error('List Connections Error:', error)
                res.status(500).json({ error: 'Failed to fetch connections' })
            }
            break

        case 'POST':
            try {
                const { targetMemberId, message } = req.body
                const newConnection = {
                    senderId: user.uid,
                    receiverId: targetMemberId,
                    message,
                    status: 'PENDING',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                }

                const docRef = await addDoc(connectionsRef, newConnection)
                res.status(201).json({ id: docRef.id, ...newConnection })
            } catch (error) {
                console.error('Create Connection Error:', error)
                res.status(500).json({ error: 'Failed to create connection' })
            }
            break

        default:
            res.setHeader('Allow', ['GET', 'POST'])
            res.status(405).end(`Method ${req.method} Not Allowed`)
    }
}