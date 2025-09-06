import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { email } = req.query;

  if (!email || typeof email !== 'string') {
    return res.status(400).json({ message: 'Email is required' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: {
        email: email
      }
    });

    return res.status(200).json({ exists: !!user });
  } catch (error) {
    console.error('Error checking user:', error);
    return res.status(500).json({ message: 'Error checking user in database' });
  } finally {
    await prisma.$disconnect();
  }
}
