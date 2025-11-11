import express from 'express';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const plansCollection = req.db.collection('plans');
    const plans = await plansCollection.find({}).toArray();

    if (!plans.length) {
      return res.json([]);
    }

    res.json(plans.map(plan => ({
      id: plan._id,
      name: plan.name,
      description: plan.description,
      price: plan.price,
      duration: plan.duration,
      features: plan.features || [],
      image_url: plan.image_url,
      is_popular: plan.is_popular,
      created_at: plan.created_at
    })));
  } catch (error) {
    console.error('Get plans error:', error);
    res.status(500).json({ error: 'Failed to fetch plans' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const plansCollection = req.db.collection('plans');
    const plan = await plansCollection.findOne({ _id: req.params.id });

    if (!plan) {
      return res.status(404).json({ error: 'Plan not found' });
    }

    res.json({
      id: plan._id,
      name: plan.name,
      description: plan.description,
      price: plan.price,
      duration: plan.duration,
      features: plan.features || [],
      image_url: plan.image_url,
      is_popular: plan.is_popular,
      created_at: plan.created_at
    });
  } catch (error) {
    console.error('Get plan error:', error);
    res.status(500).json({ error: 'Failed to fetch plan' });
  }
});

router.post('/', authenticateToken, async (req, res) => {
  try {
    if (!req.user.is_admin) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { name, description, price, duration, features, image_url, is_popular } = req.body;
    const plansCollection = req.db.collection('plans');

    const result = await plansCollection.insertOne({
      name,
      description,
      price,
      duration,
      features: features || [],
      image_url: image_url || '',
      is_popular: is_popular || false,
      created_at: new Date()
    });

    res.status(201).json({
      message: 'Plan created successfully',
      id: result.insertedId
    });
  } catch (error) {
    console.error('Create plan error:', error);
    res.status(500).json({ error: 'Failed to create plan' });
  }
});

export default router;
