const mongoose = require('mongoose');
require('dotenv').config();

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/online-learning-platform';

// User Schema (same as in server.js)
const userSchema = new mongoose.Schema({
  uid: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  displayName: {
    type: String,
    required: true
  },
  photoURL: {
    type: String,
    default: null
  },
  role: {
    type: String,
    enum: ['student', 'instructor', 'admin'],
    default: 'student'
  },
  enrolledCourses: [{
    courseId: String,
    enrolledAt: {
      type: Date,
      default: Date.now
    },
    progress: {
      type: Number,
      default: 0
    }
  }],
  profile: {
    bio: String,
    skills: [String],
    learningGoals: [String],
    preferences: {
      notifications: {
        type: Boolean,
        default: true
      },
      theme: {
        type: String,
        enum: ['light', 'dark'],
        default: 'light'
      }
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastLoginAt: {
    type: Date,
    default: Date.now
  }
});

const User = mongoose.model('User', userSchema);

async function setupAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    // Get command line arguments
    const args = process.argv.slice(2);
    
    if (args.length < 1) {
      console.log('\n📋 Usage: node setup-admin.js <email>');
      console.log('Example: node setup-admin.js admin@example.com');
      console.log('\nThis will make the user with the specified email an admin.');
      console.log('The user must already exist in the database (they need to sign up first).\n');
      process.exit(1);
    }

    const email = args[0];

    // Find user by email
    const user = await User.findOne({ email });
    
    if (!user) {
      console.log(`❌ User with email "${email}" not found.`);
      console.log('Please make sure the user has signed up first.');
      process.exit(1);
    }

    // Update user role to admin
    user.role = 'admin';
    await user.save();

    console.log(`✅ Successfully made "${user.displayName}" (${email}) an admin!`);
    console.log(`   User ID: ${user.uid}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Created: ${user.createdAt.toLocaleDateString()}`);
    console.log(`   Last Login: ${user.lastLoginAt.toLocaleDateString()}`);
    
    console.log('\n🎉 Admin setup complete! The user can now access the admin panel at /admin');

  } catch (error) {
    console.error('❌ Error setting up admin:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

async function listUsers() {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    const users = await User.find().select('email displayName role createdAt lastLoginAt');
    
    if (users.length === 0) {
      console.log('No users found in the database.');
      return;
    }

    console.log('\n📊 Current Users:');
    console.log('================');
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.displayName} (${user.email})`);
      console.log(`   Role: ${user.role.toUpperCase()}`);
      console.log(`   Created: ${user.createdAt.toLocaleDateString()}`);
      console.log(`   Last Login: ${user.lastLoginAt.toLocaleDateString()}`);
      console.log('');
    });

  } catch (error) {
    console.error('❌ Error listing users:', error);
  } finally {
    await mongoose.disconnect();
  }
}

// Check if user wants to list users
if (process.argv.includes('--list') || process.argv.includes('-l')) {
  listUsers();
} else {
  setupAdmin();
}
