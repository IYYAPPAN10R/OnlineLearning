const mongoose = require('mongoose');
const Course = require('../models/Course');
require('dotenv').config();

const sampleCourses = [
  {
    title: 'React Fundamentals',
    description: 'Learn the basics of React.js including components, state, props, and hooks. This comprehensive course covers everything you need to know to start building React applications.',
    shortDescription: 'Master React.js from the ground up with hands-on projects',
    instructor: 'John Doe',
    category: 'programming',
    level: 'beginner',
    duration: 8,
    price: 0,
    tags: ['react', 'javascript', 'frontend', 'web development'],
    materials: [
      {
        title: 'Introduction to React',
        description: 'Getting started with React development',
        filePath: 'sample-files/react-intro.pdf',
        fileType: 'pdf',
        fileSize: 1024000,
        duration: 30,
        order: 0,
        isPreview: true
      },
      {
        title: 'React Components Tutorial',
        description: 'Learn how to create and use React components',
        filePath: 'sample-files/react-components.mp4',
        fileType: 'video',
        fileSize: 52428800,
        duration: 45,
        order: 1,
        isPreview: false
      },
      {
        title: 'State and Props Guide',
        description: 'Understanding React state and props',
        filePath: 'sample-files/state-props.pdf',
        fileType: 'pdf',
        fileSize: 2048000,
        duration: 0,
        order: 2,
        isPreview: false
      }
    ],
    isPublished: true,
    isActive: true,
    createdBy: 'sample-user-id'
  },
  {
    title: 'Advanced JavaScript Concepts',
    description: 'Dive deep into advanced JavaScript concepts including closures, prototypes, async programming, and modern ES6+ features.',
    shortDescription: 'Master advanced JavaScript concepts and patterns',
    instructor: 'Jane Smith',
    category: 'programming',
    level: 'intermediate',
    duration: 12,
    price: 49.99,
    tags: ['javascript', 'advanced', 'es6', 'async', 'closures'],
    materials: [
      {
        title: 'Closures and Scope',
        description: 'Understanding JavaScript closures and lexical scope',
        filePath: 'sample-files/closures.pdf',
        fileType: 'pdf',
        fileSize: 1536000,
        duration: 0,
        order: 0,
        isPreview: true
      },
      {
        title: 'Async JavaScript Deep Dive',
        description: 'Promises, async/await, and modern async patterns',
        filePath: 'sample-files/async-js.mp4',
        fileType: 'video',
        fileSize: 73400320,
        duration: 60,
        order: 1,
        isPreview: false
      },
      {
        title: 'ES6+ Features Workshop',
        description: 'Modern JavaScript features and best practices',
        filePath: 'sample-files/es6-features.pdf',
        fileType: 'pdf',
        fileSize: 3072000,
        duration: 0,
        order: 2,
        isPreview: false
      }
    ],
    isPublished: true,
    isActive: true,
    createdBy: 'sample-user-id'
  },
  {
    title: 'UI/UX Design Principles',
    description: 'Learn the fundamental principles of user interface and user experience design. Create beautiful, functional designs that users love.',
    shortDescription: 'Master UI/UX design principles and create stunning interfaces',
    instructor: 'Mike Johnson',
    category: 'design',
    level: 'beginner',
    duration: 6,
    price: 29.99,
    tags: ['ui', 'ux', 'design', 'figma', 'user experience'],
    materials: [
      {
        title: 'Design Thinking Process',
        description: 'Introduction to design thinking methodology',
        filePath: 'sample-files/design-thinking.pdf',
        fileType: 'pdf',
        fileSize: 2560000,
        duration: 0,
        order: 0,
        isPreview: true
      },
      {
        title: 'Figma Tutorial Series',
        description: 'Complete Figma tutorial for beginners',
        filePath: 'sample-files/figma-tutorial.mp4',
        fileType: 'video',
        fileSize: 104857600,
        duration: 90,
        order: 1,
        isPreview: false
      },
      {
        title: 'Color Theory and Typography',
        description: 'Essential design principles for better UI',
        filePath: 'sample-files/color-typography.pdf',
        fileType: 'pdf',
        fileSize: 4096000,
        duration: 0,
        order: 2,
        isPreview: false
      }
    ],
    isPublished: true,
    isActive: true,
    createdBy: 'sample-user-id'
  },
  {
    title: 'Data Science with Python',
    description: 'Complete data science course covering Python, pandas, numpy, matplotlib, and machine learning basics.',
    shortDescription: 'Learn data science from scratch with Python',
    instructor: 'Sarah Wilson',
    category: 'data-science',
    level: 'intermediate',
    duration: 15,
    price: 79.99,
    tags: ['python', 'data science', 'pandas', 'numpy', 'machine learning'],
    materials: [
      {
        title: 'Python for Data Science',
        description: 'Python fundamentals for data analysis',
        filePath: 'sample-files/python-datascience.pdf',
        fileType: 'pdf',
        fileSize: 5120000,
        duration: 0,
        order: 0,
        isPreview: true
      },
      {
        title: 'Pandas Data Manipulation',
        description: 'Working with data using pandas library',
        filePath: 'sample-files/pandas-tutorial.mp4',
        fileType: 'video',
        fileSize: 157286400,
        duration: 120,
        order: 1,
        isPreview: false
      },
      {
        title: 'Data Visualization Guide',
        description: 'Creating charts and graphs with matplotlib',
        filePath: 'sample-files/data-viz.pdf',
        fileType: 'pdf',
        fileSize: 6144000,
        duration: 0,
        order: 2,
        isPreview: false
      }
    ],
    isPublished: true,
    isActive: true,
    createdBy: 'sample-user-id'
  }
];

async function seedCourses() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/online-learning-platform');
    console.log('Connected to MongoDB');

    // Clear existing courses
    await Course.deleteMany({});
    console.log('Cleared existing courses');

    // Insert sample courses
    const createdCourses = await Course.insertMany(sampleCourses);
    console.log(`Created ${createdCourses.length} sample courses`);

    // Display created courses
    createdCourses.forEach(course => {
      console.log(`- ${course.title} (${course.category}, ${course.level})`);
    });

    console.log('Sample courses seeded successfully!');
  } catch (error) {
    console.error('Error seeding courses:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the seed function if this file is executed directly
if (require.main === module) {
  seedCourses();
}

module.exports = seedCourses;
