import express from 'express';
import { PrismaClient } from '@prisma/client';
import { body, validationResult } from 'express-validator';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// Validation middleware
const validateProfile = [
  body('name').trim().notEmpty(),
  body('bio').optional().trim(),
  body('headline').optional().trim(),
  body('photoUrl').optional().isURL(),
  body('interests').optional().isArray()
];

// Get current user's profile
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        bio: true,
        headline: true,
        photoUrl: true,
        interests: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching profile' });
  }
});

// Update profile
router.put('/me', authenticateToken, validateProfile, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, bio, headline, photoUrl, interests } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        name,
        bio,
        headline,
        photoUrl,
        interests
      },
      select: {
        id: true,
        email: true,
        name: true,
        bio: true,
        headline: true,
        photoUrl: true,
        interests: true
      }
    });

    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ error: 'Error updating profile' });
  }
});

// Delete profile
router.delete('/me', authenticateToken, async (req, res) => {
  try {
    await prisma.user.delete({
      where: { id: req.user.id }
    });

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Error deleting profile' });
  }
});

// Get public profile by ID
router.get('/:id', async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: {
        id: true,
        name: true,
        bio: true,
        headline: true,
        photoUrl: true,
        interests: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching profile' });
  }
});

// Follow a user
router.post('/:id/follow', authenticateToken, async (req, res) => {
  try {
    const userToFollow = await prisma.user.findUnique({
      where: { id: req.params.id }
    });

    if (!userToFollow) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (req.user.id === req.params.id) {
      return res.status(400).json({ error: 'Cannot follow yourself' });
    }

    await prisma.user.update({
      where: { id: req.user.id },
      data: {
        following: {
          connect: { id: req.params.id }
        }
      }
    });

    res.json({ message: 'Successfully followed user' });
  } catch (error) {
    res.status(500).json({ error: 'Error following user' });
  }
});

// Unfollow a user
router.delete('/:id/follow', authenticateToken, async (req, res) => {
  try {
    const userToUnfollow = await prisma.user.findUnique({
      where: { id: req.params.id }
    });

    if (!userToUnfollow) {
      return res.status(404).json({ error: 'User not found' });
    }

    await prisma.user.update({
      where: { id: req.user.id },
      data: {
        following: {
          disconnect: { id: req.params.id }
        }
      }
    });

    res.json({ message: 'Successfully unfollowed user' });
  } catch (error) {
    res.status(500).json({ error: 'Error unfollowing user' });
  }
});

// Get following status
router.get('/:id/follow', authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        following: {
          where: { id: req.params.id },
          select: { id: true }
        }
      }
    });

    const isFollowing = user.following.length > 0;
    res.json({ isFollowing });
  } catch (error) {
    res.status(500).json({ error: 'Error checking follow status' });
  }
});

// Like a user
router.post('/:id/like', authenticateToken, async (req, res) => {
  try {
    const userToLike = await prisma.user.findUnique({
      where: { id: req.params.id }
    });

    if (!userToLike) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (req.user.id === req.params.id) {
      return res.status(400).json({ error: 'Cannot like yourself' });
    }

    await prisma.user.update({
      where: { id: req.user.id },
      data: {
        likes: {
          connect: { id: req.params.id }
        }
      }
    });

    res.json({ message: 'Successfully liked user' });
  } catch (error) {
    res.status(500).json({ error: 'Error liking user' });
  }
});

// Unlike a user
router.delete('/:id/like', authenticateToken, async (req, res) => {
  try {
    const userToUnlike = await prisma.user.findUnique({
      where: { id: req.params.id }
    });

    if (!userToUnlike) {
      return res.status(404).json({ error: 'User not found' });
    }

    await prisma.user.update({
      where: { id: req.user.id },
      data: {
        likes: {
          disconnect: { id: req.params.id }
        }
      }
    });

    res.json({ message: 'Successfully unliked user' });
  } catch (error) {
    res.status(500).json({ error: 'Error unliking user' });
  }
});

// Get like status
router.get('/:id/like', authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        likes: {
          where: { id: req.params.id },
          select: { id: true }
        }
      }
    });

    const isLiked = user.likes.length > 0;
    res.json({ isLiked });
  } catch (error) {
    res.status(500).json({ error: 'Error checking like status' });
  }
});

export default router; 