import express from 'express';
import { ObjectId } from 'mongodb';
import { v2 as cloudinary } from 'cloudinary';
import { authenticateToken } from '../middleware/auth.js';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const router = express.Router();

router.get('/me', authenticateToken, async (req, res) => {
  try {
    const profilesCollection = req.db.collection('profiles');
    const profile = await profilesCollection.findOne({ user_id: new ObjectId(req.user.id) });

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    res.json({
      id: profile._id,
      user_id: profile.user_id,
      email: profile.email,
      full_name: profile.full_name,
      avatar_url: profile.avatar_url,
      bio: profile.bio,
      fitness_goal: profile.fitness_goal,
      experience_level: profile.experience_level,
      is_admin: profile.is_admin,
      created_at: profile.created_at,
      updated_at: profile.updated_at
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

router.put('/me', authenticateToken, async (req, res) => {
  try {
    const { full_name, avatar_url, bio, fitness_goal, experience_level } = req.body;
    const profilesCollection = req.db.collection('profiles');

    const result = await profilesCollection.findOneAndUpdate(
      { user_id: new ObjectId(req.user.id) },
      {
        $set: {
          full_name: full_name || '',
          avatar_url: avatar_url || '',
          bio: bio || '',
          fitness_goal: fitness_goal || '',
          experience_level: experience_level || 'beginner',
          updated_at: new Date()
        }
      },
      { returnDocument: 'after' }
    );

    if (!result.value) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    res.json({
      message: 'Profile updated successfully',
      profile: result.value
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

router.post('/upload-avatar', authenticateToken, async (req, res) => {
  try {
    const { imageUrl } = req.body;

    if (!imageUrl) {
      return res.status(400).json({ error: 'No image URL provided' });
    }

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(imageUrl, {
      folder: 'smartfit/profiles',
      resource_type: 'auto',
      quality: 'auto',
      fetch_format: 'auto'
    });

    // Update user profile with new avatar URL
    const profilesCollection = req.db.collection('profiles');
    const updateResult = await profilesCollection.findOneAndUpdate(
      { user_id: new ObjectId(req.user.id) },
      {
        $set: {
          avatar_url: result.secure_url,
          updated_at: new Date()
        }
      },
      { returnDocument: 'after' }
    );

    res.json({
      message: 'Avatar uploaded successfully',
      avatar_url: result.secure_url,
      profile: updateResult.value
    });
  } catch (error) {
    console.error('Avatar upload error:', error);
    res.status(500).json({ error: 'Failed to upload avatar' });
  }
});

export default router;
