const mongoose = require('mongoose');

async function testMongo() {
  try {
    console.log('Connecting to MongoDB...');
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/online-learning-platform';
    
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('Successfully connected to MongoDB');
    
    // List all collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Collections in database:');
    console.log(collections.map(c => c.name));
    
    // Check if users collection exists
    if (collections.some(c => c.name === 'users')) {
      const User = require('./models/User');
      const userCount = await User.countDocuments();
      console.log(`Found ${userCount} users in the database`);
    }
    
    // Check if courses collection exists
    if (collections.some(c => c.name === 'courses')) {
      const Course = require('./models/Course');
      const courseCount = await Course.countDocuments();
      console.log(`Found ${courseCount} courses in the database`);
      
      if (courseCount > 0) {
        console.log('Sample course:');
        const sampleCourse = await Course.findOne().lean();
        console.log(JSON.stringify(sampleCourse, null, 2));
      }
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

testMongo();
