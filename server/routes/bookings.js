import express from 'express';
import { ObjectId } from 'mongodb';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticateToken, async (req, res) => {
  try {
    const bookingsCollection = req.db.collection('bookings');
    const bookings = await bookingsCollection.find({ user_id: new ObjectId(req.user.id) }).toArray();

    if (!bookings.length) {
      return res.json([]);
    }

    res.json(bookings.map(booking => ({
      id: booking._id,
      user_id: booking.user_id,
      class_name: booking.class_name,
      instructor: booking.instructor,
      date: booking.date,
      duration: booking.duration,
      status: booking.status,
      payment_status: booking.payment_status,
      payment_amount: booking.payment_amount,
      payment_method: booking.payment_method,
      notes: booking.notes,
      instructor_image_url: booking.instructor_image_url,
      class_image_url: booking.class_image_url,
      created_at: booking.created_at
    })));
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

router.post('/', authenticateToken, async (req, res) => {
  try {
    const { class_name, instructor, date, duration, payment_amount, payment_method, instructor_image_url, class_image_url } = req.body;
    const bookingsCollection = req.db.collection('bookings');

    const result = await bookingsCollection.insertOne({
      user_id: new ObjectId(req.user.id),
      class_name,
      instructor,
      date: new Date(date),
      duration,
      status: 'upcoming',
      payment_status: 'pending',
      payment_amount,
      payment_method: payment_method || 'card',
      notes: '',
      instructor_image_url: instructor_image_url || '',
      class_image_url: class_image_url || '',
      created_at: new Date()
    });

    res.status(201).json({
      message: 'Booking created successfully',
      id: result.insertedId
    });
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({ error: 'Failed to create booking' });
  }
});

router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { status, payment_status, notes } = req.body;
    const bookingsCollection = req.db.collection('bookings');

    const result = await bookingsCollection.findOneAndUpdate(
      { _id: new ObjectId(req.params.id), user_id: new ObjectId(req.user.id) },
      {
        $set: {
          status: status || 'upcoming',
          payment_status: payment_status || 'pending',
          notes: notes || ''
        }
      },
      { returnDocument: 'after' }
    );

    if (!result.value) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    res.json({
      message: 'Booking updated successfully',
      booking: result.value
    });
  } catch (error) {
    console.error('Update booking error:', error);
    res.status(500).json({ error: 'Failed to update booking' });
  }
});

router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const bookingsCollection = req.db.collection('bookings');

    const result = await bookingsCollection.deleteOne({
      _id: new ObjectId(req.params.id),
      user_id: new ObjectId(req.user.id)
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    res.json({ message: 'Booking cancelled successfully' });
  } catch (error) {
    console.error('Delete booking error:', error);
    res.status(500).json({ error: 'Failed to cancel booking' });
  }
});

export default router;
