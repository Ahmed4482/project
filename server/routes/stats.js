import express from 'express';
import { ObjectId } from 'mongodb';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticateToken, async (req, res) => {
  try {
    const statsCollection = req.db.collection('user_stats');
    let stats = await statsCollection.findOne({ user_id: new ObjectId(req.user.id) });

    if (!stats) {
      const result = await statsCollection.insertOne({
        user_id: new ObjectId(req.user.id),
        total_workouts: 0,
        calories_burned: 0,
        active_days: 0,
        current_streak: 0,
        updated_at: new Date()
      });

      stats = await statsCollection.findOne({ _id: result.insertedId });
    }

    res.json({
      id: stats._id,
      user_id: stats.user_id,
      total_workouts: stats.total_workouts,
      calories_burned: stats.calories_burned,
      active_days: stats.active_days,
      current_streak: stats.current_streak,
      updated_at: stats.updated_at
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

router.put('/', authenticateToken, async (req, res) => {
  try {
    const { total_workouts, calories_burned, active_days, current_streak } = req.body;
    const statsCollection = req.db.collection('user_stats');

    const result = await statsCollection.findOneAndUpdate(
      { user_id: new ObjectId(req.user.id) },
      {
        $set: {
          total_workouts: total_workouts !== undefined ? total_workouts : 0,
          calories_burned: calories_burned !== undefined ? calories_burned : 0,
          active_days: active_days !== undefined ? active_days : 0,
          current_streak: current_streak !== undefined ? current_streak : 0,
          updated_at: new Date()
        }
      },
      { returnDocument: 'after', upsert: true }
    );

    res.json({
      message: 'Stats updated successfully',
      stats: result.value
    });
  } catch (error) {
    console.error('Update stats error:', error);
    res.status(500).json({ error: 'Failed to update stats' });
  }
});

export default router;
