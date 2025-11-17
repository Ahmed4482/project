import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import { MongoClient, ObjectId } from 'mongodb';
import authRoutes from './routes/auth.js';
import profileRoutes from './routes/profiles.js';
import planRoutes from './routes/plans.js';
import classRoutes from './routes/classes.js';
import bookingRoutes from './routes/bookings.js';
import chatRoutes from './routes/chat.js';
import statsRoutes from './routes/stats.js';
import paymentRoutes from './routes/payments.js';

const app = express();
const PORT = process.env.PORT || 5000;

let db;

// MongoDB Client with TLS/SSL options for Render compatibility
const mongoClient = new MongoClient(process.env.MONGODB_URI || 'mongodb://localhost:27017/smartfit', {
  // Connection pool settings
  maxPoolSize: 10,
  minPoolSize: 2,
  
  // Timeout settings
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 45000,
  connectTimeoutMS: 30000,
  
  // TLS/SSL settings for Render
  tls: true,
  tlsAllowInvalidCertificates: true,
  tlsAllowInvalidHostnames: true,
  
  // Retry settings
  retryWrites: true,
  retryReads: true,
  
  // Force IPv4
  family: 4,
  
  // Compression
  compressors: ['snappy', 'zlib']
});

// CORS Configuration - Updated to be more specific
app.use(cors({
  origin: [
    'http://localhost:5173', 
    'http://localhost:3000', 
    'http://localhost:5174',
    'https://smartfit-backend-jqk3.onrender.com', // Add this line
    process.env.FRONTEND_URL || '*'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 600
}));

// Handle preflight requests explicitly
app.options('*', cors());

// Body parsers with increased limits for base64 images
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Request logging middleware (helpful for debugging)
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  if (req.headers.authorization) {
    console.log('Auth header present:', req.headers.authorization.substring(0, 20) + '...');
  }
  next();
});

// Database middleware
app.use((req, res, next) => {
  req.db = db;
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/profiles', profileRoutes);
app.use('/api/plans', planRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/payments', paymentRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'Server is running',
    timestamp: new Date().toISOString(),
    database: db ? 'Connected' : 'Disconnected'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'SmartFit API is running!',
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

async function connectDB() {
  try {
    console.log('Attempting to connect to MongoDB...');
    await mongoClient.connect();
    
    // Verify connection
    await mongoClient.db('admin').command({ ping: 1 });
    
    db = mongoClient.db('smartfit');
    console.log('✓ Connected to MongoDB');
    console.log(`✓ Database: ${db.databaseName}`);

    await initializeCollections(db);

    // Start server only after successful DB connection
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`✓ Server running on port ${PORT}`);
      console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`✓ CORS enabled for development origins`);
    });
  } catch (error) {
    console.error('✗ Failed to connect to MongoDB:', error.message);
    
    // Log more details in production
    if (process.env.NODE_ENV === 'production') {
      console.error('Error details:', {
        name: error.name,
        code: error.code,
        message: error.message
      });
      
      // Retry connection after delay
      console.log('Retrying connection in 5 seconds...');
      setTimeout(connectDB, 5000);
    } else {
      process.exit(1);
    }
  }
}

async function initializeCollections(database) {
  const collections = await database.listCollections().toArray();
  const collectionNames = collections.map(c => c.name);

  const requiredCollections = [
    'users',
    'profiles', 
    'plans',
    'available_classes',
    'bookings',
    'user_stats',
    'chat_messages'
  ];

  for (const collectionName of requiredCollections) {
    if (!collectionNames.includes(collectionName)) {
      await database.createCollection(collectionName);
      console.log(`✓ Created collection: ${collectionName}`);
    }
  }

  await seedDatabase(database);
}

