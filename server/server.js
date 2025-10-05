const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const authMiddleware = require('./middleware/auth');
const adminMiddleware = require('./middleware/admin');

const app = express();
const PORT = process.env.PORT || 5002;

// Development CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // In development, allow all origins
    if (process.env.NODE_ENV !== 'production') {
      console.log(`Allowing request from origin: ${origin}`);
      return callback(null, true);
    }

    // In production, only allow specific origins
    const allowedOrigins = [
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      'http://localhost:5002',
      'http://127.0.0.1:5002',
      'https://your-production-domain.com' // Replace with your production domain
    ];
    
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    console.warn(`Blocked request from origin: ${origin}`);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
    'Access-Control-Allow-Headers',
    'Access-Control-Request-Method',
    'Access-Control-Request-Headers',
    'X-Auth-Token',
    'X-Request-ID',
    'X-HTTP-Method-Override',
    'Cache-Control',
    'Pragma',
    'Expires'
  ],
  exposedHeaders: [
    'Content-Length',
    'Content-Type',
    'X-Request-ID',
    'X-Auth-Token'
  ],
  maxAge: 86400, // 24 hours
  preflightContinue: false,
  optionsSuccessStatus: 204
};

// Log all incoming requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  console.log('Headers:', req.headers);
  console.log('Query:', req.query);
  console.log('Body:', req.body);
  next();
});

// Apply CORS middleware
app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));

// Additional CORS headers (redundant but kept for compatibility)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Cache-Control, Pragma, Expires');
  res.header('Access-Control-Allow-Credentials', 'true');
  next();
});

app.use(express.json());

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/online-learning-platform';

// Silence strictQuery deprecation warning for Mongoose 7+
mongoose.set('strictQuery', false);

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch((err) => console.error('MongoDB connection error:', err));

// Import models
const User = require('./models/User');
const Course = require('./models/Course');
const Material = require('./models/Material');

// Routes

// Create or update user
app.post('/api/users', async (req, res) => {
  try {
    const { uid, email, displayName, photoURL } = req.body;
    
    // Check if user already exists
    let user = await User.findOne({ uid });
    
    if (user) {
      // Update last login time
      user.lastLoginAt = new Date();
      await user.save();
      return res.json({ message: 'User login updated', user });
    }
    
    // Determine role based on email - only admin gets special treatment
    let role = 'student'; // Default role for all new users
    if (email === 'iyyappan281105@gmail.com') {
      role = 'admin'; // Only this specific email gets admin role automatically
    }
    // All other users start as 'student' - admin can promote them later
    
    // Create new user with role
    user = new User({
      uid,
      email,
      displayName,
      photoURL,
      role,
      createdAt: new Date(),
      lastLoginAt: new Date()
    });
    
    await user.save();
    res.status(201).json({ message: 'User created successfully', user });
  } catch (error) {
    console.error('Error creating/updating user:', error);
    res.status(500).json({ error: 'Failed to create/update user' });
  }
});

// Get user by UID
app.get('/api/users/:uid', async (req, res) => {
  try {
    const user = await User.findOne({ uid: req.params.uid });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Update user profile
app.put('/api/users/:uid', async (req, res) => {
  try {
    const { uid } = req.params;
    const updateData = req.body;
    
    const user = await User.findOneAndUpdate(
      { uid },
      { $set: updateData },
      { new: true, runValidators: true }
    );
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ message: 'User updated successfully', user });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Update user role (admin only)
app.put('/api/users/:uid/role', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { uid } = req.params;
    const { role } = req.body;

    if (!['student', 'instructor', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const user = await User.findOneAndUpdate(
      { uid },
      { $set: { role } },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'User role updated successfully', user });
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({ error: 'Failed to update user role' });
  }
});

// Get all users (admin only)
app.get('/api/users', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const users = await User.find().select('-__v');
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Heartbeat to mark user active
app.post('/api/users/:uid/heartbeat', require('./middleware/auth'), async (req, res) => {
  try {
    const { uid } = req.params;
    // Only allow self or admin to mark
    if (req.user.uid !== uid) {
      const requester = await User.findOne({ uid: req.user.uid });
      if (!requester || requester.role !== 'admin') {
        return res.status(403).json({ error: 'Forbidden' });
      }
    }

    const user = await User.findOneAndUpdate(
      { uid },
      { $set: { lastActiveAt: new Date(), isActive: true } },
      { new: true }
    );
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ ok: true, lastActiveAt: user.lastActiveAt });
  } catch (error) {
    console.error('Error updating heartbeat:', error);
    res.status(500).json({ error: 'Failed to update heartbeat' });
  }
});

// User stats (admin)
app.get('/api/users-stats', async (req, res) => {
  try {
    const now = new Date();
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);

    const [total, activeCount, inactiveCount, recentLogins] = await Promise.all([
      User.countDocuments({}),
      User.countDocuments({ isActive: true }),
      User.countDocuments({ isActive: false }),
      User.countDocuments({ lastLoginAt: { $gte: fiveMinutesAgo } })
    ]);

    res.json({
      totalUsers: total,
      activeUsers: activeCount,
      inactiveUsers: inactiveCount,
      loginsLast5Min: recentLogins
    });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({ error: 'Failed to fetch user stats' });
  }
});

// Active users list (admin)
app.get('/api/users-active', async (req, res) => {
  try {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const users = await User.find({ lastActiveAt: { $gte: fiveMinutesAgo } })
      .select('uid email displayName lastActiveAt role');
    res.json(users);
  } catch (error) {
    console.error('Error fetching active users:', error);
    res.status(500).json({ error: 'Failed to fetch active users' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Online Learning Platform API is running',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Material routes
const materialRoutes = require('./routes/materialRoutes');
app.use('/api/materials', materialRoutes);

// Course routes
const courseRoutes = require('./routes/courseRoutes');
app.use('/api/courses', courseRoutes);

// Quiz routes
const quizRoutes = require('./routes/quizRoutes');
app.use('/api/quizzes', quizRoutes);

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});
