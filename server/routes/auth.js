import express from 'express';
import bcrypt from 'bcryptjs';
import { ObjectId } from 'mongodb';
import { generateToken, authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/signup', async (req, res) => {
  try {
    const { email, password, full_name } = req.body;

    if (!email || !password || !full_name) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const usersCollection = req.db.collection('users');
    const profilesCollection = req.db.collection('profiles');

    const existingUser = await usersCollection.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = new ObjectId();

    await usersCollection.insertOne({
      _id: userId,
      email,
      password: hashedPassword,
      created_at: new Date()
    });

    await profilesCollection.insertOne({
      user_id: userId,
      email,
      full_name,
      avatar_url: '',
      bio: '',
      fitness_goal: '',
      experience_level: 'beginner',
      is_admin: false,
      created_at: new Date(),
      updated_at: new Date()
    });

    const token = generateToken(userId.toString(), email, false);

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: { id: userId, email, full_name }
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Missing email or password' });
    }

    const usersCollection = req.db.collection('users');
    const user = await usersCollection.findOne({ email });

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const profilesCollection = req.db.collection('profiles');
    const profile = await profilesCollection.findOne({ user_id: user._id });

    const token = generateToken(user._id.toString(), user.email, profile?.is_admin || false);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        full_name: profile?.full_name || '',
        is_admin: profile?.is_admin || false
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

router.get('/me', authenticateToken, async (req, res) => {
  try {
    const profilesCollection = req.db.collection('profiles');
    const profile = await profilesCollection.findOne({ user_id: new ObjectId(req.user.id) });

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    res.json({
      id: profile.user_id,
      email: profile.email,
      full_name: profile.full_name,
      avatar_url: profile.avatar_url,
      bio: profile.bio,
      fitness_goal: profile.fitness_goal,
      experience_level: profile.experience_level,
      is_admin: profile.is_admin
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

export default router;