async function seedDatabase(database) {
  const plansCollection = database.collection('plans');
  const plansCount = await plansCollection.countDocuments();

  if (plansCount === 0) {
    const plans = [
      {
        _id: 'plan_1',
        name: 'Starter',
        description: 'Perfect for beginners starting their fitness journey',
        price: 29.99,
        duration: 'per month',
        features: ['Access to gym floor', 'Basic equipment', 'Locker access', 'Mobile app access'],
        image_url: 'https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg',
        is_popular: false,
        created_at: new Date()
      },
      {
        _id: 'plan_2',
        name: 'Pro',
        description: 'For serious athletes who want more',
        price: 59.99,
        duration: 'per month',
        features: ['All Starter features', 'Group classes', 'Personal trainer (2x/month)', 'Nutrition guidance', 'Priority booking'],
        image_url: 'https://images.pexels.com/photos/1552252/pexels-photo-1552252.jpeg',
        is_popular: true,
        created_at: new Date()
      },
      {
        _id: 'plan_3',
        name: 'Elite',
        description: 'Ultimate fitness experience with AI coaching',
        price: 99.99,
        duration: 'per month',
        features: ['All Pro features', 'Unlimited personal training', 'AI workout plans', 'Recovery sessions', 'VIP lounge access', 'Supplement plan'],
        image_url: 'https://images.pexels.com/photos/1954524/pexels-photo-1954524.jpeg',
        is_popular: false,
        created_at: new Date()
      }
    ];
    await plansCollection.insertMany(plans);
    console.log('✓ Seeded plans collection');
  }

  const classesCollection = database.collection('available_classes');
  const classesCount = await classesCollection.countDocuments();

  if (classesCount === 0) {
    const classes = [
      {
        name: 'HIIT Power Hour',
        description: 'High-intensity interval training for maximum calorie burn and endurance building',
        instructor: 'Sarah Johnson',
        instructor_image_url: 'https://images.pexels.com/photos/3768722/pexels-photo-3768722.jpeg',
        class_image_url: 'https://images.pexels.com/photos/4162491/pexels-photo-4162491.jpeg',
        schedule: 'Mon, Wed, Fri - 6:00 AM',
        duration: '60 min',
        price: 25.00,
        spots_available: 5,
        max_capacity: 15,
        difficulty_level: 'advanced',
        is_active: true,
        created_at: new Date()
      },
      {
        name: 'Yoga Flow',
        description: 'Mindful movement combining breath and flow for flexibility and stress relief',
        instructor: 'Michael Chen',
        instructor_image_url: 'https://images.pexels.com/photos/3764011/pexels-photo-3764011.jpeg',
        class_image_url: 'https://images.pexels.com/photos/3822906/pexels-photo-3822906.jpeg',
        schedule: 'Tue, Thu - 7:00 AM',
        duration: '45 min',
        price: 20.00,
        spots_available: 8,
        max_capacity: 12,
        difficulty_level: 'beginner',
        is_active: true,
        created_at: new Date()
      },
      {
        name: 'Strength & Conditioning',
        description: 'Build muscle and increase strength with progressive resistance training',
        instructor: 'David Rodriguez',
        instructor_image_url: 'https://images.pexels.com/photos/4944526/pexels-photo-4944526.jpeg',
        class_image_url: 'https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg',
        schedule: 'Mon, Wed, Fri - 5:00 PM',
        duration: '75 min',
        price: 30.00,
        spots_available: 3,
        max_capacity: 10,
        difficulty_level: 'intermediate',
        is_active: true,
        created_at: new Date()
      },
      {
        name: 'Spin Class',
        description: 'High-energy cycling workout with motivating music and interval training',
        instructor: 'Jessica Martinez',
        instructor_image_url: 'https://images.pexels.com/photos/3768730/pexels-photo-3768730.jpeg',
        class_image_url: 'https://images.pexels.com/photos/3757376/pexels-photo-3757376.jpeg',
        schedule: 'Mon, Wed, Fri - 6:00 AM',
        duration: '45 min',
        price: 22.00,
        spots_available: 5,
        max_capacity: 20,
        difficulty_level: 'intermediate',
        is_active: true,
        created_at: new Date()
      },
      {
        name: 'Boxing Bootcamp',
        description: 'Combine boxing techniques with cardio and strength training for a full-body workout',
        instructor: 'Marcus Thompson',
        instructor_image_url: 'https://images.pexels.com/photos/6455764/pexels-photo-6455764.jpeg',
        class_image_url: 'https://images.pexels.com/photos/4720268/pexels-photo-4720268.jpeg',
        schedule: 'Tue, Thu - 7:00 PM',
        duration: '60 min',
        price: 28.00,
        spots_available: 3,
        max_capacity: 12,
        difficulty_level: 'advanced',
        is_active: true,
        created_at: new Date()
      },
      {
        name: 'Pilates Core',
        description: 'Strengthen your core and improve posture with controlled movements',
        instructor: 'Emma Williams',
        instructor_image_url: 'https://images.pexels.com/photos/3768593/pexels-photo-3768593.jpeg',
        class_image_url: 'https://images.pexels.com/photos/4056723/pexels-photo-4056723.jpeg',
        schedule: 'Weekends - 9:00 AM',
        duration: '50 min',
        price: 24.00,
        spots_available: 8,
        max_capacity: 15,
        difficulty_level: 'beginner',
        is_active: true,
        created_at: new Date()
      }
    ];
    await classesCollection.insertMany(classes);
    console.log('✓ Seeded classes collection');
  }

  // Seed admin user
  const usersCollection = database.collection('users');
  const profilesCollection = database.collection('profiles');
  
  const adminExists = await usersCollection.findOne({ email: 'admin@gmail.com' });
  
  if (!adminExists) {
    try {
      const hashedPassword = await bcrypt.hash('admin', 10);
      const adminUserId = new ObjectId();

      await usersCollection.insertOne({
        _id: adminUserId,
        email: 'admin@gmail.com',
        password: hashedPassword,
        created_at: new Date()
      });

      await profilesCollection.insertOne({
        user_id: adminUserId,
        email: 'admin@gmail.com',
        full_name: 'Admin User',
        avatar_url: '',
        bio: 'System Administrator',
        fitness_goal: '',
        experience_level: 'expert',
        is_admin: true,
        created_at: new Date(),
        updated_at: new Date()
      });

      console.log('✓ Seeded admin user (admin@gmail.com / password: admin)');
    } catch (error) {
      console.error('✗ Error seeding admin user:', error);
    }
  } else {
    console.log('ℹ Admin user already exists');
  }
}

connectDB();

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\nShutting down gracefully...');
  try {
    await mongoClient.close();
    console.log('✓ MongoDB connection closed');
  } catch (error) {
    console.error('Error closing MongoDB connection:', error);
  }
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\nShutting down gracefully...');
  try {
    await mongoClient.close();
    console.log('✓ MongoDB connection closed');
  } catch (error) {
    console.error('Error closing MongoDB connection:', error);
  }
  process.exit(0);
});