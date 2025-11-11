import express from 'express';
import { ObjectId } from 'mongodb';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const classesCollection = req.db.collection('available_classes');
    const classes = await classesCollection.find({ is_active: true }).toArray();

    if (!classes.length) {
      return res.json([]);
    }

    res.json(classes.map(cls => ({
      id: cls._id,
      name: cls.name,
      description: cls.description,
      instructor: cls.instructor,
      instructor_image_url: cls.instructor_image_url,
      class_image_url: cls.class_image_url,
      schedule: cls.schedule,
      duration: cls.duration,
      price: cls.price,
      spots_available: cls.spots_available,
      max_capacity: cls.max_capacity,
      difficulty_level: cls.difficulty_level,
      is_active: cls.is_active,
      created_at: cls.created_at
    })));
  } catch (error) {
    console.error('Get classes error:', error);
    res.status(500).json({ error: 'Failed to fetch classes' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const classesCollection = req.db.collection('available_classes');
    const cls = await classesCollection.findOne({ _id: new ObjectId(req.params.id) });

    if (!cls) {
      return res.status(404).json({ error: 'Class not found' });
    }

    res.json({
      id: cls._id,
      name: cls.name,
      description: cls.description,
      instructor: cls.instructor,
      instructor_image_url: cls.instructor_image_url,
      class_image_url: cls.class_image_url,
      schedule: cls.schedule,
      duration: cls.duration,
      price: cls.price,
      spots_available: cls.spots_available,
      max_capacity: cls.max_capacity,
      difficulty_level: cls.difficulty_level,
      is_active: cls.is_active,
      created_at: cls.created_at
    });
  } catch (error) {
    console.error('Get class error:', error);
    res.status(500).json({ error: 'Failed to fetch class' });
  }
});

router.post('/', authenticateToken, async (req, res) => {
  try {
    if (!req.user.is_admin) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { name, description, instructor, instructor_image_url, class_image_url, schedule, duration, price, spots_available, max_capacity, difficulty_level } = req.body;
    const classesCollection = req.db.collection('available_classes');

    const result = await classesCollection.insertOne({
      name,
      description,
      instructor,
      instructor_image_url: instructor_image_url || '',
      class_image_url: class_image_url || '',
      schedule,
      duration,
      price,
      spots_available: spots_available || 10,
      max_capacity: max_capacity || 10,
      difficulty_level: difficulty_level || 'beginner',
      is_active: true,
      created_at: new Date()
    });

    res.status(201).json({
      message: 'Class created successfully',
      id: result.insertedId
    });
  } catch (error) {
    console.error('Create class error:', error);
    res.status(500).json({ error: 'Failed to create class' });
  }
});

export default router;
