const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/online-learning-platform';
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const User = require('../models/User');

async function updateAdminRole() {
  try {
    const email = 'iyyappan281105@gmail.com';
    const result = await User.findOneAndUpdate(
      { email },
      { $set: { role: 'admin' } },
      { new: true, upsert: true }
    );
    
    console.log('Admin role updated successfully:');
    console.log(result);
    process.exit(0);
  } catch (error) {
    console.error('Error updating admin role:', error);
    process.exit(1);
  }
}

updateAdminRole();
