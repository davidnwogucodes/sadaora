import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// Get all profiles (paginated)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [profiles, total] = await Promise.all([
      prisma.user.findMany({
        where: {
          NOT: {
            id: req.user.id // Exclude current user
          }
        },
        select: {
          id: true,
          name: true,
          bio: true,
          headline: true,
          photoUrl: true,
          interests: true
        },
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc'
        }
      }),
      prisma.user.count({
        where: {
          NOT: {
            id: req.user.id
          }
        }
      })
    ]);

    res.json({
      profiles,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        currentPage: page,
        perPage: limit
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching profiles' });
  }
});

// Filter profiles by interests
router.get('/filter', authenticateToken, async (req, res) => {
  try {
    const { interests } = req.query;
    const interestsArray = interests ? interests.split(',') : [];
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [profiles, total] = await Promise.all([
      prisma.user.findMany({
        where: {
          NOT: {
            id: req.user.id
          },
          ...(interestsArray.length > 0 && {
            interests: {
              hasSome: interestsArray
            }
          })
        },
        select: {
          id: true,
          name: true,
          bio: true,
          headline: true,
          photoUrl: true,
          interests: true
        },
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc'
        }
      }),
      prisma.user.count({
        where: {
          NOT: {
            id: req.user.id
          },
          ...(interestsArray.length > 0 && {
            interests: {
              hasSome: interestsArray
            }
          })
        }
      })
    ]);

    res.json({
      profiles,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        currentPage: page,
        perPage: limit
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Error filtering profiles' });
  }
});

export default router; 