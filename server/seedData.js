const mongoose = require('mongoose');
const Course = require('./models/Course');
const Material = require('./models/Material');
const User = require('./models/User');

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/online-learning-platform';

async function seedDatabase() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    // Clear existing data
    console.log('Clearing existing data...');
    await Course.deleteMany({});
    await Material.deleteMany({});

    // Create a test instructor
    let instructor = await User.findOne({ email: 'instructor@example.com' });
    
    if (!instructor) {
      console.log('Creating test instructor...');
      instructor = new User({
        uid: 'test-instructor-123',
        email: 'instructor@example.com',
        displayName: 'Test Instructor',
        role: 'instructor'
      });
      await instructor.save();
    }

    // Create sample courses
    console.log('Creating sample courses...');
    const courses = [
      {
        title: 'Introduction to Programming',
        description: 'Learn the basics of programming with JavaScript',
        shortDescription: 'Start your coding journey with this beginner-friendly course',
        createdBy: instructor._id,
        instructor: instructor._id,
        category: 'programming',
        level: 'beginner',
        duration: 10,
        price: 0,
        thumbnail: 'https://via.placeholder.com/300x200',
        isPublished: true,
        isActive: true,
        tags: ['programming', 'javascript', 'beginner']
      },
      {
        title: 'Advanced Web Development',
        description: 'Master modern web development with React and Node.js',
        shortDescription: 'Build full-stack applications with the MERN stack',
        createdBy: instructor._id,
        instructor: instructor._id,
        category: 'programming',
        level: 'intermediate',
        duration: 30,
        price: 49.99,
        thumbnail: 'https://via.placeholder.com/300x200',
        isPublished: true,
        isActive: true,
        tags: ['web', 'react', 'node', 'mongodb', 'express']
      }
    ];

    const createdCourses = await Course.insertMany(courses);
    console.log(`Created ${createdCourses.length} courses`);

    // Create sample materials for the first course
    console.log('Creating sample materials...');
    const materials = [
      {
        title: 'Introduction to JavaScript',
        description: 'Learn the basics of JavaScript programming',
        type: 'video',
        contentUrl: 'https://www.youtube.com/watch?v=PkZNo7MFNFg',
        duration: 45,
        order: 1,
        course: createdCourses[0]._id,
        createdBy: instructor._id,
        isPublished: true,
        isFree: true,
        metadata: {
          provider: 'youtube',
          thumbnail: 'https://i.ytimg.com/vi/PkZNo7MFNFg/maxresdefault.jpg'
        }
      },
      {
        title: 'Variables and Data Types',
        description: 'Understanding variables and data types in JavaScript',
        type: 'article',
        content: 'In JavaScript, variables are used to store data values. There are several data types in JavaScript including String, Number, Boolean, Object, and more. Variables can be declared using `let`, `const`, or `var`.',
        duration: 20,
        order: 2,
        course: createdCourses[0]._id,
        createdBy: instructor._id,
        isPublished: true,
        isFree: true
      },
      {
        title: 'Introduction to React',
        description: 'Learn the basics of React',
        type: 'video',
        contentUrl: 'https://www.youtube.com/watch?v=w7ejDZ8SWv8',
        duration: 60,
        order: 1,
        course: createdCourses[1]._id,
        createdBy: instructor._id,
        isPublished: true,
        isFree: false,
        metadata: {
          provider: 'youtube',
          thumbnail: 'https://i.ytimg.com/vi/w7ejDZ8SWv8/maxresdefault.jpg'
        }
      }
    ];

    const createdMaterials = await Material.insertMany(materials);
    console.log(`Created ${createdMaterials.length} materials`);

    // Update courses with materials
    await Course.findByIdAndUpdate(createdCourses[0]._id, {
      $addToSet: { materials: { $each: createdMaterials.filter(m => m.course.equals(createdCourses[0]._id)).map(m => m._id) } }
    });

    await Course.findByIdAndUpdate(createdCourses[1]._id, {
      $addToSet: { materials: createdMaterials[2]._id }
    });

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
